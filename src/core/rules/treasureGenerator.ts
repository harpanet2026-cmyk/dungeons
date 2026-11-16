import { Coins } from '../types/dnd';

export interface LootItem {
  id: string;
  name: string;
  type: 'gema' | 'arte' | 'pocao' | 'pergaminho' | 'item_magico';
  valuePo: number;
  description: string;
}

export interface GeneratedTreasure {
  coins: Coins;
  totalValuePo: number;
  items: LootItem[];
  narrativeSummary: string;
}

const COMMON_GEMS = [
  { name: 'Ágata Olho de Tigre', value: 10, desc: 'Pedra marrom dourada com reflexos sedosos.' },
  { name: 'Malaquita Polida', value: 10, desc: 'Pedra opaca verde-floresta com anéis escuros.' },
  { name: 'Turquesa Translúcida', value: 10, desc: 'Azul-esverdeada com pequenos veios de cobre.' },
  { name: 'Pedra da Lua', value: 50, desc: 'Gema branca leitosa com luminescência azulada sutil.' },
  { name: 'Jaspe Vermelho Sangue', value: 50, desc: 'Mineral opaco de cor carmesim profundo.' },
  { name: 'Ametista Lapidada', value: 100, desc: 'Cristal púrpura facetado e brilhante.' },
  { name: 'Granada de Fogo', value: 100, desc: 'Pedra vermelha translúcida brilhando como brasa.' },
  { name: 'Safira Estrelada', value: 500, desc: 'Safira azul profundo exibindo uma estrela de seis pontas sob a luz.' },
  { name: 'Diamante Bruto', value: 500, desc: 'Pedra límpida e dura, essencial para conjuração de magias vitais.' }
];

const ART_OBJECTS = [
  { name: 'Cálice de Prata Entalhado com Dragões', value: 25, desc: 'Taça nobre ornamentada das antigas cortes.' },
  { name: 'Estatueta de Marfim de um Elfo Guerreiro', value: 25, desc: 'Escultura delicada com mais de três séculos.' },
  { name: 'Adaga Cerimonial com Cabo de Ouro e Pérola', value: 100, desc: 'Lâmina prateada sem corte prático, mas de beleza estonteante.' },
  { name: 'Espelho de Bolso de Prata com Moldura de Rosas', value: 100, desc: 'Vidro polido sem manchas com aroma suave de lavanda antiga.' },
  { name: 'Coroa de Bronze Ancestral com Pequenas Gemas', value: 250, desc: 'Símbolo de realeza de um clã de anões esquecido.' }
];

const MAGIC_ITEMS = [
  { name: 'Poção de Cura Simples (2d4 + 2)', value: 50, type: 'pocao' as const, desc: 'Líquido vermelho rubi cintilante que recupera HP.' },
  { name: 'Poção de Cura Maior (4d4 + 4)', value: 150, type: 'pocao' as const, desc: 'Líquido rubi encorpado com cheiro doce de amêndoas.' },
  { name: 'Pergaminho de Proteção contra o Mal', value: 100, type: 'pergaminho' as const, desc: 'Pergaminho sagrado que afasta mortos-vivos e íncubos.' },
  { name: 'Pergaminho de Bola de Fogo', value: 200, type: 'pergaminho' as const, desc: 'Runas flamejantes gravadas em pergaminho resistente ao calor.' },
  { name: 'Manto de Proteção (+1 CA e Salvaguardas)', value: 400, type: 'item_magico' as const, desc: 'Tecido fino que emana um campo invisível de deflexão.' },
  { name: 'Botas de Caminhar nas Paredes', value: 350, type: 'item_magico' as const, desc: 'Permite caminhar em paredes e tetos como se fossem chão plano.' },
  { name: 'Espada Longa +1 (Brilho da Alvorada)', value: 500, type: 'item_magico' as const, desc: 'Lâmina rúnica que concede +1 no ataque e dano e emite luz sob comando.' }
];

