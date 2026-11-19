/**
 * Script de Validação e Healthcheck da Google Gemini API
 * Testa o endpoint v1beta com o modelo gemini-3.8-flash
 */
import fs from 'fs';
import path from 'path';

// Carrega variáveis do arquivo .env manualmente caso dotenv não esteja instalado
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

loadEnv();

const API_KEY = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.argv[2] || '').trim();
const MODEL = (process.argv[3] || 'gemini-3.8-flash').replace(/^models\//, '').trim();
const API_VERSION = 'v1beta';

async function runHealthcheck() {
  console.log('====================================================');
  console.log('   TESTE DE VALIDAÇÃO DA GOOGLE GEMINI API');
  console.log('====================================================');
  console.log(`• Modelo: ${MODEL}`);
  console.log(`• Endpoint: /${API_VERSION}/models/${MODEL}:generateContent`);
  console.log(`• Chave configurada: ${API_KEY ? `SIM (${API_KEY.slice(0, 6)}...${API_KEY.slice(-4)})` : 'NÃO ENCONTRADA'}`);
  console.log('----------------------------------------------------');

  if (!API_KEY) {
    console.warn('\n[AVISO] Nenhuma chave encontrada em GEMINI_API_KEY ou .env.');
    console.log('Para testar via linha de comando, execute:');
    console.log('  node test-gemini.mjs SUA_CHAVE_AQUI\n');
    process.exit(0);
  }

  const url = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL}:generateContent?key=${API_KEY}`;
  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: 'Responda apenas: OK' }]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 15
    }
  };

  console.log('Enviando prompt mínimo: "Responda apenas: OK"...\n');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const status = response.status;
    const statusText = response.statusText;
    const data = await response.json().catch(() => ({}));

    console.log(`Status HTTP: ${status} ${statusText}`);

    if (response.ok) {
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      console.log('✓ Retorno da API: HTTP 200 OK');
      console.log(`✓ Resposta do modelo: "${text}"`);
      console.log('\n[SUCESSO] A integração com o modelo gemini-3.8-flash está 100% operacional!');
    } else {
      console.error(`✗ Erro da API: HTTP ${status}`);
      console.error('Detalhes do erro:', JSON.stringify(data, null, 2));
      process.exit(1);
    }
  } catch (err) {
    console.error('✗ Erro de rede ou execução:', err.message);
    process.exit(1);
  }
}

runHealthcheck();
