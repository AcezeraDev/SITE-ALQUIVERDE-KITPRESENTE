# Auditoria e implementação SEO AlquiVerde

Data: 24/10/2026. Projeto local: Vite com JavaScript, HTML e CSS; catálogo sazonal, páginas de produto e montador. O site ainda não foi publicado. Não foram realizadas alterações em uma conta de produção.

## A. Diagnóstico inicial e prioridades

| Gravidade | Evidência inicial | Tratamento |
|---|---|---|
| Crítico antes do lançamento | Produtos entregavam um template com `#kitRoot` vazio, sem H1 nem descrição própria no HTML inicial. Conteúdo dependia da execução de scripts e cenas. | 12 páginas físicas de produto com HTML completo e geração compartilhada com o navegador. |
| Alto | Catálogo e ingredientes eram inseridos por JavaScript; links de produto usavam `/kit.html?k=...`. | Catálogo no HTML, URLs por slug e redirecionamentos 301. |
| Alto | Ausência de canonicals, sitemap, robots e schema no código examinado. | Geração por ambiente e por rota; domínio público ainda pendente. |
| Alto | Lighthouse mobile: LCP de aproximadamente 8 s e TBT próximo de 10 s. Preloader e WebGL competiam com o conteúdo. | Conteúdo imediato; modo leve mobile; 3D e efeitos sob demanda; imagens responsivas. |
| Alto | URLs desconhecidas de kit voltavam para a coleção; um template genérico e um fallback de SPA poderiam mascarar erros. | MPA, página 404, tratamento local real de 404 e configuração equivalente preparada para Vercel. |
| Alto | Todos os 12 produtos marcados `draft: true`; preços anotados como snapshots de produtos em rascunho na Shopify. | Estado preservado: noindex nos kits e ausência no sitemap até revisão. Não foram inventados estoque nem ofertas públicas. |
| Alto | Formulário corporativo simulava o envio e só informava isso no sucesso. | Aviso visível antes do envio e alternativa de WhatsApp já existente no projeto. Backend continua pendente. |
| Alto | Cinco Aromas descreve cinco frascos, enquanto comentário e imagem indicam versão de quatro; nome de produto Shopify também conserva quarteto. | Rascunho preservado. Revisão de foto, quantidade e produto comercial é necessária. |
| Médio | Textos e botões com contraste insuficiente; link do cabeçalho perdia nome no mobile quando o texto era ocultado. | Contraste ajustado dentro da paleta e nome acessível no link. |
| Médio | Imagens grandes sem dimensões em vários templates. | WebP de 480/800 px, `srcset`, tamanhos e dimensões reais; originais preservados. |
| Médio | Títulos e descriptions de produtos dependiam de mudanças no cliente; apresentação sem Open Graph/Twitter. | Metadados estáticos únicos e cartões sociais condicionados ao domínio real. |
| Médio | Estudos experimentais podiam ser rastreados como páginas comuns. | `noindex, follow` nos quatro estudos do build. Não bloqueados no robots para que o noindex possa ser lido. |
| Baixo | H1 principal era apenas o slogan e headings de seções pouco descritivos. | Contexto de kits de Natal incorporado ao H1 e headings de coleção/empresas mais claros. |

P0 executado: HTML, indexação, URLs e erros. P1 executado: metadados, schema, navegação, FAQ e desempenho. P2 executado: acessibilidade e verificações. A revisão comercial e a validação no domínio publicado continuam como etapas de lançamento.

## B. Melhorias implementadas e arquivos

