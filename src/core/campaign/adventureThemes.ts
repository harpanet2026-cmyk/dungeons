export interface AdventureTheme {
  id: string;
  title: string;
  icon: string;
  shortDesc: string;
  tone: string;
  suggestedEnemies: string[];
  defaultDossier: string;
}

export const ADVENTURE_THEMES: AdventureTheme[] = [
  {
    id: 'undead_plague',
    title: 'A Praga dos Mortos-Vivos & A Cripta de Orcus',
    icon: '💀',
    shortDesc: 'Névoas gélidas, cemitérios profanados, mortos-vivos vorazes e um culto necromântico despertando um Lich ancestral.',
    tone: 'Horror Gótico, Suspense e Desespero Tático',
    suggestedEnemies: ['Esqueleto Legionário', 'Zumbi Pútrido', 'Carniçal (Ghoul)', 'Lich Arquimago'],
    defaultDossier: `[DOSSIÊ DE CAMPANHA: A PRAGA DOS MORTOS-VIVOS & A CRIPTA DE ORCUS]
• Título da Campanha: O Sussurro da Cripta Esquecida
• Cenário: O Vale de Cinzas Sombrias e as Catacumbas Subterrâneas de Kar-Drakor.
• Tom Narrativo: Opressivo, frio, com névoas densas, cheiro de terra molhada e velas tremeluzentes. A sobrevivência e os suprimentos são cruciais.
• Antagonista Principal: Valdorak, o Necromante da Foice Negra, que busca um artefato de Orcus para drenar a vitalidade de todo o vale e erguer um exército eterno de esqueletos e zumbis.
• Gancho Inicial: Os heróis chegam ao vilarejo de Pedra-da-Vigília durante uma noite sem estrelas. O sino da capela toca freneticamente: mortos-vivos romperam os portões do cemitério e estão cercando os camponeses na cripta central.
• Locais Notáveis:
  1. A Capela de Pedra-da-Vigília: Último refúgio dos sobreviventes, protegida por um círculo de sal enfraquecido.
  2. O Cemitério dos Soldados Esquecidos: Túmulos revirados com marcas de garras e sombras que se movem na névoa.
  3. O Mausoléu de Kar-Drakor: Entrada subterrânea adornada com crânios que exalam um brilho esmeralda profano.
• Segredo / Reviravolta Oculta: O próprio sacerdote local é quem forneceu as chaves das catacumbas após ser chantageado por Valdorak.`
  },
  {
    id: 'cosmic_horror_mindflayers',
    title: 'Sussurros nas Sombras & O Culto Ilithid',
    icon: '🐙',
    shortDesc: 'Terror psicológico, paranoia na nobreza, parasitas psíquicos e Devoradores de Mentes escavando os subterrâneos.',
    tone: 'Terror Psicológico, Conspiração e Mistério Arcano',
    suggestedEnemies: ['Devorador de Mentes (Mind Flayer)', 'Beholder (Observador)', 'Cubo Gelatinoso'],
    defaultDossier: `[DOSSIÊ DE CAMPANHA: SUSSURROS NAS SOMBRAS & O CULTO ILITHID]
• Título da Campanha: O Eco da Mente Coletiva
• Cenário: As galerias subterrâneas de Oakhaven e o enclave psíquico de Nautiloid nas profundezas do Subterrâneo.
• Tom Narrativo: Paranoico, claustrofóbico, com zumbidos mentais constantes, pesadelos compartilhados e alucinações. Ninguém é confiável.
• Antagonista Principal: Xylok, o Ulitharid de Tentáculos Púrpuras, guiando um Cérebro Ancião adormecido que se alimenta dos pensamentos e memórias roubadas de diplomatas e conjuradores.
• Gancho Inicial: Um importante conselheiro da corte é encontrado vagando pelas docas falando em línguas ininteligíveis, com a cabeça envolta em bandagens ensanguentadas e sem qualquer lembrança das últimas duas semanas.
• Locais Notáveis:
  1. A Mansão dos Espelhos: Onde nobres influenciados por feitiços psíquicos realizam reuniões à meia-noite.
  2. As Fendas do Abismo Cinzento: Túneis verticais de onde emanam ondas de pulso telepatia dolorosas.
  3. A Câmara do Cérebro Flutuante: Sala úmida repleta de tanques de salmoura e crânios dissecados.
• Segredo / Reviravolta Oculta: Um dos membros de apoio do grupo começa a receber visões que parecem ser do futuro, mas são na verdade sugestões telepáticas plantadas pelo Devorador de Mentes.`
  },
  {
    id: 'orc_siege_war',
    title: 'O Cerco de Sangue da Horda Orc de Gruumsh',
    icon: '⚔️',
    shortDesc: 'Guerra brutal e sobrevivência épica. Tambores nas montanhas, clãs bárbaros, orcs enfurecidos e defesa de bastiões.',
    tone: 'Épico, Fúria de Batalha e Tática Heroica',
    suggestedEnemies: ['Orc Guerreiro', 'Goblin Batedor', 'Ogro Furioso', 'Lobo Selvagem'],
    defaultDossier: `[DOSSIÊ DE CAMPANHA: O CERCO DE SANGUE DA HORDA ORC]
• Título da Campanha: A Trombeta dos Picos Vermelhos
• Cenário: O Forte Passo-do-Corvo, encravado entre duas cordilheiras cobertas por neve e florestas de pinheiros.
• Tom Narrativo: Urgente, adrenalina pura, fogueiras na noite, o ranger de catapultas e o rufar ensurdecedor de tambores de guerra.
• Antagonista Principal: Chefe de Guerra Krug Quebra-Ossos, um Orc abençoado com o Olho Sangrento de Gruumsh que uniu cinco tribos selvagens para varrer a civilização da fronteira.
• Gancho Inicial: Ao entardecer, flechas incendiárias cruzam o céu e atingem a muralha exterior do Forte. O capitão da guarda cai ferido e suplica aos heróis que assumam o comando da linha de defesa e protejam os portões de ferro.
• Locais Notáveis:
  1. As Muralhas do Passo-do-Corvo: Bastião de pedra com ameias desgastadas e caldeirões de piche fervente.
  2. O Acampamento das Cinzas: Centenas de tendas de pele e fogueiras dos orcs aos pés do desfiladeiro.
  3. A Caverna do Tótem de Guerra: Onde xamãs orcs sacrificam cativos para inflamar a fúria dos guerreiros.
• Segredo / Reviravolta Oculta: Um traidor dentro do forte desativou o mecanismo de contra-peso do portão leste em troca de ouro e passagem segura.`
  },
  {
    id: 'court_intrigue',
    title: 'Intriga Venenosa & Traição na Corte Real',
    icon: '👑',
    shortDesc: 'Conspiração política, venenos sutis, herdeiros desaparecidos, bailes de máscaras e cultos infernais na aristocracia.',
    tone: 'Investigativo, Dramático, Suspense e Perigo Oculto',
    suggestedEnemies: ['Bandido Salteador', 'Mímico (Mimic)', 'Medusa'],
    defaultDossier: `[DOSSIÊ DE CAMPANHA: INTRIGA VENENOSA NA CORTE REAL]
• Título da Campanha: A Máscara de Veludo e Veneno
• Cenário: A gloriosa capital de Solária, com seus palácios de mármore e esgotos labirínticos.
• Tom Narrativo: Elegante e letal. Diálogos com duplo sentido, rumores em tavernas de luxo, lâminas escondidas e pactos de sangue.
• Antagonista Principal: Lady Genevieve Vane, cortesã favorita do Rei e líder oculta da Fraternidade da Víbora, que manipula a linha sucessória através de venenos indetectáveis.
• Gancho Inicial: Durante o Baile de Solstício, o Príncipe Herdeiro desmaia com espasmos após beber de uma taça ofertada em honra aos heróis. Com os guardas em alerta, os heróis têm poucas horas para encontrar o antídoto antes que sejam culpados pela traição.
• Locais Notáveis:
  1. O Salão dos Mil Candelabros: Onde a nobreza dança enquanto espiões observam cada gesto.
  2. O Jardim Noturno dos Belladonas: Estufa secreta cultivada com botânica mortal e venenos raros.
  3. As Catacumbas sob a Guilda dos Ourives: QG clandestino dos contrabandistas e assassinos contratados.
• Segredo / Reviravolta Oculta: O próprio Príncipe planejava fingir seu envenenamento para incriminar seu tio, mas o veneno usado era real.`
  },
  {
    id: 'dungeon_crawl',
    title: 'O Labirinto das Profundezas Ancestrais',
    icon: '🗝️',
    shortDesc: 'Dungeon Crawl clássico em masmorra lendária com enigmas milenares, armadilhas mortais, mímicos e tesouros lendários.',
    tone: 'Aventura Clássica, Exploração, Perigo e Maravilha Arcana',
    suggestedEnemies: ['Mímico (Mimic)', 'Cubo Gelatinoso', 'Urso-Coruja (Owlbear)', 'Troll da Caverna'],
    defaultDossier: `[DOSSIÊ DE CAMPANHA: O LABIRINTO DAS PROFUNDEZAS ANCESTRAIS]
• Título da Campanha: Os Salões Esquecidos do Rei-Forjador
• Cenário: Uma cidadela anã subterrânea abandonada há mil anos após ser selada por feitiços arcanos.
• Tom Narrativo: Mistério clássico de D&D. Portas secretas, poeira de eras, armadilhas de lâminas giratórias, quebra-cabeças rúnicos e feras que fizeram do labirinto seu ninho.
• Antagonista Principal: O Guardião Mecânico Ancestral e uma criatura amorfa colossal que absorveu as pedras de mana dos núcleos arcanos da forja.
• Gancho Inicial: Uma abertura se rompeu na pedreira local após um tremor de terra, revelando degraus de granito descendo para a escuridão. O mapa rúnico na posse dos heróis ressoa com um calor súbito.
• Locais Notáveis:
  1. A Ponte dos Três Enigmas: Passagem sobre um abismo de magma protegida por estátuas falantes.
  2. A Grande Forja das Estrelas: Complexo colossal com alavancas gigantes, canais de água pura e mímicos disfarçados de baús de ferramentas.
  3. O Sanctum das Armaduras Rúnicas: Cofre lacrado que guarda as lendárias armas de Kar-Drakor.
• Segredo / Reviravolta Oculta: O complexo não foi abandonado por guerra, mas selado de propósito para aprisionar um Cubo Gelatinoso Primordial senciente.`
  },
  {
    id: 'dragon_wrath',
    title: 'A Ira do Dragão Vermelho & O Despertar Vulcânico',
    icon: '🐲',
    shortDesc: 'Cinzas ardentes, kobolds fanáticos, picos vulcânicos e a fúria devastadora de um Dragão Vermelho Ancião.',
    tone: 'Alta Fantasia Heroica, Fogo e Destruição',
    suggestedEnemies: ['Kobold Emboscador', 'Dragão Vermelho Jovem', 'Dragão Vermelho Ancião (Colossal)'],
    defaultDossier: `[DOSSIÊ DE CAMPANHA: A IRA DO DRAGÃO VERMELHO]
• Título da Campanha: O Fogo da Montanha Desperta
• Cenário: As encostas fumegantes do Monte Calvário e os vales de basalto negro.
• Tom Narrativo: Calor escaldante, céu tingido de âmbar, cinzas caindo como neve negra e o rugido ensurdecedor de asas de escamas escarlates.
• Antagonista Principal: Ignithor, a Chama Eterna, um Dragão Vermelho Colossal que despertou de seu sono secular e exige a vassalagem e o tesouro de todas as cidades vizinhas.
• Gancho Inicial: Uma chuva de cinzas cobre a vila ao amanhecer. No horizonte, uma coluna de fogo engole o pico da montanha e uma horda de kobolds montados em feras reptilianas ataca a ponte principal.
• Locais Notáveis:
  1. O Ninho de Fogo de Ignithor: Antiga cratera repleta de ouro derretido, ossos de heróis e pedras incandescentes.
  2. Os Túneis dos Kobolds Escamados: Labirinto estreito apinhado de armadilhas caseiras, pedras rolantes e potes de óleo grego.
  3. O Altar do Coração de Basalto: Onde um sacerdote draconiano canaliza o poder do dragão para convocar erupções.
• Segredo / Reviravolta Oculta: O dragão não quer apenas ouro, mas está protegendo o último ovo de dragão puro do multiverso contra caçadores planares.`
  },
  {
    id: 'fey_curse',
    title: 'A Floresta Feérica & O Conciliábulo das Bruxas',
    icon: '🌲',
    shortDesc: 'Névoa encantada, pactos arcanos enganosos, flores venenosas, árvores vivas e uma Bruxa Bheur congelando corações.',
    tone: 'Conto de Fadas Sombrio, Ilusão e Poesia Macabra',
    suggestedEnemies: ['Medusa', 'Manticora', 'Lobo Selvagem'],
    defaultDossier: `[DOSSIÊ DE CAMPANHA: A FLORESTA FEÉRICA & O CONCILIÁBULO DAS BRUXAS]
• Título da Campanha: As Raízes de Espinhos e Espelhos
• Cenário: A Floresta Sussurrante de Eldergrove, onde as estações mudam a cada encruzilhada.
• Tom Narrativo: Onírico, belo e aterrorizante. Fadas que pedem nomes como tributo, risos infantis no topo de árvores mortas e relógios que andam para trás.
• Antagonista Principal: Mãe Malícia, uma Bruxa da Noite anciã que comanda o Conciliábulo do Olho de Vidro e tece fios do destino para roubar a juventude dos mortais.
• Gancho Inicial: Ao seguir uma estrada que deveria levar à próxima cidade, os heróis percebem que estão andando em círculos há dias. Uma clareira se abre à frente, com uma cabana sobre pernas gigantescas de corvo e vapor com cheiro de maçã caramelizada saindo da chaminé.
• Locais Notáveis:
  1. O Pântano dos Reflexos Roubados: Lago onde os reflexos na água não imitam os heróis, mas tentam puxá-los para baixo.
  2. O Círculo dos Cogumelos Dançantes: Portal planar que obriga viajantes a dançar até a exaustão se falharem no teste de Sabedoria.
  3. A Cabana de Mãe Malícia: Repleta de gaiolas com pássaros de prata que cantam segredos de reis.
• Segredo / Reviravolta Oculta: A floresta está mantendo os heróis ali não para destruí-los, mas para que destruam a Bruxa antes que ela consuma a nascente mágica.`
  }
];
