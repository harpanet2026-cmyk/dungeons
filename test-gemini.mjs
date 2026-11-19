/**
 * Script de Validação e Healthcheck da Google Gemini API
 * Testa o endpoint v1beta com modelo padrão e cascata de fallback automática
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
const REQUESTED_MODEL = (process.argv[3] || 'gemini-3.8-flash').replace(/^models\//, '').trim();
const API_VERSION = 'v1beta';

async function runHealthcheck() {
  console.log('====================================================');
  console.log('   TESTE DE VALIDAÇÃO DA GOOGLE GEMINI API');
  console.log('====================================================');
  console.log(`• Modelo Solicitado: ${REQUESTED_MODEL}`);
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
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
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
        console.log(`✓ Modelo respondendo: ${currentModel}`);
        console.log(`✓ Resposta do modelo: "${text}"`);

        if (currentModel !== REQUESTED_MODEL) {
          console.log(`\n[INFO] O modelo inicial '${REQUESTED_MODEL}' retornou 404 (indisponível no Google AI Studio), mas o fallback para '${currentModel}' funcionou perfeitamente!`);
        } else {
          console.log(`\n[SUCESSO] A integração com o modelo ${currentModel} está 100% operacional!`);
        }

        success = true;
        break;
      }

      if (response.status === 404) {
        console.log(`  -> Modelo '${currentModel}' retornou HTTP 404 (Não Encontrado). Tentando próximo da lista...`);
        continue;
      }

      if (response.status === 429) {
        console.error(`\n✗ Erro da API: HTTP 429 Too Many Requests`);
        console.error('Limite de requisições atingido na chave gratuita. Aguarde cerca de 30-60 segundos e tente novamente.');
        process.exit(1);
      }

      console.error(`  -> Erro no modelo '${currentModel}': HTTP ${response.status} ${response.statusText}`);
      console.error('Detalhes do erro:', JSON.stringify(data, null, 2));
      break;
    } catch (err) {
      console.error(`  -> Falha de rede para '${currentModel}':`, err.message);
      break;
    }
  }

  if (!success) {
    console.error(`\n[ERRO] Nenhum dos modelos (${modelsToTest.join(', ')}) respondeu com sucesso.`);
    console.log('Consultando modelos disponíveis para a sua chave...');
    try {
      const listResp = await fetch(`https://generativelanguage.googleapis.com/${API_VERSION}/models?key=${API_KEY}`);
      if (listResp.ok) {
        const listData = await listResp.json();
        const available = (listData.models || [])
          .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
          .map(m => m.name.replace(/^models\//, ''));
        console.log('Modelos com suporte a generateContent para esta chave:');
        available.forEach(m => console.log(`  - ${m}`));
      }
    } catch {}
    process.exit(1);
  }
}

runHealthcheck();