| Arquivos | Alteração e justificativa |
|---|---|
| `vite.config.js`, `tools/seo-build.mjs` | Site multipágina; geração de produtos, sitemap, robots, metadados e manifesto de rotas no build; suporte às mesmas páginas no desenvolvimento e ao legado no preview local. |
| `src/kitMarkup.js`, `src/kitPage.js` | Template de produto compartilhado pelo build e navegador. Reutilização do HTML inicial; variantes, hotspots, acordeões e 3D preservados e testados. |
| `src/seo.js` | Uma fonte de metadados, escaping de HTML/JSON-LD, canonicals e entidades com identificadores estáveis. |
| `src/kits.js`, `src/main.js`, `experimentos/experience.js` | Links descritivos por slug e catálogo já disponível sem JavaScript. |
| `index.html`, `monte.html`, `kit.html` | Headings e contexto, FAQ útil, instruções estáticas do montador e contato verificável no próprio projeto. Viewport antes do cálculo do modo mobile. |
| `src/experience.js`, `src/lazy.js`, `src/kitStage.js` | Preferência de experiência preservada entre URLs; cenas fora da tela aguardam proximidade; efeitos do hero aguardam interação. |
| `src/style.css`, `src/kit.css`, `src/monte.css` | Conteúdo visível no primeiro paint e sem scripts, contraste e nomes acessíveis corrigidos. |
| `tools/optimize-images.mjs`, `tools/image-sizes.mjs`, `tools/image-helpers.txt`, `src/imageSizes.js`, `public/responsive/` | Otimização reproduzível no pré-build, dimensões reais e troca correta de imagens responsivas. Integração também em `src/lightScenes.js` e `src/three/fallback.js`. |
| `404.html`, `vercel.json` | Erro dedicado, redirects 301, barras finais consistentes, ausência de catch-all para a home e cache imutável somente para assets com hash. |
| `package.json`, `package-lock.json` | Vite corrigido na linha 7; ferramentas de teste/auditoria e comandos reproduzíveis. |
| `.env.example`, `.gitignore`, `SEO-PUBLICACAO.md` | Configuração pública do domínio, exclusão de ambientes/artefatos e instruções operacionais. |
| `tests/seo.test.mjs`, `tools/audit-html.mjs`, `tools/browser-check.mjs`, `tools/production-check.mjs`, `tools/lighthouse-check.mjs` | Verificação de variantes, schemas, HTML, links, fluxos e medições. |

Os arquivos de evidência estão em `seo-evidence/`, incluindo os HTMLs iniciais e um ZIP das fontes anteriores. A pasta não era um repositório Git; não há commit ou PR criado. Arquivos de conceitos, fotos originais e funcionalidades foram preservados.

## C. Palavras-chave e conteúdo

O arquivo `SEO-PALAVRAS-CHAVE.csv` mapeia 16 intenções/entradas para as URLs existentes, sem criar páginas em massa. Volume, dificuldade, CPC e posições não estavam disponíveis; as colunas indicam essa ausência. A prioridade é uma decisão editorial baseada em adequação ao catálogo, não uma estimativa de demanda.

Termos centrais: **kits de Natal com sabonetes vegetais**, **kit de banho para presente**, **monte seu kit de sabonetes**, **vela aromática de panetone** e **presentes de Natal para empresas**. Termos específicos distinguem quantidade, composição e embalagem de cada kit. Não use “vegano” para toda a coleção: há própolis em determinadas combinações. Não foram criadas páginas locais, pois não há endereço físico ou área de atendimento confirmados.

