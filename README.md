# ⚔️ Dungeons & Gemini — Software de Criação, Análise e Gestão de D&D 5e para Gemini Pro

Este software foi projetado para atuar como o **Motor Determinístico de Regras de D&D 5ª Edição**, servindo de copiloto ideal para campanhas narradas pelo **Gemini Pro**.

O Gemini Pro atua com maestria na interpretação dramática, diálogos de NPCs e descrição de cenários, enquanto este software garante precisão matemática estrita, persistência de estado e calibração de regras oficiais com base nos manuais:
* **[Regras Básicas dos Jogadores (5e)](dd-5e-regras-basicas-dos-jogadores-biblioteca-elfica.pdf)**
* **[Guia do Mestre (5e)](dd-5e-guia-do-mestre-biblioteca-elfica.pdf)**

---

## 🚀 Como Executar o Software

Para iniciar a interface web interativa localmente:

```bash
npm run dev
```

Acesse no seu navegador: **`http://localhost:5173`**

Para gerar o build de produção otimizado:
```bash
npm run build
```

---

## 🛠️ Funcionalidades Principais

### 1. 🛡️ Mesa de Jogo & Ficha Interativa (Live Session Tracker)
* **Controle Rigoroso de Vida:** Dano aplicado absorve primeiro Pontos de Vida Temporários e depois HP real. Ao chegar a 0 HP, o herói ganha automaticamente a condição *Inconsciente*.
* **Gestão de Espaços de Magia (Spell Slots):** Círculos de 1º a 9º nível com alternância visual de gastos e recuperação.
* **Condições da 5e:** Cego, Enfeitiçado, Envenenado, Caído, Paralisado, Inconsciente, etc. com alertas visuais.
* **Rolador de Dados D20 com Vantagem / Desvantagem:** Executa testes de perícias e salvaguardas somando automaticamente os modificadores de atributos e proficiências.
* **Descanso Longo Global:** Restaura instantaneamente todos os pontos de vida, recupera dados de vida e reseta os espaços de magia de todo o grupo.

### 2. 📊 Análise Tática & Calibração do Mestre (Guia do Mestre Cap. 3)
* **Calculadora de Orçamento de XP do Grupo:** Calcula os limiares exatos de encontro do grupo (**Fácil, Médio, Difícil, Mortal** e **Orçamento Diário de Aventura**) somando a tabela oficial do DMG por nível de personagem.
* **Simulador de Dificuldade de Encontro:** O Mestre insere a quantidade e o XP dos monstros e o software calcula o multiplicador de horda e classifica a ameaça em tempo real.
* **Radar de Funções do Grupo (Role Coverage):** Pontuação de Linha de Frente (Tank), Dano Sustentado (DPS), Suporte & Cura, Controle de Grupo (CC), Utilitário e Sentidos.
* **Diagnóstico de Vulnerabilidades:** Detecta automaticamente a ausência de curadores, fragilidade defensiva, falta de visão no escuro ou baixa percepção passiva.

### 3. 🧙‍♂️ Central de Integração com o Gemini Pro (Prompt & Tool Bridge)
* **Dossiê Narrativo da Campanha:** Gera um System Prompt completo em Markdown com o perfil de cada herói (Ideais, Vínculos, Defeitos, Segredos e Ganchos Pessoais) pronto para copiar e colar no Google AI Studio ou Gemini Web.
* **Instantâneo de Combate (Combat Snapshot):** Resumo compacto de combate (1 linha por herói com HP, CA, Percepção Passiva, Condições e Slots) para atualizar o Gemini rodada a rodada sem gastar tokens desnecessários.
* **Esquemas de Tool Calling (Function Calling):** Esquema JSON formal para as funções `roll_d20_check`, `apply_damage`, `heal_character`, `spend_spell_slot`, `set_condition` e `get_party_status` prontas para a API do Gemini.
* **Chat Mestre Integrado:** Permite inserir uma chave de API do Gemini para conversar diretamente na interface e ter o Gemini narrando as ações com injeção automática de contexto.

### 4. ➕ Criador de Personagens Passo-a-Passo
* Criação de personagens baseada nas classes, raças e antecedentes do SRD 5e.
* Suporte a Conjunto Padrão (Standard Array) ou rolagem personalizada.
* Aplicação automática de bônus raciais de atributos, cálculo de HP por dado de vida + CON e Classe de Armadura baseada no tipo de armadura e destreza.
