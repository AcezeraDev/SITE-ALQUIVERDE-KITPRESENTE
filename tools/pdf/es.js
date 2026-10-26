// Catálogo em espanhol (?es): o catálogo é montado em português e cada texto é trocado por estas traduções.
// Texto novo no site sem tradução aqui aparece no fim do build ("sem tradução: ...").

// Nomes dos kits, ingredientes e itens (vêm de src/kits.js)
const NOMES = {
  'Caixa Prata': 'Caja Plata', 'Laço de Natal': 'Lazo de Navidad', 'Feliz Natal': 'Feliz Navidad', 'Laço Tropical': 'Lazo Tropical',
  'Especiarias de Natal': 'Especias de Navidad', Especiarias: 'Especias', 'Cinco Aromas': 'Cinco Aromas', 'Aromas do Jardim': 'Aromas del Jardín',
  'Aroma Dourado': 'Aroma Dorado', 'Raio de Sol': 'Rayo de Sol', 'Presente Variado': 'Regalo Variado', 'Semente de Uva': 'Semilla de Uva',
  'Vela de Panetone': 'Vela de Panettone', 'Vela Gingerbread': 'Vela Gingerbread',
  'Kit Clássico': 'Kit Clásico', 'Kit Delicado': 'Kit Delicado', 'Kit da Casa': 'Kit de la Casa',
  Aroeira: 'Aroeira', Barbatimão: 'Barbatimão', Calêndula: 'Caléndula', Própolis: 'Propóleo', Coco: 'Coco', Açafrão: 'Cúrcuma',
  'Barbatimão e Aroeira': 'Barbatimão y Aroeira', Cravo: 'Clavo', Canela: 'Canela', Limão: 'Limón', Eucalipto: 'Eucalipto',
  Alecrim: 'Romero', Lavanda: 'Lavanda', 'Capim Limão': 'Hierba Limón', Tangerina: 'Mandarina',
};