As buscas públicas encontraram oferta de presentes com sabonetes e descrições de composição em [Biotiê](https://www.biotie.com.br/sabonetes-naturais-presente), [Antheia](https://www.antheiasaboaria.com.br/product-page/kit-revitalizar) e [Essencial Organics](https://www.essencialorganics.com/collections/presentes). Essa amostra confirma linguagem comercial e formatos observados, sem demonstrar volume nem posições locais. O diferencial a explorar aqui é a composição real de cada caixa, fotografias próprias, vídeo de montagem e ferramenta de personalização.

| URL de produto | Title implementado | Situação editorial |
|---|---|---|
| /kits/caixa-prata/ | Kit com 6 sabonetes vegetais Caixa Prata | AlquiVerde | Rascunho: noindex |
| /kits/laco-de-natal/ | Kit de banho com óleo de amêndoa Laço de Natal | AlquiVerde | Rascunho: noindex |
| /kits/feliz-natal/ | Kit Clássico de Natal com sabonetes e vela | AlquiVerde | Rascunho: noindex |
| /kits/laco-tropical/ | Kit de banho com óleo de uva Laço Tropical | AlquiVerde | Rascunho: noindex |
| /kits/especiarias-de-natal/ | Kit de Natal com sabonetes, canela e cravo | AlquiVerde | Rascunho: noindex |
| /kits/quarteto-de-aromas/ | Kit Cinco Aromas para perfumar a casa | AlquiVerde | Rascunho: noindex |
| /kits/aromas-do-jardim/ | Kit Aromas do Jardim em caixa dourada | AlquiVerde | Rascunho: noindex |
| /kits/aroma-dourado/ | Kit aromatizador elétrico e alecrim Aroma Dourado | AlquiVerde | Rascunho: noindex |
| /kits/raio-de-sol/ | Kit óleo de laranja e sabonete Raio de Sol | AlquiVerde | Rascunho: noindex |
| /kits/presente-variado/ | Kit presente com 3 sabonetes vegetais sortidos | AlquiVerde | Rascunho: noindex |
| /kits/oleo-de-semente-de-uva/ | Óleo de semente de uva em caixa para presente | AlquiVerde | Rascunho: noindex |
| /kits/vela-de-panetone/ | Vela aromática de panetone para o Natal | AlquiVerde | Rascunho: noindex |

Arquitetura implementada: catálogo → produtos → outros kits relacionados, com breadcrumb de retorno. O montador liga-se ao catálogo e à sacola. As perguntas ficam na página que já atende à compra: composição, opções, preço/frete, presente para a casa e pedidos corporativos. Variantes não ganham URLs indexáveis próprias.

Conteúdo futuro prioritário: guia de escolha com comparação das caixas reais; página de presentes corporativos após confirmar condições; bastidores da montagem com autoria AlquiVerde e fotos próprias. Só criar textos educativos de uso de cosméticos após revisão técnica e fontes adequadas. Não foram atribuídas credenciais, certificados ou depoimentos inexistentes.

## D. SEO técnico e schema

- **HTML:** 14 páginas principais com título, description e H1 únicos. O build total tem 20 documentos, contando estudos, legado e erro.
- **URLs:** `/kits/{slug}/`; caminhos antigos mantidos por redirects. Os testes locais confirmam um 301 para o legado e 404 para caminhos inexistentes. Configuração do edge Vercel ainda não foi executada.
- **Canonicals:** URL limpa por página; `?v=` e `?leve=` não mudam o canonical. Nenhum domínio foi inventado na saída `dist`.
- **Sitemap:** gerado em cada build só com páginas canônicas liberadas. Sem `lastmod` artificial. Sem `SITE_URL`, permanece vazio. No build isolado de produção, inclui home e montador; os 12 rascunhos ficam fora.
- **Robots:** permite buscar recursos e ler o noindex dos rascunhos/estudos. Não cria bloqueio indiscriminado de mecanismos de IA.
- **Schema:** Organization, WebSite, WebPage/CollectionPage/ItemPage, BreadcrumbList e Product conforme a página. 14 grafos JSON-LD validados localmente no build de produção isolado, com correspondência de URLs, nomes, imagens e breadcrumbs.
- **Elegibilidade:** Product descritivo não inclui Offer, estoque, review ou aggregateRating. Portanto não atende sozinho à exigência de Offer/review/rating de product snippets. Não foi alegada aprovação pelo Rich Results Test ou exibição efetiva no Google. [Requisitos de product snippets](https://developers.google.com/search/docs/appearance/structured-data/product-snippet).
- **Idiomas:** pt-BR em todos os documentos principais; hreflang não se aplica sem versões traduzidas.
- **AEO/GEO:** respostas visíveis e úteis, composição extraível em texto, headings, links e entidades coerentes. Não foram criados arquivos “para IA” sem consumidor definido nem prometidas citações. A base segue as [orientações do Google para recursos de IA](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

A [documentação de JavaScript SEO do Google](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) sustenta a entrega de conteúdo e canonicals no HTML. As regras preparadas para a Vercel seguem sua [documentação de configuração](https://vercel.com/docs/project-configuration/vercel-json), mas precisam de validação no domínio final.

## E. Performance e verificações reais

Lighthouse 13.5.0, Chrome local, home em build de produção, modos mobile/desktop simulados. Uma execução por condição, com caches isolados pelo Lighthouse; são observações de laboratório sujeitas a variação. As medições não representam tráfego real. O mobile passou a iniciar em modo leve, enquanto o desktop conserva a experiência completa: essa mudança de entrega faz parte da melhoria, e não é uma comparação entre experiências idênticas.

| Perfil | Performance | LCP | TBT | CLS | Acessibilidade |
|---|---:|---:|---:|---:|---:|
| mobile | 33 → 78 | 8 s → 4,22 s | 9.959 ms → 130 ms | 0,0001 → 0 | 96 → 100 |
| desktop | 62 → 80 | 1,33 s → 1,42 s | 718 ms → 336 ms | 0,0274 → 0,002 | 96 → 100 |

Best Practices: 100 antes e depois nos dois perfis. O score Lighthouse SEO passou de 92 para 66 porque o build local de revisão agora contém **noindex intencional**. Isso não foi ocultado nem apresentado como melhora numérica de SEO; a liberação correta depende do domínio e da revisão editorial. A estrutura de produção foi testada separadamente com domínio reservado de teste, sem substituí-lo no diretório de publicação.

LCP desejável em campo: até 2,5 s; CLS até 0,1; INP até 200 ms no percentil apropriado. **INP não foi medido**; TBT não é INP. Não há dados CrUX/Search Console, nem aprovação de Core Web Vitals em campo. Reavaliar LCP mobile e carga gráfica desktop após o deploy, sob tráfego real.

Verificações concluídas:

- Build Vite e pré-build de imagens passaram.
- 14 testes Node: todas as páginas, combinações, modo leve/completo, clamping, escaping e controle de indexação.
- Verificação de sintaxe JavaScript passou; não há configuração TypeScript/typecheck. O comando lint informa explicitamente seu escopo.
- Auditoria dos 20 HTMLs: 14 títulos e descriptions únicos, H1 e dimensões nas páginas principais, zero links/recursos locais quebrados e zero avisos pendentes no resultado final.
- Build de produção isolado: 14 grafos JSON-LD, 2 URLs no sitemap, zero falhas.
- Navegador: mobile/desktop sem JavaScript, todas as 12 páginas, variantes, acordeões, menu, montador → fechamento → sacola persistente, validação do formulário, UI desktop completa e erros 404/301 locais.
- Axe: zero violações automáticas WCAG A/AA/2.1 AA na home, Caixa Prata e montador, no perfil mobile testado. Isso não comprova acessibilidade universal nem substitui teste manual com leitor de tela.
- Auditoria npm: a vulnerabilidade alta inicial do Vite foi corrigida; conferir o JSON final salvo na evidência para a contagem atual.

## F. Oportunidades futuras por impacto, esforço e prioridade

| Ação | Impacto esperado | Esforço | Prioridade |
|---|---|---|---|
| Definir domínio Vercel, configurar SITE_URL e conferir HTTPS/canonicals/404 no edge | Alto | Baixo | P0 lançamento |
| Revisar os 12 rascunhos e publicar produtos corretos na Shopify; resolver Cinco Aromas | Alto | Médio | P0 lançamento |
| Conectar o formulário a atendimento real, com política de privacidade adequada | Alto para conversão | Médio | P0 lançamento |
| Verificar Search Console/Bing, enviar sitemap e inspecionar URLs aprovadas | Alto | Baixo | P1 após deploy |
| Medir PageSpeed/CrUX e reduzir renderização que ainda afete LCP mobile ou TBT desktop | Alto | Médio | P1 após deploy |
| Sincronizar preços públicos com fonte comercial e então avaliar Offer/Merchant Center | Alto | Médio | P1 |
| Guia comparativo das caixas com quantidades, itens, fotos próprias e critérios de escolha | Médio/alto | Médio | P2 |
| Página corporativa com quantidades mínimas, personalização e prazos confirmados | Médio/alto | Médio | P2 |
| Página institucional com identidade comercial e políticas reais da empresa | Médio/alto | Médio | P2 |
| Obter menções editoriais de parceiros reais, guias de presente e cobertura dos bastidores | Potencial médio | Médio/alto | P3; sem compra de links que transmitam crédito |
| Acompanhar consultas e conversões por URL e testar perguntas de compra em IAs repetidamente | Médio | Recorrente | P2 após haver dados |

Não existe evidência de que backlinks sejam o gargalo deste site ainda não publicado. Não foi feita aquisição de links, contato com terceiros nem criação de comparativos com concorrentes sem briefing e fatos verificáveis.

## G. Limitações e próximos acessos

Não havia URL pública, projeto Vercel vinculado, dados Search Console/GA4/CrUX, exportação de pesquisa de palavras-chave nem conectores de Ahrefs/Semrush/DataForSEO. Portanto não há números de volume, concorrência, tráfego, CTR, posições, backlinks ou taxa de citações em IA. PageSpeed Insights, Rich Results Test e validação de indexação no Google precisam do site público. A validação local de JSON-LD é de sintaxe, estrutura e consistência; não equivale à aprovação externa da Schema.org/Google.

As skills lidas foram `seo`, `seo-audit`, `ai-seo`, `schema`, `programmatic-seo`, `site-architecture`, `content-strategy`, `competitors` e `link-building`; todas as nove estavam acessíveis. As de concorrentes e links orientaram os limites da estratégia futura; não autorizaram publicação de comparações nem envio de mensagens. A configuração Vercel foi orientada por `vercel:deployments-cicd`, e os fluxos foram verificados com navegador, Lighthouse, Axe e ferramentas locais. A skill `vercel:verification` foi consultada para a verificação de fluxo.

Conflitos entre skills e evidência atual foram resolvidos em favor da documentação primária e dos dados do projeto: sem ofertas inventadas, sem benefício garantido de llms.txt, sem alegar rankeamento/citação por validar schema. O trabalho foi implementado e testado no projeto local; publicação e resultados de busca continuam pendentes.
