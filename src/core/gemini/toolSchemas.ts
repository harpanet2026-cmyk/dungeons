/**
 * Declaração de ferramentas (Tool Calling / Function Calling) no formato do Google Gemini API.
 * Se o usuário conectar o Gemini via API, o modelo pode invocar essas funções diretamente!
 */
export const GEMINI_TOOLS_DECLARATION = {
  functionDeclarations: [
    {
      name: 'roll_d20_check',
      description: 'Executa um teste de atributo, perícia ou salvaguarda para um personagem segundo as regras estritas de D&D 5e.',
      parameters: {
        type: 'OBJECT',
        properties: {
          character_name: {
            type: 'STRING',
            description: 'Nome exato do personagem que está realizando o teste.'
          },
          check_type: {
            type: 'STRING',
            description: 'Tipo de teste: nome da perícia (ex: percepcao, atletismo) ou atributo para salvaguarda (ex: for, des, sab).'
          },
          advantage_mode: {
            type: 'STRING',
            enum: ['normal', 'vantagem', 'desvantagem'],
            description: 'Se o teste tem vantagem (rola 2d20 e pega o maior) ou desvantagem (pega o menor).'
          },
          target_dc: {
            type: 'INTEGER',
            description: 'A Classe de Dificuldade (CD) do teste estipulada pelo Mestre (ex: 10 para fácil, 15 para médio, 20 para difícil).'
          }
        },
        required: ['character_name', 'check_type']
      }
    },
    {
      name: 'apply_damage',
      description: 'Aplica dano a um personagem, absorvendo primeiro pontos de vida temporários e depois HP real. Avalia inconsciência se chegar a 0 HP.',
      parameters: {
        type: 'OBJECT',
        properties: {
          character_name: {
            type: 'STRING',
            description: 'Nome do personagem que está sofrendo o dano.'
          },
          amount: {
            type: 'INTEGER',
            description: 'Quantidade numérica total de dano sofrido.'
          },
          damage_type: {
            type: 'STRING',
            description: 'Tipo de dano (ex: fogo, cortante, perfurante, concussão, necrótico, psíquico).'
          }
        },
        required: ['character_name', 'amount']
      }
    },
    {
      name: 'heal_character',
      description: 'Recupera pontos de vida de um personagem até o valor máximo de HP.',
      parameters: {
        type: 'OBJECT',
        properties: {
          character_name: {
            type: 'STRING',
            description: 'Nome do personagem curado.'
          },
          amount: {
            type: 'INTEGER',
            description: 'Quantidade de pontos de vida a restaurar.'
          }
        },
        required: ['character_name', 'amount']
      }
    },
    {
      name: 'spend_spell_slot',
      description: 'Gasta um espaço de magia de um determinado círculo/nível para o personagem.',
      parameters: {
        type: 'OBJECT',
        properties: {
          character_name: {
            type: 'STRING',
            description: 'Nome do conjurador.'
          },
          spell_level: {
            type: 'INTEGER',
            description: 'Nível do espaço de magia gasto (1 a 9).'
          }
        },
        required: ['character_name', 'spell_level']
      }
    },
    {
      name: 'set_condition',
      description: 'Aplica ou remove uma condição de status (ex: Envenenado, Caído, Cego, Paralisado).',
      parameters: {
        type: 'OBJECT',
        properties: {
          character_name: {
            type: 'STRING',
            description: 'Nome do personagem afetado.'
          },
          condition: {
            type: 'STRING',
            description: 'Nome da condição (Cego, Enfeitiçado, Envenenado, Caído, etc.).'
          },
          active: {
            type: 'BOOLEAN',
            description: 'True para aplicar a condição, False para remover.'
          }
        },
        required: ['character_name', 'condition', 'active']
      }
    },
    {
      name: 'get_party_status',
      description: 'Consulta o estado em tempo real de todo o grupo (HP atual, CA, espaços de magia restantes e condições ativas).',
      parameters: {
        type: 'OBJECT',
        properties: {}
      }
    }
  ]
};
