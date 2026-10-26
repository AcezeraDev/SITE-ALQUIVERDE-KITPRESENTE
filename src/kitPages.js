// Conteúdo das páginas de cada kit (textos oficiais enviados pela AlquiVerde).
// Preço: vem da tabela PRICES em kits.js (por produto da loja).

const USO = 'Aplique sobre a pele molhada, massageando suavemente até formar espuma. Enxágue completamente. Após o uso, mantenha o sabonete em local que permita o escoamento da água.';
const CUIDADOS = [
  'Uso externo.',
  'Evite contato com os olhos.',
  'Em caso de irritação, suspenda o uso e procure orientação médica.',
  'Mantenha fora do alcance de crianças.',
  'Conserve em local fresco, seco e protegido da luz solar direta.',
  'Consulte a composição e a validade na embalagem de cada unidade.',
];

export const SOAP_INFO = {
  acafrao: { name: 'Açafrão', color: '#c0602a' },
  barbatimao: { name: 'Barbatimão', color: '#2f5240' },
  aroeira: { name: 'Aroeira', color: '#a8323e' },
  calendula: { name: 'Calêndula', color: '#d98d1f' },
  coco: { name: 'Coco', color: '#6f9238' },
  propolis: { name: 'Própolis', color: '#a87822' },
  'barbatimao-aroeira': { name: 'Barbatimão e Aroeira', color: '#7a2a2c' },
};

// Textos-base de cada sabonete (os kits oficiais têm a sua própria versão em `varieties`).
const SOAP_TEXT = {
  aroeira: { sci: 'Schinus terebinthifolia', text: 'Com extrato da casca de Schinus terebinthifolia, traz limpeza com sensação de frescor e perfume seco para complementar a rotina de banho.', notes: ['Frescor', 'Perfume seco'] },
  barbatimao: { sci: 'Stryphnodendron adstringens', text: 'Com extrato da casca de Stryphnodendron adstringens, oferece limpeza de toque adstringente e perfume amadeirado, valorizando um ingrediente tradicional da flora brasileira.', notes: ['Toque adstringente', 'Perfume amadeirado'] },
  calendula: { sci: 'Calendula officinalis', text: 'Com extrato das flores de Calendula officinalis, proporciona uma experiência de limpeza suave e toque macio, acrescentando delicadeza ao banho.', notes: ['Limpeza suave', 'Toque macio'] },
  coco: { sci: 'Cocos nucifera', text: 'Com Cocos nucifera, oferece espuma cremosa e perfume suave e tropical. Uma lembrança de praia em pleno dezembro, que também pode ser usada nos cabelos.', notes: ['Espuma cremosa', 'Perfume tropical'] },
  'barbatimao-aroeira': { sci: 'Stryphnodendron adstringens · Schinus terebinthifolia', text: 'Une o extrato da casca de barbatimão ao de aroeira num só sabonete: limpeza de toque adstringente, sensação de frescor e perfume amadeirado e seco.', notes: ['Toque adstringente', 'Frescor', 'Dois extratos'] },
  acafrao: { sci: 'Curcuma aromatica', text: 'Com extrato de Curcuma aromatica, oferece limpeza com sensação de frescor e perfume terroso, trazendo os ingredientes botânicos para o cuidado diário.', notes: ['Frescor', 'Perfume terroso'] },
  propolis: { sci: 'Própolis', text: 'Com extrato de própolis, proporciona limpeza com sensação purificante e um aroma marcante e resinoso, guardado pelas abelhas.', notes: ['Sensação purificante', 'Aroma resinoso'] },
};