export class TreasureGenerator {
  static generateLoot(totalCr: number, isHoard: boolean = false): GeneratedTreasure {
    const coins: Coins = { pc: 0, pp: 0, pe: 0, po: 0, pl: 0 };
    const items: LootItem[] = [];

    if (totalCr <= 4) {
      if (!isHoard) {
        // Individual CR 0-4
        coins.pp = Math.floor(Math.random() * 20) + 10;
        coins.po = Math.floor(Math.random() * 15) + 5;
      } else {
        // Hoard CR 0-4
        coins.pc = (Math.floor(Math.random() * 6) + 1) * 100;
        coins.pp = (Math.floor(Math.random() * 6) + 1) * 50;
        coins.po = (Math.floor(Math.random() * 6) + 1) * 30;

        // 1 a 3 gemas ou arte
        const numGems = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numGems; i++) {
          const gem = COMMON_GEMS[Math.floor(Math.random() * 5)];
          items.push({
            id: `loot_${Date.now()}_${i}`,
            name: gem.name,
            type: 'gema',
            valuePo: gem.value,
            description: gem.desc
          });
        }

        // 1 item consumível mágico
        const magic = MAGIC_ITEMS[Math.floor(Math.random() * 3)];
        items.push({
          id: `loot_magic_${Date.now()}`,
          name: magic.name,
          type: magic.type,
          valuePo: magic.value,
          description: magic.desc
        });
      }
    } else if (totalCr <= 10) {
      if (!isHoard) {
        coins.pp = (Math.floor(Math.random() * 10) + 1) * 10;
        coins.po = (Math.floor(Math.random() * 10) + 1) * 15;
      } else {
        coins.pp = (Math.floor(Math.random() * 6) + 1) * 200;
        coins.po = (Math.floor(Math.random() * 6) + 1) * 100;
        coins.pl = Math.floor(Math.random() * 10) + 2;

        const numArt = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < numArt; i++) {
          const art = ART_OBJECTS[Math.floor(Math.random() * ART_OBJECTS.length)];
          items.push({
            id: `loot_art_${Date.now()}_${i}`,
            name: art.name,
            type: 'arte',
            valuePo: art.value,
            description: art.desc
          });
        }

        // 1 a 2 itens mágicos
        const magic = MAGIC_ITEMS[Math.floor(Math.random() * MAGIC_ITEMS.length)];
        items.push({
          id: `loot_magic_${Date.now()}`,
          name: magic.name,
          type: magic.type,
          valuePo: magic.value,
          description: magic.desc
        });
      }
    } else {
      // Alto Nível (CR 11+)
      coins.po = (Math.floor(Math.random() * 10) + 5) * 100;
      coins.pl = (Math.floor(Math.random() * 8) + 2) * 10;

      for (let i = 0; i < 3; i++) {
        const gem = COMMON_GEMS[Math.floor(Math.random() * COMMON_GEMS.length)];
        items.push({
          id: `loot_high_${Date.now()}_${i}`,
          name: gem.name,
          type: 'gema',
          valuePo: gem.value,
          description: gem.desc
        });
      }

      const magic = MAGIC_ITEMS[MAGIC_ITEMS.length - 1]; // Item raro
      items.push({
        id: `loot_rare_${Date.now()}`,
        name: magic.name,
        type: magic.type,
        valuePo: magic.value,
        description: magic.desc
      });
    }

    // Calcula total aproximado em PO
    const itemsTotal = items.reduce((acc, it) => acc + it.valuePo, 0);
    const coinsTotal = (coins.pc / 100) + (coins.pp / 10) + (coins.pe / 2) + coins.po + (coins.pl * 10);
    const totalValuePo = Math.round(itemsTotal + coinsTotal);

    let narrativeSummary = `Encontrado um saque contendo ${coins.po} moedas de ouro, ${coins.pp} de prata`;
    if (coins.pl > 0) narrativeSummary += ` e ${coins.pl} de platina`;
    if (items.length > 0) narrativeSummary += `, além de ${items.map(it => it.name).join(', ')}.`;

    return {
      coins,
      totalValuePo,
      items,
      narrativeSummary
    };
  }
}