const TEXTOS = {
  // capa
  '✳︎ Coleção de Natal 2026': '✳︎ Colección de Navidad 2026',
  'Carinho que': 'Cariño que', 'se embrulha.': 'se envuelve.',
  'Kits de sabonetes vegetais, essências e cuidados naturais, montados à mão e prontos para presentear.': 'Kits de jabones vegetales, esencias y cuidados naturales, armados a mano y listos para regalar.',
  'De: você': 'De: ti', 'Para:': 'Para:', 'alguém especial.': 'alguien especial.',
  '7 sabonetes': '7 jabones', 'feitos à mão': 'hechos a mano',
  // manifesto
  'Alquiverde · Natal 2026': 'Alquiverde · Navidad 2026', 'Feito à mão': 'Hecho a mano',
  'Do quintal brasileiro': 'Del patio brasileño', 'para a sua caixa.': 'a tu caja.',
  'Tem presente que começa a encantar antes mesmo de abrir.': 'Hay regalos que encantan antes incluso de abrirlos.',
  'Ingredientes que crescem aqui, sabonetes vegetais feitos em pequenos lotes e cada caixa montada à mão. A gente acomoda tudo, fecha a tampa e dá o laço. Na hora de abrir, o presente vira lembrança.':
    'Ingredientes que crecen en Brasil, jabones vegetales hechos en pequeños lotes y cada caja armada a mano. Acomodamos todo, cerramos la tapa y hacemos el lazo. Al abrirlo, el regalo se convierte en recuerdo.',
  'Embrulho à mão': 'Envuelto a mano', 'Escolha o kit': 'Elige el kit', 'A gente embrulha': 'Nosotros lo envolvemos',
  'Caixa, fita e laço feitos à mão.': 'Caja, cinta y lazo hechos a mano.', 'Alguém sorri': 'Alguien sonríe',
  'É assim que um presente vira lembrança.': 'Así es como un regalo se convierte en recuerdo.',
  'Aroeira ✳︎ Calêndula ✳︎ Barbatimão ✳︎ Própolis ✳︎ Coco ✳︎ Açafrão ✳︎ Cravo ✳︎ Canela ✳︎ Bucha vegetal ✳︎ Vela de panetone ✳︎':
    'Aroeira ✳︎ Caléndula ✳︎ Barbatimão ✳︎ Propóleo ✳︎ Coco ✳︎ Cúrcuma ✳︎ Clavo ✳︎ Canela ✳︎ Esponja vegetal ✳︎ Vela de panettone ✳︎',
  // coleção
  'A coleção': 'La colección', 'Kits de Natal:': 'Kits de Navidad:', 'escolha seu presente.': 'elige tu regalo.',
  'Cada kit tem o seu tamanho de abraço. Do mimo de amigo-secreto ao presente que enche a casa de cheiro de festa.':
    'Cada kit tiene su tamaño de abrazo. Del detalle para el amigo secreto al regalo que llena la casa de olor a fiesta.',
  'Preços de referência da loja em outubro de 2026. Confirme preço, frete e disponibilidade em alquiverde.com.br.':
    'Precios de referencia en reales (R$), tienda Alquiverde, octubre de 2026. Confirma precio, envío y disponibilidad en alquiverde.com.br.',
  // páginas de kit
  'Kit em destaque': 'Kit destacado', 'O mais pedido': 'El más pedido',
  'Sabonetes vegetais em pequenos lotes, ingredientes que crescem aqui e cada caixa montada à mão.': 'Jabones vegetales en pequeños lotes, ingredientes que crecen en Brasil y cada caja armada a mano.',
  'Caixa de 3, 6 ou 9 sabonetes, do seu jeito, com essências, óleos e vela.': 'Caja de 3, 6 o 9 jabones, a tu manera, con esencias, aceites y vela.', 'Feliz': 'Feliz', 'Natal.': 'Navidad.', Consulte: 'Consultar',
  'Em todas as caixas': 'En todas las cajas', 'O que vem na caixa': 'Qué trae la caja', 'na loja Alquiverde': 'en la tienda Alquiverde',
  'Caixas com laço': 'Cajas con lazo', 'Especiarias e aromas': 'Especias y aromas', 'Casa perfumada': 'Casa perfumada',
  'Caixas de mimo': 'Cajas detalle', 'Para amigo-secreto, professora, vizinha': 'Para el amigo secreto, la maestra, la vecina',
  'Pequenos': 'Pequeños', 'grandes mimos.': 'grandes detalles.', 'Velas de Natal': 'Velas de Navidad',
  // taglines e combinações
  'Quatro sabonetes, essências e uma vela de panetone para perfumar o Natal.': 'Cuatro jabones, esencias y una vela de panettone para perfumar la Navidad.',
  'Sabonetes de Coco, Calêndula, Aroeira e Barbatimão, duas essências, vela de panetone e bucha vegetal.': 'Jabones de Coco, Caléndula, Aroeira y Barbatimão, dos esencias, vela de panettone y esponja vegetal.',
  'Dois sabonetes de Aroeira e dois de Coco, duas essências, vela de panetone e bucha vegetal.': 'Dos jabones de Aroeira y dos de Coco, dos esencias, vela de panettone y esponja vegetal.',
  'Sabonetes de Barbatimão, Própolis, Açafrão e Barbatimão com Aroeira, duas essências, vela de panetone e bucha vegetal.': 'Jabones de Barbatimão, Propóleo, Cúrcuma y Barbatimão con Aroeira, dos esencias, vela de panettone y esponja vegetal.',
  'Um banho completo, com laço vermelho e tudo.': 'Un baño completo, con lazo rojo y todo.',
  'Coco, cerrado e óleo de uva: um banho inteiro, com laço vermelho.': 'Coco, cerrado brasileño y aceite de uva: un baño completo, con lazo rojo.',
  'O abraço mais apertado: quatro sabonetes, óleos de canela e cravo.': 'El abrazo más apretado: cuatro jabones y aceites de canela y clavo.',
  'Cinco óleos essenciais enfileirados na vitrine, com laço de cetim: a casa inteira com cheiro de festa.': 'Cinco aceites esenciales en fila en la vitrina, con lazo de satén: toda la casa con olor a fiesta.',
  'Lavanda, Capim Limão, Alecrim, Cravo e Tangerina: cinco óleos essenciais numa caixinha dourada com laço.': 'Lavanda, Hierba Limón, Romero, Clavo y Mandarina: cinco aceites esenciales en una cajita dorada con lazo.',
  'Um aromatizador de porcelana e óleo essencial de Alecrim: a casa perfumada, numa caixa dourada com laço.': 'Un difusor de porcelana y aceite esencial de Romero: la casa perfumada, en una caja dorada con lazo.',
  'Seis sabonetes vegetais, dois de cada aroma, numa caixa prata com visor e laço verde de cetim.': 'Seis jabones vegetales, dos de cada aroma, en una caja plateada con visor y lazo verde de satén.',
  'Óleo essencial de Laranja e um sabonete vegetal sortido numa caixinha dourada com janela.': 'Aceite esencial de Naranja y un jabón vegetal surtido en una cajita dorada con ventana.',
  'Três sabonetes vegetais, cada um de uma variedade, numa caixa dourada com visor. É só entregar.': 'Tres jabones vegetales, cada uno de una variedad, en una caja dorada con visor. Solo hay que entregarlo.',
  'Óleo vegetal de semente de uva, puro e natural, numa caixa dourada com tampa transparente.': 'Aceite vegetal de semilla de uva, puro y natural, en una caja dorada con tapa transparente.',
  'Cheirinho de ceia de Natal: aroma doce e amanteigado de panetone num copo de vidro.': 'Aroma de cena navideña: dulce y mantecoso, de panettone, en un vaso de vidrio.',
  'Aroma doce e especiado de biscoito de gengibre, num copo de vidro com rótulo branco e dourado.': 'Aroma dulce y especiado de galleta de jengibre, en un vaso de vidrio con etiqueta blanca y dorada.',
  '2 Coco + 2 Calêndula': '2 Coco + 2 Caléndula', '4 Coco': '4 Coco',
  'Aromatizador elétrico': 'Difusor eléctrico', 'Alecrim 10 mL': 'Romero 10 mL',
  'Rótulo vermelho natalino': 'Etiqueta roja navideña', 'Rótulo branco e dourado': 'Etiqueta blanca y dorada',
  // itens
  '4 sabonetes vegetais 90 g': '4 jabones vegetales de 90 g', 'Essência Morango com Champanhe': 'Esencia Fresa con Champán', 'Essência Natal': 'Esencia Navidad',
  'Vela aromática de Panetone': 'Vela aromática de Panettone', 'Bucha vegetal': 'Esponja vegetal', 'Caixa vermelha com visor': 'Caja roja con visor',
  'Sabonete vegetal Calêndula 90 g': 'Jabón vegetal Caléndula 90 g', 'Sabonete vegetal Barbatimão e Aroeira 90 g': 'Jabón vegetal Barbatimão y Aroeira 90 g',
  'Óleo de Amêndoa Doce': 'Aceite de Almendra Dulce', 'Caixa vermelha com laço': 'Caja roja con lazo', 'Sabonete vegetal Coco 90 g': 'Jabón vegetal Coco 90 g',
  'Bucha vegetal natural': 'Esponja vegetal natural', 'Óleo de Semente de Uva com Vitamina E': 'Aceite de Semilla de Uva con Vitamina E',
  'Caixa vermelha metalizada com laço de cetim': 'Caja roja metalizada con lazo de satén',
  '4 sabonetes vegetais 90 g (2 Coco + 2 Calêndula ou 4 Coco)': '4 jabones vegetales de 90 g (2 Coco + 2 Caléndula o 4 Coco)',
  'Óleo de Canela 10 mL': 'Aceite de Canela 10 mL', 'Óleo Essencial de Cravo 10 mL': 'Aceite Esencial de Clavo 10 mL', 'Caixa vermelha com divisórias': 'Caja roja con divisiones',
  'Óleo Essencial de Limão Siciliano 10 mL': 'Aceite Esencial de Limón Siciliano 10 mL', 'Óleo Essencial de Eucalipto 10 mL': 'Aceite Esencial de Eucalipto 10 mL',
  'Óleo Essencial de Alecrim 10 mL': 'Aceite Esencial de Romero 10 mL', 'Óleo Essencial de Canela 10 mL': 'Aceite Esencial de Canela 10 mL',
  'Caixa vermelha com visor e laço de cetim': 'Caja roja con visor y lazo de satén',
  'Óleo Essencial de Lavanda': 'Aceite Esencial de Lavanda', 'Óleo Essencial de Capim Limão': 'Aceite Esencial de Hierba Limón', 'Óleo Essencial de Alecrim': 'Aceite Esencial de Romero',
  'Óleo Essencial de Cravo': 'Aceite Esencial de Clavo', 'Óleo Essencial de Tangerina': 'Aceite Esencial de Mandarina', 'Caixa dourada texturizada com laço': 'Caja dorada texturizada con lazo',
  'Aromatizador elétrico de porcelana, de tomada': 'Difusor eléctrico de porcelana, para enchufe', 'Caixa dourada com tampa transparente e laço de cetim': 'Caja dorada con tapa transparente y lazo de satén',
  '2 sabonetes vegetais Barbatimão 90 g': '2 jabones vegetales Barbatimão 90 g', '2 sabonetes vegetais Calêndula 90 g': '2 jabones vegetales Caléndula 90 g',
  '2 sabonetes vegetais Aroeira 90 g': '2 jabones vegetales Aroeira 90 g', 'Caixa prata com visor e laço verde de cetim': 'Caja plateada con visor y lazo verde de satén',
  'Óleo Essencial de Laranja': 'Aceite Esencial de Naranja', 'Sabonete vegetal 90 g de variedade sortida': 'Jabón vegetal de 90 g, variedad surtida',
  'Caixa dourada com tampa transparente e laço dourado': 'Caja dorada con tapa transparente y lazo dorado',
  '3 sabonetes vegetais de variedades diferentes, 90 g cada': '3 jabones vegetales de variedades diferentes, 90 g cada uno',
  'Variedades sortidas entre Barbatimão, Barbatimão com Aroeira, Aroeira, Calêndula, Coco, Açafrão e Própolis': 'Variedades surtidas entre Barbatimão, Barbatimão con Aroeira, Aroeira, Caléndula, Coco, Cúrcuma y Propóleo',
  'Caixa dourada com visor transparente': 'Caja dorada con visor transparente', 'Laço de fita dourada': 'Lazo de cinta dorada',
  'Óleo de Semente de Uva (óleo vegetal), puro e natural': 'Aceite de Semilla de Uva (aceite vegetal), puro y natural', 'Frasco escuro com tampa preta': 'Frasco oscuro con tapa negra',
  'Caixa dourada texturizada com tampa transparente': 'Caja dorada texturizada con tapa transparente',
  'Vela aromática de panetone em copo de vidro': 'Vela aromática de panettone en vaso de vidrio', 'Rótulo vermelho com bengalinhas, biscoitos e flocos de neve': 'Etiqueta roja con bastones, galletas y copos de nieve',
  'Caixa transparente': 'Caja transparente', 'Vela aromática de gingerbread em copo de vidro': 'Vela aromática de gingerbread en vaso de vidrio',
  'Rótulo branco e dourado com flor, pinha e ramos de pinheiro': 'Etiqueta blanca y dorada con flor, piña y ramas de pino',
  // sabonetes
  'O que vai dentro da caixa': 'Lo que va dentro de la caja', 'Sabonetes vegetais': 'Jabones vegetales', '90 g': '90 g',
  'Sete sabonetes,': 'Siete jabones,', 'sete histórias.': 'siete historias.',
  'Para todos os tipos de pele, com ingredientes que crescem aqui. Eles aparecem nas caixas prontas e você também escolhe os seus no Monte o seu kit.':
    'Para todo tipo de piel, con ingredientes que crecen en Brasil. Están en las cajas listas y también puedes elegir los tuyos en Arma tu kit.',
  'A pimenta-rosa dos quintais brasileiros.': 'La pimienta rosa de los patios brasileños.', 'Árvore do cerrado, de casca generosa.': 'Árbol del cerrado brasileño, de corteza generosa.',
  'Flor dourada, cor de sol de fim de tarde.': 'Flor dorada, color de sol de atardecer.', 'Um tesouro guardado pelas abelhas.': 'Un tesoro guardado por las abejas.',
  'Lembrança de praia em pleno dezembro.': 'Recuerdo de playa en pleno diciembre.', 'Raiz dourada, com cor de especiaria.': 'Raíz dorada, con color de especia (en la etiqueta: Açafrão).',
  'O encontro do cerrado com a pimenta-rosa, num só sabonete.': 'El encuentro del cerrado con la pimienta rosa, en un solo jabón.',
  'Escolha os seus': 'Elige los tuyos', 'Combine 3, 6 ou 9 sabonetes no Monte o seu kit.': 'Combina 3, 6 o 9 jabones en Arma tu kit.',
  // monte + empresas
  'Do seu jeito': 'A tu manera', 'Monte o seu kit': 'Arma tu kit', 'Monte o': 'Arma', 'seu kit.': 'tu kit.',
  'Caixa de 3, 6 ou 9 sabonetes, do jeito que você quiser, com essências, óleos e vela. No site você vê tudo caindo na caixa em 3D.':
    'Caja de 3, 6 o 9 jabones, como tú quieras, con esencias, aceites y vela. En el sitio ves todo cayendo en la caja en 3D.',
  sabonetes: 'jabones', '+ até 2 extras': '+ hasta 2 extras', '+ até 3 extras': '+ hasta 3 extras', '+ até 4 extras': '+ hasta 4 extras',
  'Para empresas': 'Para empresas', 'Presentes de Natal': 'Regalos de Navidad', 'para empresas.': 'para empresas.',
  'Equipe, clientes e parceiros merecem um obrigado que se sente pelo cheiro. A gente monta os kits, personaliza o cartão e entrega.':
    'Tu equipo, clientes y socios merecen un gracias que se siente por el aroma. Armamos los kits, personalizamos la tarjeta y entregamos.',
  'Escolha os kits': 'Elige los kits', 'Modelos e quantidades para cada grupo.': 'Modelos y cantidades para cada grupo.',
  Personalize: 'Personaliza', 'Cartão com a mensagem e a marca da sua empresa.': 'Tarjeta con el mensaje y la marca de tu empresa.',
  'Receba pronto': 'Recíbelo listo', 'Embrulhado à mão e entregue no endereço combinado.': 'Envuelto a mano y entregado en la dirección acordada.',
  // contracapa
  'Pequenos detalhes, grandes sentimentos.': 'Pequeños detalles, grandes sentimientos.', 'Encontre o seu': 'Encuentra tu', 'presente.': 'regalo.',
  'Loja Alquiverde': 'Tienda Alquiverde', '(11) 99000-7047': '+55 11 99000-7047', 'Kits prontos': 'Kits listos', 'Monte o seu': 'Arma el tuyo',
  'Presentes para empresas': 'Regalos para empresas', 'Cosméticos naturais': 'Cosméticos naturales', 'Natal 2026': 'Navidad 2026',
  // alt e title
  'Alquiverde Cosméticos Naturais': 'Alquiverde Cosméticos Naturales', 'Kit Feliz Natal em 3D': 'Kit Feliz Navidad en 3D', 'Kit Feliz Natal': 'Kit Feliz Navidad',
  'Presentes embrulhados com fita vinho': 'Regalos envueltos con cinta color vino', 'Mãos embrulhando um presente': 'Manos envolviendo un regalo',
  'Tamanho do abraço': 'Tamaño del abrazo',
  // revisão de texto de 26/10 (frases próprias de cada kit e chamadas mais claras)
  'Presentes com sabonetes vegetais, óleos e aromas para celebrar o Natal. Cada detalhe preparado à mão, pronto para surpreender.': 'Regalos con jabones vegetales, aceites y aromas para celebrar la Navidad. Cada detalle preparado a mano, listo para sorprender.',
  'montadas à mão': 'armadas a mano',
  'Das nossas mãos': 'De nuestras manos', 'para alguém especial.': 'para alguien especial.',
  'O cuidado começa antes de abrir.': 'El cuidado empieza antes de abrir.',
  'Sabonetes vegetais, aromas e combinações escolhidas com carinho, em caixas montadas à mão. A gente acomoda cada item, fecha a tampa e finaliza o laço. Você escolhe para quem vai esse cuidado.': 'Jabones vegetales, aromas y combinaciones elegidas con cariño, en cajas armadas a mano. Acomodamos cada producto, cerramos la tapa y terminamos el lazo. Tú eliges para quién es ese cuidado.',
  'Do amigo-secreto ao presente especial: encontre a combinação que cabe na sua lista e no seu orçamento.': 'Del amigo secreto al regalo especial: encuentra la combinación que cabe en tu lista y en tu presupuesto.',
  'Para um ritual de banho': 'Para un ritual de baño', 'Presente completo': 'Regalo completo', 'Para quem ama especiarias': 'Para quien ama las especias',
  'Para perfumar a casa': 'Para perfumar la casa', 'Lembrança de Natal': 'Detalle de Navidad', 'Para o cuidado diário': 'Para el cuidado diario', 'Para o clima de Natal': 'Para el ambiente navideño',
  'Preços consultados na loja em outubro de 2026 e sujeitos a alteração. Confirme preço, frete e disponibilidade em alquiverde.com.br.': 'Precios en reales (R$), consultados en la tienda en octubre de 2026 y sujetos a cambios. Confirma precio, envío y disponibilidad en alquiverde.com.br.',
  'Destaque da coleção': 'Destacado de la colección', 'Consulte o valor': 'Consultar precio',
  'Um presente completo, do banho ao clima de Natal.': 'Un regalo completo, del baño al ambiente navideño.',
  'Quatro sabonetes vegetais, duas essências, vela de panetone e bucha vegetal, reunidos em uma caixa pronta para presentear.': 'Cuatro jabones vegetales, dos esencias, vela de panettone y esponja vegetal, reunidos en una caja lista para regalar.',
  'Um convite para transformar o banho em um momento de cuidado.': 'Una invitación a convertir el baño en un momento de cuidado.',
  'Coco, barbatimão e aroeira em uma combinação que leva cuidado ao banho.': 'Coco, barbatimão y aroeira en una combinación que lleva cuidado al baño.',
  'Canela, cravo e panetone: aromas que entram no clima do Natal.': 'Canela, clavo y panettone: aromas que se suman al ambiente navideño.',
  'Cinco aromas para descobrir novas combinações e perfumar seus espaços.': 'Cinco aromas para descubrir nuevas combinaciones y perfumar tus espacios.',
  'Entre notas florais, cítricas e herbais, um presente para explorar novos aromas.': 'Entre notas florales, cítricas y herbales, un regalo para explorar nuevos aromas.',
  'Um toque de alecrim para perfumar o cantinho favorito.': 'Un toque de romero para perfumar tu rincón favorito.',
  'Para agradecer, celebrar e surpreender': 'Para agradecer, celebrar y sorprender',
  'Seis sabonetes, três variedades e um presente cheio de cuidado.': 'Seis jabones, tres variedades y un regalo lleno de cuidado.',
  'O aroma da laranja encontra o cuidado do sabonete em uma pequena surpresa.': 'El aroma de la naranja se encuentra con el cuidado del jabón en una pequeña sorpresa.',
  'Três variedades de sabonete para descobrir novos favoritos.': 'Tres variedades de jabón para descubrir nuevos favoritos.',
  'Um cuidado para incluir no ritual de todos os dias.': 'Un cuidado para sumar al ritual de todos los días.',
  'O aroma do panetone para acompanhar os encontros de Natal.': 'El aroma del panettone para acompañar los encuentros de Navidad.',
  'Aroma de biscoito de gengibre: doçura e especiarias que combinam com o Natal.': 'Aroma de galleta de jengibre: dulzura y especias que combinan con la Navidad.',
  'Sete variedades': 'Siete variedades', 'para o seu cuidado.': 'para tu cuidado.',
  'Conheça os sabonetes da coleção e escolha suas combinações favoritas no Monte o seu kit.': 'Conoce los jabones de la colección y elige tus combinaciones favoritas en Arma tu kit.',
  'Escolha 3, 6 ou 9 sabonetes e complete seu presente com essências, óleos ou vela. Combine suas variedades favoritas e veja o kit antes de finalizar.': 'Elige 3, 6 o 9 jabones y completa tu regalo con esencias, aceites o vela. Combina tus variedades favoritas y mira el kit antes de finalizar.',
  '+ até 2 itens opcionais': '+ hasta 2 productos opcionales', '+ até 3 itens opcionais': '+ hasta 3 productos opcionales', '+ até 4 itens opcionais': '+ hasta 4 productos opcionales',
  'Neste Natal, transforme seu agradecimento em presente: kits para equipes, clientes e parceiros, com cartão personalizado e prontos para entregar.': 'Esta Navidad, convierte tu agradecimiento en un regalo: kits para equipos, clientes y socios, con tarjeta personalizada y listos para entregar.',
  'Seu próximo presente': 'Tu próximo regalo', 'começa aqui.': 'empieza aquí.',
  'Ver kits e preços': 'Ver kits y precios', 'Pedir ajuda pelo WhatsApp': 'Pedir ayuda por WhatsApp',
  'Escolha um kit na loja ou fale com a gente pelo WhatsApp para encontrar a combinação ideal.': 'Elige un kit en la tienda o escríbenos por WhatsApp para encontrar la combinación ideal.',
  // página de óleos essenciais
  'Aromas da coleção': 'Aromas de la colección', 'Óleos essenciais': 'Aceites esenciales', 'Aromas que': 'Aromas que', 'perfumam a casa.': 'perfuman la casa.',
  'Os óleos essenciais que entram nos kits de aromas da coleção.': 'Los aceites esenciales que forman parte de los kits de aromas de la colección.',
  Laranja: 'Naranja', 'Limão Siciliano': 'Limón Siciliano',
  ...NOMES,
};

