# Direção de movimento — AlquiVerde · Ateliê de Presentes

## Aromas do Jardim · vitrine 3D

- Caixa de papel dourado acetinado: relevo extraído da foto, cantos arredondados, tampa oca e forro claro. A geometria parte de um cubo unitário para preservar as normais planas no addon Three.js r178 instalado.
- A tampa se afasta antes dos cinco frascos subirem em sequência. Os rótulos são do atlas fotográfico original. A apresentação aberta distribui os frascos em três alturas; ao fechar, a tampa espera os frascos descerem.
- Molas físicas com solução analítica: entrada e abertura `stiffness 100 / damping 17`, rotação `300 / 30`, frascos `140 / 21`. Arraste com inércia proporcional ao tempo, setas para girar e inclinar, botões para abrir, fechar e repetir.
- Enquadramento considera a largura da tampa aberta e reserva espaço aos controles. Sem cursor ampliado sobre o produto. Renderização pausa fora da tela e em aba oculta; em movimento reduzido, os estados são imediatos e a cena só renderiza sob demanda.
- A página aguarda as duas texturas reais do modelo procedural, sem solicitar uma frente inexistente. Falha de textura mantém a foto. O mesmo modelo atende a coleção e a página do kit.
- Referências consultadas: `content-section-000006` (butter.video, catálogo pessoal: composição arejada e revelação em sequência; observação parcial de motion), Magic UI `interactive-hover-button` (controle compacto com resposta de hover, adaptado para JS/CSS), skills Awwwards Motion e Three.js. Não foram adicionadas dependências React/Tailwind.
- Verificação reproduzível: `npm test`, `npm run lint`, `npm run build` e `BASE_URL=<servidor> node tools/check-oil-gift.mjs` (a variável pode ser definida com `$env:BASE_URL` no PowerShell). Evidências em `seo-evidence/jardim-*`.

**Tese:** *papel que se desembrulha*: cada coisa entra como um presente sendo aberto, com fita que se solta, papel que se abre e objeto que sobe e assenta com calma. O tom é premium e acolhedor, nunca agitado.

## Referências usadas
- **Biblioteca de componentes, hero-000003 (tengilemalamala.com, cosméticos):** título revelado letra por letra (~1,6 s) e capa do hero que cresce de 1,15 para 1 (~2 s). Aplicado ao "Carinho que se embrulha." e à foto em arco.
- **Biblioteca, card-000002 / feature-card-000001:** imagem com parallax ligado à rolagem dentro do card. Aplicado aos painéis dos kits.
- **Motion Graphics Studio, princípios comuns:** continuidade de objeto em vez de crossfade (o laço do preloader vira a abertura do hero; a caixa 3D se abre e revela o kit); inversão de fundo no beat (creme → vinho quando a caixa abre); troca de palavra no lugar, com a antiga saindo para cima com blur e a nova entrando de baixo ("Escolher → Embrulhar → Fazer alguém sorrir").
- **Motion design, arquétipo Premium:** 350–900 ms, sem overshoot em UI. A exceção lúdica é a etiqueta do cartão, que balança com mola (elastic).

## Tokens
| token | GSAP | uso |
|---|---|---|
| ease.enter | `expo.out` (0.16,1,0.3,1) | entradas, revelações |
| ease.soft | `power3.out` | cards, textos |
| ease.exit | `power3.in` | saídas (≈65 % da entrada) |
| ease.inOut | `power3.inOut` | morphs, painéis do preloader |
| ease.swing | `elastic.out(1, 0.35)` | etiqueta, laço |
| dur.micro | 0.15 s | hover, press |
| dur.exit | 0.32 s | |
| dur.enter | 0.8 s | |
| dur.hero | 1.4 s | título, capa |
| stagger | 0.025 s (letras) · 0.06 s (cards) · 0.12 s (seções) |

## Camadas (primária / secundária / ambiente)
- **Hero:** título (primária); laço desenhando e estrela girando (secundária); caixas 3D flutuando e poeira dourada em WebGL (ambiente).
- **Coleção (desktop, `kitStage.js`):** palco 3D único dentro de um arco fixo + trilho com as 11 miniaturas. A seção fica presa; cada 70 % de tela de rolagem troca o kit. Na troca, a caixa sai de lado (0,32 s, `exit`) e a próxima entra do outro lado girando (0,95 s, `enter`); o texto antigo sobe com desfoque e o novo vem de baixo (stagger 0,05 s); o contador 01/11 rola no lugar; o fundo vai para a cor do kit (0,8 s). Clicar numa miniatura pula direto, sem passar pelos kits do meio. Trocar de combinação gira a caixa como cartão. Uma única cena WebGL (`setModel`); a foto aparece na hora e o 3D assume quando a textura da frente chega.
- **Coleção (celular, reduced motion):** lista vertical, um kit por bloco.
- **Abra o presente:** tampa sobe e kit emerge (primária); palavras trocando (secundária); partículas e fundo invertendo (ambiente).
- **Empresas:** shader de seda verde-floresta reagindo ao ponteiro (ambiente).

