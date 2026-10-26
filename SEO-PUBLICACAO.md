# Publicação e manutenção do SEO

Este projeto é um catálogo Vite com geração de HTML estático no build. As compras levam à loja AlquiVerde. O formulário corporativo continua sendo uma demonstração e informa isso antes do envio.

## Primeira publicação na Vercel

1. Importe o projeto e configure **Root Directory = `site`** se a raiz do repositório for `kits alquiverde`. Caso envie apenas esta pasta, ela já é a raiz.
2. Use o comando `npm run build`, saída `dist` e Node.js 22.12+ ou 24 LTS. O arquivo `vercel.json` já configura o framework e a saída.
3. A primeira revisão pode ser publicada sem `SITE_URL`: todas as páginas terão `noindex, follow` e o sitemap ficará vazio. Isso é intencional enquanto não existe endereço definitivo.
4. Defina o domínio público final. Configure **`SITE_URL`**, apenas no ambiente **Production**, com a origem HTTPS exata, sem caminho, parâmetros ou credenciais. Exemplo de formato: `https://seu-dominio-real`.
5. Faça novo build/deploy após configurar a variável. O HTML passa a incluir canonicals, URLs de compartilhamento, Organization, WebSite, páginas e breadcrumbs com a origem correta. Deploys `preview`/`development` permanecem `noindex` mesmo que recebam a variável.
6. Os 12 registros de produto em `src/kitPages.js` vieram com `draft: true`. Confirme nomes, conteúdo, imagens, cuidados e publicação na loja; só então remova o `draft` de cada registro aprovado. O próximo build inclui esse kit no sitemap e libera sua indexação.
7. Verifique no domínio final: `/robots.txt`, `/sitemap.xml`, `/kits/caixa-prata/`, `/kit.html?k=caixa-prata`, `/kits/nao-existe/`. A URL antiga deve redirecionar, e a inexistente deve responder HTTP 404. O teste local não comprova o comportamento do edge da Vercel.
8. Confirme HTTPS, domínio preferido e redirecionamento do domínio alternativo na Vercel. Verifique a propriedade no Search Console, envie o sitemap e use inspeção de URL nas páginas aprovadas.
9. Rode PageSpeed Insights e o Rich Results Test no domínio final. Reavalie métricas de campo quando houver tráfego suficiente. Resultados de laboratório não comprovam aprovação dos Core Web Vitals em campo.

`SITE_URL` é uma configuração pública, não uma credencial. Nenhum token de Google, Vercel ou Shopify foi solicitado nem incluído no código.

## Comandos de verificação

```powershell
npm ci
npm run build
npm run lint
npm test
npm run audit:html
npm run preview -- --host 127.0.0.1 --port 5182
```

Em outro terminal, com o preview ativo:

```powershell
npm run test:browser
node tools/lighthouse-check.mjs
```

Os testes de navegador usam o Chrome instalado no Windows. Em outra máquina, configure `CHROME_PATH` com o executável. `BASE_URL` permite usar outro servidor local. `npm run lint` verifica a sintaxe dos módulos JavaScript; não é ESLint nem typecheck. Não havia TypeScript, configuração de typecheck ou suíte de testes no projeto inicial.

`node tools/production-check.mjs` faz um build de teste isolado em `seo-evidence/production-fixture` com um domínio reservado `.invalid`. Ele valida canonicals, JSON-LD e sitemap e não substitui `dist`. Essa pasta é evidência de teste, não saída de publicação.

## Manutenção

- Produtos e combinações: edite `src/kitPages.js` e `src/kits.js`. Não crie páginas por cidade ou pequenas variações sem conteúdo próprio.
- Metadados: `src/seo.js`. Uma intenção principal por URL; variantes `?v=` e preferência `?leve=` compartilham o canonical do kit.
- Sitemap e robots: gerados por `tools/seo-build.mjs` em todos os builds. Não há datas `lastmod` artificiais.
- Novas fotos: mantenha os originais em `public`. O pré-build cria WebP de 480/800 pixels em `public/responsive`, preserva os originais e registra dimensões reais. Versões já atualizadas são reutilizadas.
- As funções `sizeImages` e `setImageSource` mantêm `srcset`, dimensões e trocas de variantes consistentes.
- Preços atuais são uma tabela local com indicação de produtos em rascunho na loja. Eles não alimentam Offer/estoque/avaliações. Antes de adicionar `Offer`, confirme preço público e política de atualização; não infira disponibilidade.
- `Product` descritivo sem Offer/review/aggregateRating não atende sozinho aos requisitos de product snippets do Google. JSON válido e correspondência de conteúdo não garantem rich results.
- A abertura animada pode ser revisitada com `?abertura`. O conteúdo aparece imediatamente na navegação padrão. O mobile inicia em modo leve; a preferência explícita e o botão de modo continuam disponíveis.
- Arquivos com hash em `/assets/` recebem cache imutável; imagens e fontes com nomes estáveis não recebem essa regra.
- O site é somente pt-BR. Não há versões traduzidas que justifiquem hreflang.

## Arquitetura

```text
/                               Catálogo e dúvidas
├── /monte.html                  Montador de presentes
└── /kits/{slug}/                12 páginas existentes, HTML completo

/experimentos/*.html             Estudos preservados e noindex
/kit.html?k={slug}               Legado → 301 para /kits/{slug}/
/404.html                        Página de erro
```

O catálogo e as páginas de produto têm links HTML entre si. O montador funciona com JavaScript e mantém instruções e alternativas de contato no HTML inicial. Não há catch-all enviando URLs inexistentes à página inicial.