/** Itens que não são sabonete. `icon` escolhe a ilustração em linha (kitPage.js). */
export const ITEM_INFO = {
  'oleo-amendoa': { name: 'Óleo de Amêndoa Doce', kind: 'Óleo vegetal', icon: 'bottle', sci: 'Prunus amygdalus dulcis', color: '#c9a26b',
    text: 'Óleo vegetal de toque sedoso para massagens e para o cuidado da pele depois do banho. Espalhe algumas gotas sobre a pele ainda úmida e massageie até absorver.',
    notes: ['Toque sedoso', 'Pós-banho', 'Massagem'], care: ['Uso externo. Não ingerir.', 'Guarde longe da luz e do calor.'] },
  'essencia-morango': { name: 'Essência Morango com Champanhe', kind: 'Essência para ambientes', icon: 'vial', photo: '/kits/essencia-morango.webp', color: '#d4486a',
    text: 'Fragrância concentrada, frutada e festiva, para perfumar a casa nas festas. Use algumas gotas em difusor ou aromatizador de ambiente.',
    notes: ['Frutada', 'Festiva', 'Para ambientes'], care: ESSENCIA_CARE() },
  // pronta para usar: ainda não está em nenhum kit (basta incluir { qty: 1, item: 'essencia-chocolate' } no conteúdo do kit)
  'essencia-chocolate': { name: 'Essência Chocolate', kind: 'Essência para ambientes', icon: 'vial', photo: '/kits/essencia-chocolate.webp', color: '#6b3f26',
    text: 'Fragrância concentrada de chocolate, doce e aconchegante, para perfumar a casa nas festas. Use algumas gotas em difusor ou aromatizador de ambiente.',
    notes: ['Doce', 'Aconchegante', 'Para ambientes'], care: ESSENCIA_CARE() },
  'essencia-natal': { name: 'Essência Natal', kind: 'Essência para ambientes', icon: 'vial', photo: '/kits/essencia-natal.webp', color: '#3f7d4e',
    text: 'Fragrância concentrada de inspiração natalina, para deixar a casa com cheiro de festa. Use algumas gotas em difusor ou aromatizador de ambiente.',
    notes: ['Natalina', 'Acolhedora', 'Para ambientes'], care: ESSENCIA_CARE() },
  'oleo-cravo': { name: 'Óleo Essencial de Cravo', kind: 'Óleo essencial', icon: 'vial', photo: '/kits/oleo-cravo.webp', color: '#7a3b22', sub: '10 mL',
    text: 'Óleo essencial de cravo, de aroma quente e especiado, que lembra a cozinha nos dias de festa. Algumas gotas no difusor ou aromatizador deixam a casa com clima de Natal.',
    notes: ['Quente', 'Especiado', '10 mL'], care: OLEO_CARE() },
  // model: GLB feito no Blender com a arte original do rótulo (tools/blender_frasco.py)
  'oleo-canela': { name: 'Óleo de Canela', kind: 'Óleo aromático', icon: 'vial', photo: '/kits/oleo-canela.webp', model: '/models/oleo-canela.glb', color: '#a0522d', sub: '10 mL',
    text: 'Óleo de canela, de aroma doce e acolhedor. Combina com o de cravo para perfumar o ambiente com cheiro de doce de Natal.',
    notes: ['Doce', 'Acolhedor', '10 mL'], care: OLEO_CARE() },
  vela: { name: 'Vela aromática de Panetone', kind: 'Vela aromática', icon: 'candle', photo: '/kits/vela.webp', color: '#c0262d',
    text: 'Vela aromática em copo de vidro com estampa natalina e aroma doce e acolhedor de panetone. Acenda na mesa da ceia, na sala ou no quarto e deixe o cheirinho dar o clima de festa.',
    notes: ['Aroma de panetone', 'Copo de vidro', 'Estampa natalina'],
    care: ['Vela: nunca deixe acesa sem supervisão e mantenha longe de cortinas, papéis, crianças e animais.', 'Acenda sobre superfície plana, firme e resistente ao calor.', 'Não queime por mais de 4 horas seguidas.'] },
  'vela-gingerbread': { name: 'Vela aromática Gingerbread', kind: 'Vela aromática', icon: 'candle', photo: '/kits/vela-natalina-frente.webp', color: '#4f6b45',
    text: 'Vela aromática em copo de vidro com rótulo natalino branco e dourado e aroma doce e especiado de biscoito de gengibre recém-assado.',
    notes: ['Aroma de gingerbread', 'Copo de vidro', 'Rótulo branco e dourado'],
    care: ['Vela: nunca deixe acesa sem supervisão e mantenha longe de cortinas, papéis, crianças e animais.', 'Acenda sobre superfície firme e resistente ao calor.', 'Não queime por mais de 4 horas seguidas.'] },
  'oleo-uva-puro': { name: 'Óleo de Semente de Uva', kind: 'Óleo vegetal', icon: 'bottle', sci: 'Vitis vinifera', color: '#7c2f50', sub: 'Puro e natural',
    text: 'Óleo vegetal de textura leve e absorção rápida, para massagem no corpo e para usar como base de óleos essenciais. Vem em frasco escuro com tampa preta.',
    notes: ['Textura leve', 'Absorção rápida', 'Base para óleos essenciais'],
    care: ['Uso externo. Faça um teste de sensibilidade antes do primeiro uso.', 'Pessoas com sensibilidade a uva devem evitar o produto.'] },
  'sabonete-sortido': { name: 'Sabonetes vegetais sortidos', kind: 'Sabonete vegetal', icon: 'soap', color: '#a8873f', sub: '3 variedades · 90 g cada',
    text: 'Três sabonetes vegetais em barra, cada um de uma variedade diferente da linha AlquiVerde. Servem para o banho do dia a dia e para lavar as mãos.',
    notes: ['3 variedades', '90 g cada', 'Banho e mãos'], care: [] },
  // aroma ainda não informado pela AlquiVerde (descritivo: "ficam de fora até confirmar")
  'essencia-aromatica': { name: 'Essência aromática', kind: 'Essência', icon: 'vial', color: '#7a4a3a',
    text: 'Duas essências aromáticas acompanham o kit. Os aromas serão informados em breve.',
    notes: ['2 unidades'], care: ['Não aplique pura na pele e não ingira.', 'Mantenha longe de chamas, crianças e animais.'] },
  'vela-feliz-natal': { name: 'Vela decorativa Feliz Natal', kind: 'Vela decorativa', icon: 'candle', color: '#c0262d',
    text: 'Vela em copo de vidro com árvore de Natal e "Feliz Natal" estampados no copo. Deixa a mesa da ceia com cara de festa.',
    notes: ['Copo de vidro', 'Estampa natalina'],
    care: ['Vela: nunca deixe acesa sem supervisão e apague antes de sair.', 'Mantenha longe de crianças e animais e acenda sobre superfície firme e resistente ao calor.'] },
  'oleo-uva': { name: 'Óleo de Semente de Uva com Vitamina E', kind: 'Óleo vegetal', icon: 'bottle', sci: 'Vitis vinifera', color: '#8a3f5c',
    text: 'Óleo vegetal de textura leve, que espalha fácil e deixa a pele macia e com toque sedoso. Ideal para massagem e para usar depois do banho, no corpo.',
    notes: ['Vitamina E', 'Textura leve', 'Pós-banho'], care: ['Uso externo, no corpo. Não ingerir.', 'Guarde longe da luz e do calor.'] },
  'oleo-alecrim': { name: 'Óleo Essencial de Alecrim', kind: 'Óleo essencial', icon: 'vial', sci: 'Rosmarinus officinalis', color: '#5f7d4f', sub: '10 mL',
    text: 'Óleo essencial de aroma herbal e fresco. Algumas gotas no difusor ou aromatizador perfumam o ambiente.',
    notes: ['Herbal', 'Fresco', '10 mL'], care: OLEO_CARE() },
  'oleo-limao': { name: 'Óleo Essencial de Limão Siciliano', kind: 'Óleo essencial', icon: 'vial', sci: 'Citrus limon', color: '#d8b41f', sub: '10 mL',
    text: 'Óleo essencial de aroma cítrico e limpo, que deixa o ambiente leve. Combina com alecrim e eucalipto.',
    notes: ['Cítrico', 'Leve', '10 mL'], care: OLEO_CARE() },
  'oleo-eucalipto': { name: 'Óleo Essencial de Eucalipto', kind: 'Óleo essencial', icon: 'vial', sci: 'Eucalyptus globulus', color: '#3f8a7a', sub: '10 mL',
    text: 'Óleo essencial de aroma fresco e marcante, para dar frescor à casa. Algumas gotas no difusor bastam.',
    notes: ['Frescor', 'Marcante', '10 mL'], care: OLEO_CARE() },
  // Aromas do Jardim: volume dos frascos ainda não confirmado (sem `sub`)
  'oleo-lavanda': { name: 'Óleo Essencial de Lavanda', kind: 'Óleo essencial', icon: 'vial', color: '#7d6aa8',
    text: 'Óleo essencial de aroma floral e suave. Fica ótimo no difusor do quarto à noite.',
    notes: ['Floral', 'Suave', 'Quarto'], care: OLEO_CARE() },
  'oleo-capim-limao': { name: 'Óleo Essencial de Capim Limão', kind: 'Óleo essencial', icon: 'vial', color: '#8fa63a',
    text: 'Óleo essencial de aroma cítrico e verde, com frescor de limão. Vai bem no difusor da sala, da cozinha e das áreas de passagem.',
    notes: ['Cítrico', 'Verde', 'Sala e cozinha'], care: OLEO_CARE() },
  'oleo-tangerina': { name: 'Óleo Essencial de Tangerina', kind: 'Óleo essencial', icon: 'vial', color: '#e8862a',
    text: 'Óleo essencial de aroma doce e cítrico. Fica bem na sala e combina com alecrim e cravo.',
    notes: ['Doce', 'Cítrico', 'Combina com alecrim'], care: ['Óleos cítricos: se usar na pele, só diluído em óleo vegetal, e evite o sol depois.'] },
  'sabonete-sortido-1': { name: 'Sabonete vegetal sortido', kind: 'Sabonete vegetal', icon: 'soap', color: '#c46a12', sub: '90 g',
    text: 'Um sabonete vegetal em barra de 90 g, de uma das variedades da linha AlquiVerde, indicado para todas as peles. A variedade pode mudar de um kit para outro.',
    notes: ['90 g', 'Todas as peles', 'Variedade sortida'], care: [] },
  'oleo-laranja': { name: 'Óleo Essencial de Laranja', kind: 'Óleo essencial', icon: 'vial', color: '#e07a1c',
    text: 'Óleo essencial de uso aromático, de aroma cítrico, doce e fresco, em frasco de vidro âmbar com tampa preta. Pingue na água do difusor ou umidificador elétrico, ou em um algodão deixado em cantos da casa.',
    notes: ['Cítrico', 'Doce e fresco', 'Uso aromático'], care: ['Uso aromático. Não ingerir.', 'Na pele, só diluído em óleo vegetal; depois, evite o sol por 12 h.'] },
  // Aroma Dourado: aroma do óleo ainda não confirmado (rótulo ilegível nas fotos)
  'difusor-eletrico': { name: 'Difusor elétrico de porcelana', kind: 'Aromatizador de tomada', icon: 'plug', color: '#b9b2a6',
    text: 'Aromatizador de porcelana branca que se liga direto na tomada. O calor suave espalha o perfume do óleo pelo cômodo, sem chama e sem fumaça.',
    notes: ['De tomada', 'Porcelana', 'Sem chama'], care: ['Mantenha longe de água, crianças e animais.', 'Desligue da tomada quando não estiver em uso e espere esfriar antes de limpar.'] },
  bucha: { name: 'Bucha vegetal', kind: 'Acessório de banho', icon: 'loofah', photo: '/kits/bucha.webp', sci: 'Luffa cylindrica', color: '#c8b48a',
    text: 'Fibra natural para uma esfoliação suave no banho. Use com o sabonete, enxágue bem e deixe secar em local arejado entre os usos.',
    notes: ['Fibra natural', 'Esfoliação suave'], care: ['Deixe secar entre os usos e troque periodicamente.'] },
};
function OLEO_CARE() {
  return ['Óleos de cravo e canela: use no difusor ou aromatizador; não aplique puro na pele e não ingira.', 'Gestantes, crianças e pessoas com sensibilidade devem consultar um profissional antes de usar na pele.', 'Mantenha longe dos olhos, de crianças e de animais.'];
}
function ESSENCIA_CARE() {
  return ['Essência para ambientes: não é perfume corporal.', 'Não aplique pura na pele e não ingira.', 'Inflamável: mantenha longe de chamas, crianças e animais.'];
}