## Acessibilidade
`prefers-reduced-motion`: sem pin/scrub, sem WebGL animado, conteúdo visível no estado final.

## Página de cada kit (`kit.html?k=<slug>`)
Mesma tese ("papel que se desembrulha") e os mesmos tokens. Referências extras: 21st **Feature List Showcase** (lista ↔ foto), Magic UI **Text Reveal** e **Magic Card**, catálogo (tengilemalamala · splits 62/38 arejados).
- **Entrada:** as duas abas de papel vinho se abrem para os lados (0,9 s, `inOut`) — continuação do preloader da landing; o pedestal sobe (1,1 s), o kit sobe e assenta (1,4 s, `enter`), o nome é escrito letra a letra (stagger 0,025 s), o resto entra em fila (0,06 s).
- **Abra a caixa:** a foto abre do centro para as bordas (clip-path, 1,3 s, `inOut`); os números pulam no lugar (0,08 s); clicar num número abre o item na lista (acordeão 0,5 s / saída 0,32 s).
- **Sabonetes:** vitrine 3D fixa; o sabonete gira de carta quando o texto correspondente cruza a linha de 60 % da tela.
- **Fecho:** frase revelada palavra por palavra com a rolagem (scrub), como o Text Reveal do Magic UI.
- **Reduced motion:** sem cortina, sem scrub; frase final já acesa.


## Black Friday (home, `bf.js` + `bf.css`)
Mesma tese: o cartão verde-floresta **se abre como papel** (clip-path de `inset(10% 6%)` a `inset(0)`, 1,2 s, `power3.inOut`); o selo dourado aparece com `back.out(2)`; o título sobe letra a letra (SplitText, rotateX −60°, stagger 0,022 s, `expo.out`); o sublinhado dourado é desenhado (DrawSVG, 0,9 s); a **etiqueta de desconto cai pendurada no cordão e balança até parar** (`elastic.out(1.1, 0.25)`, 2,2 s), com o número contando de 0 até o maior desconto; depois respira (±2,4°, `sine.inOut`). Passar o mouse na etiqueta faz ela balançar de novo.
- Ambiente: aurora de três manchas de luz em CSS (só transform), estrelas douradas (`sparkles`), grão, luz que segue o ponteiro; etiqueta inclina na direção do mouse (quickTo).
- Rolagem: aurora e etiqueta em parallax (scrub). Faixa de ofertas (kits com desconto, foto + de/por + selo) corre em loop, desacelera com o mouse, para com o foco do teclado e fora da tela.
- Relógio: ponteiros giram; antes das 12h em dia útil (horário de Brasília) aparece a contagem regressiva HH:MM:SS com os dígitos virando com mola.
- Movimento reduzido e modo leve: tudo no estado final, sem loops; faixa de ofertas vira rolagem manual.
- Referências: skills Awwwards Motion (mola, vidro sobre escuro, luz do ponteiro), GSAP ScrollTrigger (timeline única no enter, scrub só no parallax), UI/UX Pro Max (stagger, reduced-motion, foco visível). Catálogo pessoal consultado (`features-000007`, resend.com: seção escura em 2 colunas), sem equivalente direto.

## Modo leve opcional
- Botão persistente “Modo leve”, disponível nas três páginas; preferência guardada no navegador.
- `?leve=1` ativa e `?leve=0` desativa, inclusive quando o armazenamento está bloqueado.
- Mantém tipografia, cores, fotografias, fundos e acabamento da coleção. Apresenta os kits em cards verticais, sem rolagem presa.
- Sem WebGL, cenas 3D, preloader, parallax, partículas e animações contínuas. As bibliotecas 3D são importadas apenas no modo completo.
- O montador usa uma caixa com fotos dos sabonetes e extras escolhidos; continua permitindo fechar, reabrir e adicionar à sacola. A montagem é preservada ao trocar de modo.
- `experience.js` controla a preferência; `light.css` define a apresentação; `lightScenes.js` fornece as prévias estáticas.


## Tipografia
- Títulos: **Fraunces**, peso 550; abertura em 600, destaque em itálico 500. Formas mais encorpadas e orgânicas; itálico reservado a momentos de destaque.
- Textos e controles: **Bricolage Grotesque**, pesos 400–600; descrições dos kits em estilo romano para leitura rápida.
- Fontes WOFF2 locais em `public/fonts/`, com caracteres latinos e acentos portugueses. Pesos variáveis preservados e eixo óptico fixado para limitar o tamanho dos arquivos.
- Licenças OFL junto dos arquivos. Fontes: https://github.com/googlefonts/fraunces e https://github.com/ateliertriay/bricolage.
- Tamanhos e quebras revisados nas três páginas, inclusive no modo leve. Nomes dos ingredientes têm escala própria no celular para evitar cortes.
