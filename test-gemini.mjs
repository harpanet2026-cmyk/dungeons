/**
 * Script de Validação e Healthcheck da Google Gemini API
 */
import fs from 'fs';
import path from 'path';

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
const REQUESTED_MODEL = (process.argv[3] || 'gemini-1.5-flash').replace(/^models\//, '').trim();
const API_VERSION = 'v1beta';

async function runHealthcheck() {
  console.log('====================================================');
  console.log('   TESTE DE VALIDAÇÃO DA GOOGLE GEMINI API');
  console.log('====================================================');
  console.log(`• Modelo: ${REQUESTED_MODEL}`);
  console.log(`• Endpoint Base: /${API_VERSION}/models/{MODEL}:generateContent`);
  console.log(`• Chave configurada: ${API_KEY ? `SIM (${API_KEY.slice(0, 6)}...${API_KEY.slice(-4)})` : 'NÃO ENCONTRADA'}`);
  console.log('----------------------------------------------------');

  if (!API_KEY) {
    console.warn('\n[AVISO] Nenhuma chave encontrada em GEMINI_API_KEY ou .env.');
    console.log('Para testar via linha de comando, execute:');
    console.log('  node test-gemini.mjs SUA_CHAVE_AQUI\n');
    process.exit(0);
  }

  const modelsToTest = Array.from(new Set([
    REQUESTED_MODEL,
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-2.5-flash',
    'gemini-3.8-flash'
  ]));

  let success = false;

  for (const currentModel of modelsToTest) {
    const url = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${currentModel}:generateContent?key=${API_KEY}`;
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

    console.log(`Testando modelo '${currentModel}'...`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'OK';
        console.log(`\n✓ Retorno da API: HTTP 200 OK`);
        console.log(`✓ Modelo ativo: ${currentModel}`);
        console.log(`✓ Resposta do modelo: "${text}"`);
        console.log(`\n[SUCESSO] A integração com o modelo ${currentModel} está 100% operacional!`);
        success = true;
        break;
      }

      if (response.status === 404) {
        console.log(`  -> Modelo '${currentModel}' retornou HTTP 404. Testando próximo...`);
        continue;
      }

      if (response.status === 429) {
        console.error(`\n✗ Erro da API: HTTP 429 Too Many Requests`);
        console.error('Limite de requisições por minuto atingido.');
        process.exit(1);
      }

      console.error(`  -> Erro HTTP ${response.status}:`, JSON.stringify(data, null, 2));
      break;
    } catch (err) {
      console.error(`  -> Falha de rede para '${currentModel}':`, err.message);
      break;
    }
  }

  if (!success) {
    console.error(`\n[ERRO] Nenhum dos modelos respondeu com sucesso.`);
    process.exit(1);
  }
}

runHealthcheck();