export const KIT_PAGES = {
  'caixa-prata': {
    slug: 'caixa-prata', kitId: 'caixa-prata', draft: true,
    name: 'Caixa Prata',
    title: 'Kit de Natal AlquiVerde — Caixa Prata com 6 Sabonetes Vegetais de Barbatimão, Calêndula e Aroeira',
    subtitle: 'Caixa prata texturizada com visor e laço verde de cetim, com 6 sabonetes vegetais de 90 g',
    tagline: 'Seis sabonetes, dois de cada aroma, numa caixa prata com laço verde.',
    intro: [
      'A Caixa Prata reúne seis sabonetes vegetais em barra de 90 g numa caixa prata texturizada, com visor que mostra os rótulos e laço verde de cetim.',
      'São dois sabonetes de cada aroma, Barbatimão, Calêndula e Aroeira, para quem gosta de cuidar da pele com ingredientes naturais e ainda pode dividir ou guardar.',
    ],
    facts: ['6 sabonetes', '3 aromas', '540 g', 'Laço de cetim'],
    tone: '#4f7a4a', bg: '#e9eee6', ink: '#2c4a29',
    contents: [
      { qty: 2, key: 'barbatimao', label: 'Sabonete Vegetal de Barbatimão', weight: '90 g' },
      { qty: 2, key: 'calendula', label: 'Sabonete Vegetal de Calêndula', weight: '90 g' },
      { qty: 2, key: 'aroeira', label: 'Sabonete Vegetal de Aroeira', weight: '90 g' },
    ],
    box: { label: 'Caixa prata com visor e laço verde de cetim', img: '/kits/caixa-prata-frente.webp' },
    totals: { units: 6, weight: '540 g' },
    variants: [{
      label: '2 Barbatimão · 2 Calêndula · 2 Aroeira', img: '/kits/caixa-prata-frente.webp',
      soaps: ['barbatimao', 'barbatimao', 'calendula', 'calendula', 'aroeira', 'aroeira'], model: 'caixa-prata',
      hotspots: { barbatimao: [0.5, 0.27], calendula: [0.27, 0.46], aroeira: [0.62, 0.86] },
    }],
    giftTitle: 'Bonito, útil e pronto para entregar',
    gift: [
      'Um presente para amigo secreto, anfitriões da ceia, colegas, família e clientes: seis sabonetes que vão durar bem depois do Natal.',
      'A caixa já vem com o laço verde de cetim. Só falta o cartão.',
    ],
    giftFor: ['Amigo secreto', 'Anfitriões da ceia', 'Colegas e clientes', 'Família'],
    use: USO,
    care: CUIDADOS,
    closing: 'Neste Natal, presenteie com seis jeitos de cuidar do banho.',
    other: 'laco-de-natal',
  },
  'laco-de-natal': {
    slug: 'laco-de-natal', kitId: 'laco', draft: true,
    name: 'Laço de Natal',
    title: 'Kit de Natal AlquiVerde — Laço de Natal com 2 Sabonetes Vegetais, Óleo de Amêndoa Doce e Bucha',
    subtitle: 'Caixa vermelha com laço, 2 sabonetes vegetais de 90 g, óleo de amêndoa doce e bucha vegetal',
    tagline: 'Um banho completo, com laço vermelho e tudo.',
    intro: [
      'O Laço de Natal reúne tudo o que um banho caprichado pede: dois sabonetes vegetais de 90 g, um óleo de amêndoa doce para depois e uma bucha vegetal, numa caixa vermelha fechada com laço.',
      'A dupla de Calêndula e Barbatimão e Aroeira combina uma limpeza suave e macia com outra de toque adstringente, frescor e perfume amadeirado. O óleo fecha o ritual com toque sedoso.',
    ],
    facts: ['2 sabonetes', 'Óleo de amêndoa', 'Bucha vegetal', 'Caixa com laço'],
    tone: '#b3262f', bg: '#f6e3dc', ink: '#6d1c22',
    contents: [
      { qty: 1, key: 'calendula', label: 'Sabonete Vegetal de Calêndula', weight: '90 g' },
      { qty: 1, key: 'barbatimao-aroeira', label: 'Sabonete Vegetal de Barbatimão e Aroeira', weight: '90 g' },
      { qty: 1, item: 'oleo-amendoa' },
      { qty: 1, item: 'bucha' },
    ],
    box: { label: 'Caixa vermelha com laço', img: '/kits/laco-frente.webp' },
    variants: [{ label: 'Calêndula · Barbatimão e Aroeira', img: '/kits/laco-frente.webp', soaps: ['calendula', 'barbatimao-aroeira'], model: 'laco' }],
    giftTitle: 'Um ritual inteiro dentro da caixa',
    gift: [
      'Do sabonete ao óleo pós-banho, o Laço de Natal entrega um momento de cuidado completo. É uma escolha para quem merece uma pausa: mães, avós, amigas, a pessoa do amigo-secreto que você quer surpreender.',
      'O laço vermelho já vem pronto. Só falta o cartão.',
    ],
    giftFor: ['Mães e avós', 'Amigo-secreto', 'Amigas', 'Quem precisa de uma pausa'],
    use: USO,
    care: CUIDADOS,
    closing: 'Neste Natal, presenteie um banho inteiro — com laço e tudo.',
    other: 'feliz-natal',
  },
  'feliz-natal': {
    slug: 'feliz-natal', kitId: 'feliz-natal', draft: true,
    video: { src: '/video/montagem-kit.mp4', poster: '/video/montagem-kit-poster.jpg' }, // só este kit tem vídeo da montagem
    name: 'Kits Clássico, Delicado e da Casa',
    title: 'Kit de Natal AlquiVerde — Kit Clássico, Delicado ou da Casa com 4 Sabonetes Vegetais, 2 Essências, Vela Aromática de Panetone e Bucha',
    subtitle: 'Caixa vermelha com 4 sabonetes vegetais de 90 g, 2 essências, vela aromática de panetone e bucha vegetal',
    tagline: 'Sabonetes, essências e uma vela de panetone para perfumar o Natal.',
    intro: [
      'Estes kits juntam o banho e a casa num presente só: quatro sabonetes vegetais de 90 g, as essências Morango com Champanhe e Natal para perfumar o ambiente, uma vela aromática de panetone e uma bucha vegetal.',
      'Escolha o seu kit: o Clássico (Coco, Calêndula, Aroeira e Barbatimão), o Delicado (dois de Coco e dois de Aroeira) ou o da Casa (Barbatimão, Própolis, Açafrão e Barbatimão com Aroeira).',
    ],
    facts: ['4 sabonetes', '2 essências', 'Vela de panetone', 'Bucha vegetal'],
    tone: '#752f3b', bg: '#f3dfdc', ink: '#5a1f29',
    contents: [
      { qty: 4, soaps: true, label: 'Sabonetes Vegetais', weight: '90 g cada' },
      { qty: 1, item: 'essencia-morango' },
      { qty: 1, item: 'essencia-natal' },
      { qty: 1, item: 'vela' },
      { qty: 1, item: 'bucha' },
    ],
    box: { label: 'Caixa vermelha', img: '/kits/feliz-aroeira-calendula-frente.webp' },
    variants: [
      { label: 'Kit Clássico', title: 'Kit Clássico', tag: 'Sabonetes de Coco, Calêndula, Aroeira e Barbatimão, duas essências, vela de panetone e bucha vegetal.', img: '/kit3d/feliz-natal-front.webp', soaps: ['coco', 'calendula', 'aroeira', 'barbatimao'], model: 'feliz-natal',
        // posições (fração da foto) de cada item na foto aberta da bandeja
        hotspots: { aroeira: [0.246, 0.3], calendula: [0.248, 0.71], 'essencia-morango': [0.486, 0.3], 'essencia-natal': [0.592, 0.3], vela: [0.552, 0.71], bucha: [0.785, 0.5] } },
      { label: 'Kit Delicado', title: 'Kit Delicado', tag: 'Dois sabonetes de Aroeira e dois de Coco, duas essências, vela de panetone e bucha vegetal.', img: '/kit3d/feliz-aroeira-coco-front.webp', soaps: ['aroeira', 'aroeira', 'coco', 'coco'], model: 'feliz-aroeira-coco',
        hotspots: { aroeira: [0.257, 0.323], coco: [0.257, 0.73], 'essencia-morango': [0.504, 0.35], 'essencia-natal': [0.607, 0.35], vela: [0.565, 0.716], bucha: [0.795, 0.505] } },
      { label: 'Kit da Casa', title: 'Kit da Casa', tag: 'Sabonetes de Barbatimão, Própolis, Açafrão e Barbatimão com Aroeira, duas essências, vela de panetone e bucha vegetal.', img: '/kit3d/feliz-barbatimao-propolis-front.webp', soaps: ['barbatimao', 'propolis', 'acafrao', 'barbatimao-aroeira'], model: 'feliz-barbatimao-propolis',
        hotspots: { barbatimao: [0.257, 0.32], propolis: [0.257, 0.73], 'essencia-morango': [0.504, 0.4], 'essencia-natal': [0.608, 0.4], vela: [0.565, 0.727], bucha: [0.795, 0.513] } },
    ],
    giftTitle: 'Para quem gosta de casa cheirosa',
    gift: [
      'Metade do kit cuida do banho, a outra metade perfuma a casa — com essências e uma vela de panetone para acender na ceia.',
      'Uma boa escolha para quem recebe a família no Natal, para colegas de trabalho e para quem gosta de detalhes.',
    ],
    giftFor: ['Anfitriões da ceia', 'Colegas', 'Família', 'Clientes'],
    use: USO,
    care: CUIDADOS,
    closing: 'Neste Natal, brinde com um presente que perfuma o banho e a casa.',
    other: 'laco-tropical',
  },
  'laco-tropical': {
    slug: 'laco-tropical', kitId: 'laco-tropical', draft: true,
    name: 'Laço Tropical',
    title: 'Kit Presente de Natal AlquiVerde — Laço Tropical: Sabonetes Vegetais Barbatimão e Aroeira e Coco, Bucha e Óleo de Semente de Uva',
    subtitle: 'Caixa vermelha metalizada com laço de cetim, 2 sabonetes vegetais de 90 g, bucha vegetal e óleo de semente de uva com vitamina E',
    tagline: 'Coco, cerrado e óleo de uva: um banho inteiro, com laço vermelho.',
    intro: [
      'Presente pronto para entregar: o Laço Tropical já vem montado na caixa vermelha metalizada, com divisórias e laço de cetim. É só entregar.',
      'Um ritual de banho completo: o sabonete de Barbatimão e Aroeira, o queridinho da AlquiVerde, e o de Coco, de espuma macia e aroma suave, ambos para todos os tipos de pele; a bucha vegetal natural, para uma esfoliação suave; e o óleo de semente de uva com vitamina E, de textura leve, para deixar a pele macia e com toque sedoso depois do banho.',
    ],
    facts: ['2 sabonetes', 'Bucha vegetal', 'Óleo com vitamina E', 'Caixa com laço'],
    tone: '#a3313b', bg: '#f7e4de', ink: '#62202a',
    contents: [
      { qty: 1, key: 'barbatimao-aroeira', label: 'Sabonete Vegetal de Barbatimão e Aroeira', weight: '90 g' },
      { qty: 1, key: 'coco', label: 'Sabonete Vegetal de Coco', weight: '90 g' },
      { qty: 1, item: 'oleo-uva' },
      { qty: 1, item: 'bucha' },
    ],
    box: { label: 'Caixa vermelha metalizada com divisórias e laço', img: '/kits/laco-tropical-frente.webp' },
    variants: [
      { label: 'Barbatimão e Aroeira · Coco', img: '/kits/laco-tropical-frente.webp', soaps: ['barbatimao-aroeira', 'coco'], model: 'laco-tropical',
        hotspots: { 'barbatimao-aroeira': [0.23, 0.42], coco: [0.23, 0.755], bucha: [0.513, 0.594], 'oleo-uva': [0.716, 0.659] } },
    ],
    giftTitle: 'Um presente que agrada a todos',
    gift: [
      'Itens úteis, que a pessoa vai usar de verdade: um banho completo do começo ao fim. Ótimo para amigo secreto, mãe, avó, professores e colegas de trabalho.',
      'O laço de cetim já vem pronto. Só falta o cartão.',
    ],
    giftFor: ['Amigo secreto', 'Mães e avós', 'Professores', 'Colegas de trabalho'],
    use: 'Ritual de banho: molhe a pele e faça espuma com o sabonete. Passe a bucha com movimentos circulares e suaves. Enxágue e, com a pele ainda úmida, aplique algumas gotas do óleo e massageie até absorver. Depois do uso, enxágue bem a bucha e deixe secar em local arejado.',
    care: ['Uso externo.', 'Evite contato com os olhos; em caso de contato, enxágue com água em abundância.', 'Em caso de irritação, suspenda o uso.', 'O óleo é indicado para o corpo: massagem e pós-banho.', 'Mantenha fora do alcance de crianças.', 'Guarde em local fresco, seco e longe da luz do sol.'],
    closing: 'Neste Natal, presenteie um banho com cheiro de verão — e laço vermelho.',
    other: 'especiarias-de-natal',
  },
  'especiarias-de-natal': {
    slug: 'especiarias-de-natal', kitId: 'especiarias', draft: true,
    name: 'Especiarias de Natal',
    title: 'Kit de Natal AlquiVerde — Especiarias de Natal com 4 Sabonetes Vegetais, Óleos de Canela e Cravo, Vela Aromática de Panetone e Bucha',
    subtitle: 'Caixa vermelha com divisórias, 4 sabonetes vegetais de 90 g, óleos de canela e cravo de 10 mL, vela aromática de panetone e bucha vegetal',
    tagline: 'O abraço mais apertado: quatro sabonetes, óleos de canela e cravo.',
    intro: [
      'O Especiarias de Natal é o nosso abraço mais apertado. São quatro sabonetes vegetais de 90 g — dois de Coco e dois de Calêndula, ou quatro de Coco —, os óleos de Canela e de Cravo, uma vela aromática de panetone e uma bucha vegetal, organizados numa caixa vermelha com divisórias.',
      'O Coco traz espuma cremosa e perfume tropical; a Calêndula, limpeza suave e toque macio. Cravo e canela fazem o resto, com aquele cheiro de doce de Natal pela casa.',
    ],
    facts: ['4 sabonetes', 'Cravo e canela', 'Vela de panetone', 'Bucha vegetal'],
    tone: '#284a31', bg: '#e3ebdf', ink: '#1d3523',
    contents: [
      { qty: 4, soaps: true, label: 'Sabonetes Vegetais', weight: '90 g cada' },
      { qty: 1, item: 'oleo-canela' },
      { qty: 1, item: 'oleo-cravo' },
      { qty: 1, item: 'vela' },
      { qty: 1, item: 'bucha' },
    ],
    box: { label: 'Caixa vermelha com divisórias', img: '/kit3d/especiarias-front.webp' },
    totals: { units: 4, weight: '360 g' },
    variants: [
      { label: '2 Coco + 2 Calêndula', img: '/kit3d/especiarias-front.webp', soaps: ['coco', 'coco', 'calendula', 'calendula'], model: 'especiarias',
        // posições (fração da foto) de cada item
        hotspots: { coco: [0.259, 0.283], calendula: [0.647, 0.283], 'oleo-canela': [0.892, 0.283], 'oleo-cravo': [0.887, 0.724], bucha: [0.333, 0.713], vela: [0.709, 0.713] } },
      { label: '4 Coco', img: '/kit3d/especiarias-coco-front.webp', soaps: ['coco', 'coco', 'coco', 'coco'], model: 'especiarias-coco',
        hotspots: { coco: [0.453, 0.283], 'oleo-canela': [0.892, 0.283], 'oleo-cravo': [0.887, 0.724], bucha: [0.333, 0.713], vela: [0.709, 0.713] } },
    ],
    giftTitle: 'O presente mais completo da coleção',
    gift: [
      'Com quatro sabonetes, óleos, vela e bucha, é o kit para quem você quer abraçar com força: a melhor amiga, a família toda, quem fez o seu ano mais leve.',
      'As divisórias mantêm cada item no lugar, do ateliê até a árvore.',
    ],
    giftFor: ['Melhor amiga', 'Família', 'Presente especial', 'Empresas'],
    use: USO,
    care: CUIDADOS,
    closing: 'Neste Natal, dê o abraço mais apertado — com cheiro de cravo e canela.',
    other: 'quarteto-de-aromas',
  },
  'quarteto-de-aromas': {
    slug: 'quarteto-de-aromas', kitId: 'quarteto-aromas', draft: true,
    name: 'Cinco Aromas',
    title: 'Kit Natal 5 Óleos Essenciais AlquiVerde — Limão Siciliano, Eucalipto, Alecrim, Canela e Cravo 10 mL',
    subtitle: 'Caixa vermelha com visor e laço de cetim, 5 óleos essenciais de 10 mL para perfumar a casa',
    tagline: 'Cinco óleos essenciais enfileirados na vitrine, com laço de cetim: a casa inteira com cheiro de festa.',
    intro: [
      'O Cinco Aromas é o presente para quem gosta de casa perfumada. São cinco frascos de 10 mL, lado a lado numa caixa vermelha com visor e laço de cetim: Limão Siciliano, Eucalipto, Alecrim, Canela e Cravo.',
      'Cinco aromas para combinar: o cítrico do limão, o frescor do eucalipto, o herbal do alecrim e o quente das especiarias de canela e cravo. Algumas gotas no difusor ou aromatizador perfumam o ambiente.',
    ],
    facts: ['5 óleos essenciais', '10 mL cada', 'Para ambientes', 'Laço de cetim'],
    tone: '#a8121c', bg: '#f6e2d8', ink: '#5f161c',
    contents: [
      { qty: 1, item: 'oleo-limao' },
      { qty: 1, item: 'oleo-eucalipto' },
      { qty: 1, item: 'oleo-alecrim' },
      { qty: 1, item: 'oleo-canela' },
      { qty: 1, item: 'oleo-cravo' },
    ],
    box: { label: 'Caixa vermelha com visor e laço de cetim', img: '/kits/quarteto-frente.webp' },
    // a foto e o 3D ainda são da versão de 4 frascos: sem números na foto até chegar a foto nova
    variants: [
      { label: 'Limão · Eucalipto · Alecrim · Canela · Cravo', img: '/kits/quarteto-frente.webp', soaps: [], model: 'quarteto' },
    ],
    giftTitle: 'Para quem gosta de casa perfumada',
    gift: [
      'Um presente que vale para a casa toda: ótimo para anfitriões da ceia, para quem acabou de se mudar e para quem não abre mão de um difusor ligado.',
      'O visor mostra os frascos e o laço de cetim já resolve o embrulho. É só escrever o cartão.',
    ],
    giftFor: ['Anfitriões da ceia', 'Casa nova', 'Amigo secreto', 'Colegas'],
    use: 'Pingue algumas gotas no difusor ou aromatizador de ambiente e ajuste a quantidade ao tamanho do cômodo. Não aplique os óleos puros na pele e não ingira.',
    care: ['Uso aromático em ambientes. Não aplique os óleos puros na pele e não ingira.', 'Mantenha fora do alcance de crianças e animais.', 'Conserve em local fresco, seco e protegido da luz solar direta.', 'Consulte a composição e a validade no rótulo de cada frasco.'],
    closing: 'Neste Natal, dê de presente o cheiro da festa.',
    other: 'aromas-do-jardim',
  },
  'aromas-do-jardim': {
    slug: 'aromas-do-jardim', kitId: 'aromas-jardim', draft: true,
    name: 'Aromas do Jardim',
    title: 'Kit 5 Óleos Essenciais AlquiVerde — Lavanda, Capim Limão, Alecrim, Cravo e Tangerina em Caixa Dourada',
    subtitle: 'Caixa dourada texturizada com laço e 5 óleos essenciais em frascos de vidro âmbar',
    tagline: 'Lavanda, Capim Limão, Alecrim, Cravo e Tangerina: cinco óleos essenciais numa caixinha dourada com laço.',
    intro: [
      'Kit presente com 5 óleos essenciais AlquiVerde, em frascos de vidro âmbar com tampa preta e rótulo colorido para cada aroma, dentro de uma caixa dourada texturizada com laço. Já vem pronto para presentear.',
      'Um aroma para cada canto da casa: a lavanda floral no quarto, o capim limão fresco na cozinha, o alecrim herbal no home office, o cravo quente e a tangerina doce na sala.',
    ],
    facts: ['5 óleos essenciais', 'Vidro âmbar', 'Para ambientes', 'Caixa dourada'],
    tone: '#6b7a3a', bg: '#eef0e0', ink: '#3a4418',
    contents: [
      { qty: 1, item: 'oleo-lavanda' },
      { qty: 1, item: 'oleo-capim-limao' },
      { qty: 1, item: 'oleo-alecrim' },
      { qty: 1, item: 'oleo-cravo' },
      { qty: 1, item: 'oleo-tangerina' },
    ],
    box: { label: 'Caixa dourada texturizada com laço', img: '/kits/cinco-oleos-frente.webp' },
    // foto da caixa aberta vista de cima: as tampas não mostram qual aroma é qual, então sem números na foto
    variants: [
      { label: 'Lavanda · Capim Limão · Alecrim · Cravo · Tangerina', img: '/kits/cinco-oleos-frente.webp', open: '/kits/cinco-oleos-aberta.webp', soaps: [], model: 'cinco-oleos' },
    ],
    giftTitle: 'Um aroma para cada canto da casa',
    gift: [
      'Para quem tem difusor em casa, para quem gosta de casa perfumada, para anfitriões da ceia e para o amigo secreto.',
      'A caixinha dourada com laço já resolve o embrulho. É só escrever o cartão.',
    ],
    giftFor: ['Casa perfumada', 'Anfitriões da ceia', 'Amigo secreto', 'Casa nova'],
    use: 'Pingue algumas gotas no difusor de ambiente ou em um algodão perto de onde quer perfumar. Não use puro na pele.',
    care: ['Uso externo. Não ingerir.', 'Não use puro na pele.', 'Mantenha fora do alcance de crianças e animais.', 'Óleo essencial não é essência.', 'Cravo: use com moderação e em ambiente ventilado.'],
    closing: 'Neste Natal, dê de presente um aroma para cada canto da casa.',
    other: 'aroma-dourado',
  },
  'aroma-dourado': {
    slug: 'aroma-dourado', kitId: 'aroma-dourado', draft: true,
    name: 'Aroma Dourado',
    title: 'Kit Natal AlquiVerde — Aroma Dourado com Aromatizador Elétrico e Óleo Essencial de Alecrim 10 mL',
    subtitle: 'Caixa dourada com tampa transparente e laço de cetim, aromatizador elétrico de porcelana e óleo essencial de Alecrim de 10 mL',
    tagline: 'Um aromatizador de porcelana e óleo essencial de Alecrim: a casa perfumada, numa caixa dourada com laço.',
    intro: [
      'O Aroma Dourado é o presente para quem gosta de chegar em casa e sentir cheiro bom. Vem com um aromatizador elétrico de porcelana, que se liga direto na tomada, e um frasco de Óleo Essencial de Alecrim de 10 mL, de aroma herbal e fresco, numa caixa dourada com tampa transparente e laço de cetim.',
      'É só pingar algumas gotas no recipiente de porcelana e ligar: o calor suave espalha o perfume pelo cômodo, sem chama e sem fumaça. Prático para o quarto, a sala ou o escritório.',
    ],
    facts: ['Aromatizador de tomada', 'Alecrim 10 mL', 'Sem chama', 'Laço dourado'],
    tone: '#a87b1e', bg: '#f5ecd9', ink: '#5a4210',
    contents: [
      { qty: 1, item: 'difusor-eletrico' },
      { qty: 1, item: 'oleo-alecrim' },
    ],
    box: { label: 'Caixa dourada com tampa transparente e laço', img: '/kits/aroma-dourado-frente.webp' },
    variants: [
      { label: 'Aromatizador elétrico · Alecrim 10 mL', img: '/kits/aroma-dourado-frente.webp', soaps: [], model: 'aroma-dourado',
        hotspots: { 'oleo-alecrim': [0.16, 0.6], 'difusor-eletrico': [0.44, 0.67] } },
    ],
    giftTitle: 'Cheiro de casa, sem acender nada',
    gift: [
      'Um presente que fica à vista e é usado todo dia: ótimo para colegas de trabalho, para quem mora sozinho, para a casa nova e para o amigo-secreto de valor menor que você quer caprichar.',
      'A caixa dourada com laço já resolve o embrulho. Só falta o cartão.',
    ],
    giftFor: ['Colegas de trabalho', 'Casa nova', 'Amigo secreto', 'Quem trabalha em casa'],
    use: 'Com o difusor desligado, pingue algumas gotas do óleo no recipiente de porcelana, ligue na tomada e deixe o calor suave espalhar o aroma. Desligue e espere esfriar antes de limpar ou repor o óleo.',
    care: ['Uso aromático em ambientes. Não aplique o óleo puro na pele e não ingira.', 'Difusor: mantenha longe de água, cortinas, crianças e animais; desligue da tomada quando não estiver em uso.', 'Conserve o óleo em local fresco, seco e protegido da luz solar direta.', 'Consulte a composição e a validade no rótulo do frasco.'],
    closing: 'Neste Natal, dê de presente uma casa que cheira a festa.',
    other: 'raio-de-sol',
  },
  'raio-de-sol': {
    slug: 'raio-de-sol', kitId: 'raio-de-sol', draft: true,
    name: 'Raio de Sol',
    title: 'Kit Natal AlquiVerde — Óleo Essencial de Laranja + Sabonete Vegetal Sortido 90 g, em Caixa Dourada',
    subtitle: 'Caixa dourada com tampa transparente e laço dourado, óleo essencial de Laranja e um sabonete vegetal sortido de 90 g',
    tagline: 'Óleo essencial de Laranja e um sabonete vegetal sortido numa caixinha dourada com janela.',
    intro: [
      'Um presente para perfumar o ambiente e cuidar do banho: um óleo essencial de Laranja e um sabonete vegetal de 90 g, numa caixa dourada com tampa transparente e laço dourado de cetim. Pronto para presentear, sem precisar de embrulho.',
      'O óleo é sempre de Laranja, de aroma cítrico, doce e fresco. O sabonete é sortido: vem de uma das variedades da linha AlquiVerde, indicado para todas as peles, e a variedade pode mudar de um kit para outro.',
    ],
    facts: ['Óleo de Laranja', 'Sabonete 90 g', 'Kit sortido', 'Caixa dourada'],
    tone: '#c46a12', bg: '#f8ead8', ink: '#5e3208',
    contents: [
      { qty: 1, item: 'oleo-laranja' },
      { qty: 1, item: 'sabonete-sortido-1' },
      { soaps: true, pool: 1 },
    ],
    box: { label: 'Caixa dourada com tampa transparente e laço', img: '/kits/raio-de-sol-frente.webp' },
    variants: [
      { label: 'Laranja · sabonete sortido', img: '/kits/raio-de-sol-frente.webp', soaps: ['barbatimao', 'barbatimao-aroeira', 'aroeira', 'calendula', 'coco', 'acafrao', 'propolis'], model: 'raio-de-sol',
        hotspots: { 'sabonete-sortido-1': [0.5, 0.43], 'oleo-laranja': [0.49, 0.77] } },
    ],
    giftTitle: 'Para quem gosta de aromas frescos',
    gift: [
      'Para o Natal, o amigo secreto, o Dia das Mães, os professores e para quem gosta de produtos vegetais e de aromas frescos.',
      'A caixa dourada com janela transparente já deixa o kit apresentável. Só falta o cartão.',
    ],
    giftFor: ['Amigo secreto', 'Professores', 'Dia das Mães', 'Quem ama aromas frescos'],
    use: 'Óleo: no difusor, 3 a 5 gotas na água do aparelho; para massagem, 2 a 3 gotas em 10 mL de óleo vegetal, nunca puro na pele. Para um aroma aconchegante, misture com canela ou cravo. Sabonete: molhe a pele, faça espuma e enxágue.',
    care: [
      'Óleo essencial para uso aromático. Não ingerir.',
      'Mantenha fora do alcance de crianças e animais.',
      'Na pele, use apenas diluído em óleo vegetal e faça um teste antes.',
      'Após usar óleo cítrico na pele, evite o sol por 12 h.',
      'Gestantes e pessoas com condições de saúde devem consultar um profissional antes de usar.',
      'Sabonete: uso externo. Em caso de contato com os olhos, enxágue com água.',
    ],
    closing: 'Neste Natal, mande um raio de sol embrulhado em dourado.',
    other: 'presente-variado',
  },

  // ---- Os três abaixo vêm dos descritivos de anúncio (sem preço e sem produto na loja ainda). ----
  'presente-variado': {
    slug: 'presente-variado', kitId: 'presente-variado', draft: true,
    name: 'Presente Variado',
    title: 'Kit Presente AlquiVerde — 3 Sabonetes Vegetais Variados de 90 g em Caixa Dourada com Laço',
    subtitle: 'Caixa dourada com visor transparente e laço dourado, com 3 sabonetes vegetais de variedades diferentes',
    tagline: 'Três sabonetes, três variedades, uma caixa dourada. É só entregar.',
    intro: [
      'O Presente Variado reúne três sabonetes vegetais em barra de 90 g, cada um de uma variedade diferente, numa caixa dourada com visor transparente e laço de fita dourada.',
      'Os sabonetes servem para o banho do dia a dia e também para lavar as mãos, e quem recebe ainda conhece mais de uma variedade da linha AlquiVerde.',
    ],
    facts: ['3 sabonetes', '3 variedades', '270 g', 'Caixa dourada'],
    tone: '#a8873f', bg: '#f4ead6', ink: '#55400f',
    // kit sortido: `pool` lista as variedades que podem vir, sem contar como itens da caixa
    contents: [
      { qty: 3, item: 'sabonete-sortido' },
      { soaps: true, pool: 3 },
    ],
    box: { label: 'Caixa dourada com visor e laço', img: '/kits/presente-variado-frente.webp' },
    totals: { units: 3, weight: '270 g' },
    variants: [
      { label: 'Kit sortido', img: '/kits/presente-variado-frente.webp', soaps: ['barbatimao', 'barbatimao-aroeira', 'aroeira', 'calendula', 'coco', 'acafrao', 'propolis'], model: 'presente-variado' },
    ],
    giftTitle: 'Um presente pronto, sem erro',
    gift: [
      'Para o Natal e o amigo secreto, para professores, para o Dia das Mães e outras datas especiais, e para quem gosta de produtos naturais para o banho.',
      'Os três sabonetes já vêm na caixa dourada com visor e laço. Só falta o cartão.',
    ],
    giftFor: ['Amigo secreto', 'Professores', 'Dia das Mães', 'Quem ama produtos naturais'],
    use: 'Molhe a pele, passe o sabonete e massageie suavemente até formar espuma. Enxágue bem. Depois do uso, deixe o sabonete numa saboneteira com escoamento, em local seco, para ele durar mais.',
    care: ['Uso externo.', 'Evite contato com os olhos. Se ocorrer, enxágue com bastante água.', 'Suspenda o uso em caso de irritação.', 'Mantenha fora do alcance de crianças.', 'Guarde em local seco e fresco.'],
    closing: 'Neste Natal, presenteie com três jeitos de cuidar do banho.',
    other: 'oleo-de-semente-de-uva',
  },
  'oleo-de-semente-de-uva': {
    slug: 'oleo-de-semente-de-uva', kitId: 'oleo-uva', draft: true,
    name: 'Óleo de Semente de Uva',
    title: 'Óleo de Semente de Uva AlquiVerde, Puro e Natural, em Caixa Dourada para Presente',
    subtitle: 'Óleo vegetal de semente de uva em frasco escuro, dentro de caixa dourada texturizada com tampa transparente',
    tagline: 'Um óleo leve para massagem e cuidado do corpo, já pronto para presentear.',
    intro: [
      'Óleo vegetal de semente de uva AlquiVerde, puro e natural, em caixa dourada texturizada com tampa transparente. Já vem pronto para presentear.',
      'É um óleo de textura leve e absorção rápida, para massagem no corpo e para usar como base de óleos essenciais. Aplique sobre a pele e massageie suavemente até a completa absorção.',
    ],
    facts: ['Óleo vegetal', 'Puro e natural', 'Textura leve', 'Caixa dourada'],
    tone: '#7c2f50', bg: '#f3e3ea', ink: '#4a1730',
    contents: [{ qty: 1, item: 'oleo-uva-puro' }],
    box: { label: 'Caixa dourada com tampa transparente', img: '/kits/oleo-uva-frente.webp' },
    variants: [
      { label: 'Óleo vegetal · caixa dourada', img: '/kits/oleo-uva-frente.webp', soaps: [], model: 'oleo-uva-dourado' },
    ],
    giftTitle: 'Cuidado simples, do jeito natural',
    gift: [
      'Para o Natal e o amigo secreto, para professores, para o Dia das Mães e para quem gosta de produtos naturais no cuidado do dia a dia.',
      'Vai na massagem, no corpo, nas pontas do cabelo, nas cutículas e nas áreas que pedem mais cuidado, como mãos e cotovelos.',
    ],
    giftFor: ['Amigo secreto', 'Professores', 'Dia das Mães', 'Quem ama produtos naturais'],
    use: 'Na pele limpa, aplique e massageie suavemente até a completa absorção. Nas pontas do cabelo, use uma pequena quantidade. Para misturar com óleo essencial, a cada 10 ml de óleo vegetal adicione 6 gotas de óleo essencial, conforme o rótulo.',
    care: ['Uso externo.', 'Faça um teste de sensibilidade antes do primeiro uso.', 'Em caso de sensibilização, descontinue o uso.', 'Pessoas com sensibilidade a uva devem evitar o produto.', 'Evite contato com os olhos.', 'Evite exposição à luz solar e guarde em local fresco e seco.', 'Mantenha fora do alcance de crianças.'],
    closing: 'Neste Natal, presenteie com um momento de cuidado.',
    other: 'vela-de-panetone',
  },
  'vela-de-panetone': {
    slug: 'vela-de-panetone', kitId: 'vela-panetone', draft: true,
    name: 'Vela de Panetone',
    title: 'Vela Aromática de Panetone Alquiverde em Copo de Vidro com Rótulo Natalino',
    subtitle: 'Vela aromática de panetone em copo de vidro com rótulo vermelho natalino, numa caixa transparente',
    tagline: 'O cheirinho de ceia de Natal num copo de vidro.',
    intro: [
      'Deixe a casa com cheirinho de ceia de Natal. A vela Panetone traz o aroma doce e amanteigado de panetone com frutas, em copo de vidro com rótulo vermelho natalino de bengalinhas, biscoitos de gengibre e flocos de neve.',
      'Já vem dentro de uma caixa transparente, pronta para presentear.',
    ],
    facts: ['Aroma de panetone', 'Copo de vidro', 'Rótulo vermelho', 'Caixa transparente'],
    tone: '#b3262f', bg: '#f6e3dc', ink: '#6d1c22',
    contents: [{ qty: 1, item: 'vela' }],
    box: { label: 'Caixa transparente', img: '/kits/vela-biscoitos-frente.webp' },
    variants: [{ label: 'Rótulo vermelho natalino', img: '/kits/vela-biscoitos-frente.webp', soaps: [] }],
    giftTitle: 'O cheirinho da ceia, pronto para presentear',
    gift: [
      'Perfuma a sala, o quarto ou a mesa de Natal e deixa as noites de fim de ano mais aconchegantes.',
      'Um presente para amigos, professores, mães e amigo secreto: a vela já vem na caixa transparente.',
    ],
    giftFor: ['Amigo secreto', 'Professores', 'Mães', 'Mesa de Natal'],
    use: 'Apoie a vela sobre uma superfície firme e resistente ao calor. Apare o pavio a cerca de 0,5 cm antes de acender. Na primeira vez, deixe queimar até a cera derreter por toda a superfície (2 a 3 horas), para não formar "túnel". Acenda por no máximo 4 horas de cada vez. Apague e espere esfriar antes de acender de novo.',
    care: ['Nunca deixe a vela acesa sem supervisão.', 'Mantenha longe de cortinas, papéis, correntes de ar, crianças e animais de estimação.', 'Não mova a vela acesa nem com cera derretida.', 'Pare de usar quando restar cerca de 1 cm de cera.'],
    closing: 'Neste Natal, acenda o cheirinho de panetone.',
    other: 'vela-gingerbread',
  },
  'vela-gingerbread': {
    slug: 'vela-gingerbread', kitId: 'vela-gingerbread', draft: true,
    name: 'Vela Gingerbread',
    title: 'Vela Aromática Gingerbread Alquiverde em Copo de Vidro com Rótulo Natalino',
    subtitle: 'Vela aromática de biscoito de gengibre em copo de vidro com rótulo branco e dourado, numa caixa transparente',
    tagline: 'O cheirinho de biscoito de gengibre num copo de vidro.',
    intro: [
      'Deixe a casa com cheirinho de Natal. A vela Gingerbread traz o aroma doce e especiado de biscoito de gengibre, em copo de vidro com rótulo natalino branco e dourado.',
      'Já vem dentro de uma caixa transparente, pronta para presentear.',
    ],
    facts: ['Aroma de gingerbread', 'Copo de vidro', 'Rótulo branco e dourado', 'Caixa transparente'],
    tone: '#4f6b45', bg: '#eaeee3', ink: '#2c4226',
    contents: [{ qty: 1, item: 'vela-gingerbread' }],
    box: { label: 'Caixa transparente', img: '/kits/vela-natalina-frente.webp' },
    variants: [{ label: 'Rótulo branco e dourado', img: '/kits/vela-natalina-frente.webp', soaps: [] }],
    giftTitle: 'Biscoito de gengibre recém-assado, sem forno',
    gift: [
      'Perfuma a sala, o quarto ou a mesa de Natal e deixa as noites de fim de ano mais aconchegantes.',
      'Um presente para amigos, professores, mães e amigo secreto: a vela já vem na caixa transparente.',
    ],
    giftFor: ['Amigo secreto', 'Professores', 'Mães', 'Mesa de Natal'],
    use: 'Apoie a vela sobre uma superfície firme e resistente ao calor. Apare o pavio a cerca de 0,5 cm antes de acender. Na primeira vez, deixe queimar até a cera derreter por toda a superfície (2 a 3 horas), para não formar "túnel". Acenda por no máximo 4 horas de cada vez. Apague e espere esfriar antes de acender de novo.',
    care: ['Nunca deixe a vela acesa sem supervisão.', 'Mantenha longe de cortinas, papéis, correntes de ar, crianças e animais de estimação.', 'Não mova a vela acesa nem com cera derretida.', 'Pare de usar quando restar cerca de 1 cm de cera.'],
    closing: 'Neste Natal, acenda o cheirinho de gingerbread.',
    other: 'presente-variado',
  },
};