const POR_EXTENSO = { um: 'uno', dois: 'dos', três: 'tres', quatro: 'cuatro', cinco: 'cinco', seis: 'seis', sete: 'siete', oito: 'ocho', nove: 'nueve', dez: 'diez', onze: 'once', doze: 'doce', treze: 'trece', catorze: 'catorce', quinze: 'quince' };
const ext = (w) => { const lw = w.toLowerCase(), es = POR_EXTENSO[lw] || lw; return w[0] === w[0].toUpperCase() ? es[0].toUpperCase() + es.slice(1) : es; };

// textos com partes que mudam (número de kits, número do kit)
const REGRAS = [
  [/^(\p{L}+) caixas prontas ou monte a sua\.$/u, (_, n) => `${ext(n)} cajas listas o arma la tuya.`],
  [/^(\p{L}+) caixas, (\p{L}+) abraços$/u, (_, a, b) => `${ext(a)} cajas, ${ext(b)} abrazos`],
  [/^(\d+) kits$/, (_, n) => `${n} kits`],
  [/^(\d+) opções para presentear$/, (_, n) => `${n} opciones para regalar`],
  [/^Kit (\d+)$/, (_, n) => `Kit ${n}`],
  [/^Kit (\d+) · o mais pedido$/, (_, n) => `Kit ${n} · el más pedido`],
  [/^Sabonete (.+)$/, (_, n) => `Jabón ${TEXTOS[n] || n}`],
  [/^Óleo essencial de (.+)$/, (_, n) => `Aceite esencial de ${TEXTOS[n] || n}`],
  // quantidade + sabonete, nas combinações do Feliz Natal ("2 Aroeira")
  [/^(\d+) (\p{Lu}.*)$/u, (m, n, nome) => (nome in TEXTOS ? `${n} ${TEXTOS[nome]}` : m)],
];

/** Tradução de um texto; devolve null quando não há. */
export function traduz(s) {
  if (s in TEXTOS) return TEXTOS[s];
  for (const [re, fn] of REGRAS) if (re.test(s)) return s.replace(re, fn);
  if (s.includes(' · ')) {
    const partes = s.split(' · ').map(traduz);
    return partes.every((p) => p !== null) ? partes.join(' · ') : null;
  }
  // só números, preços, endereços e marcas: fica igual
  if (/^[\d\s+R$.,:/-]*$/.test(s) || /^(alquiverde\.com\.br|WhatsApp|Alquiverde)$/.test(s)) return s;
  return null;
}

/** Traduz os textos, alt e title da página; devolve o que ficou sem tradução. */
export function traduzPagina(root = document.body) {
  const faltam = new Set();
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) {
    if (n.parentElement.closest('script,style,svg')) continue;
    const s = n.textContent.trim();
    if (!s) continue;
    const t = traduz(s);
    if (t === null) faltam.add(s);
    else n.textContent = n.textContent.replace(s, t);
  }
  root.querySelectorAll('[alt],[title]').forEach((el) => {
    for (const a of ['alt', 'title']) {
      const s = el.getAttribute(a);
      if (!s) continue;
      const t = traduz(s);
      if (t === null) faltam.add(s); else el.setAttribute(a, t);
    }
  });
  document.documentElement.lang = 'es';
  document.title = 'Alquiverde · Kits de Navidad 2026';
  return [...faltam];
}