/** Variantes normalizadas: kits de combinação única viram uma variante só. */
export function variantsOf(page) {
  if (page.variants) return page.variants;
  const soaps = page.contents.flatMap((c) => (c.key ? Array.from({ length: c.qty }, () => c.key) : []));
  return [{ label: page.varieties.map((v) => SOAP_INFO[v.key].name).join(' · '), img: page.box.img, soaps, model: page.model }];
}

/** Texto de cada sabonete do kit: usa o texto oficial do kit quando existe. */
export function soapVarieties(page) {
  const all = [...new Set(variantsOf(page).flatMap((v) => v.soaps))];
  return all.map((key) => {
    const own = page.varieties?.find((v) => v.key === key);
    const inVariants = variantsOf(page).filter((v) => v.soaps.includes(key)).map((v) => v.label);
    return { key, ...SOAP_TEXT[key], ...own, inVariants: page.variants && page.variants.length > 1 ? inVariants : [] };
  });
}

/** Cuidados do kit: base + específicos dos itens + alerta de própolis quando houver. */
export function careOf(page) {
  const extra = page.contents.flatMap((c) => (c.item ? ITEM_INFO[c.item].care : []));
  const soaps = variantsOf(page).flatMap((v) => v.soaps);
  if (soaps.includes('propolis')) extra.push('Própolis: não use se tiver alergia a produtos apícolas (mel, própolis, pólen).');
  if (soaps.some((k) => k.startsWith('barbatimao'))) extra.push('Barbatimão tem toque adstringente: se sentir a pele seca, hidrate depois do banho.');
  return [...new Set([...page.care, ...extra])];
}

export const pageForKit = (kitId) => Object.values(KIT_PAGES).find((p) => p.kitId === kitId);

/** Lista expandida dos sabonetes (repete conforme a quantidade), na ordem do conteúdo. */
export const soapList = (page) => page.contents.flatMap((c) => Array.from({ length: c.qty }, () => c.key));
