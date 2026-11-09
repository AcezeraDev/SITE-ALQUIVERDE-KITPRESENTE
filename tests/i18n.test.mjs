// Inglês e espanhol: todo texto das páginas de kit (todas as combinações) tem tradução, e os links mudam de idioma.
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { KIT_PAGES } from '../src/kitPages.js';
import { kitRenderer } from '../src/kitMarkup.js';
import { makeTranslator, translateTree, localize, stripLang } from '../src/i18nCore.js';
import en from '../src/i18n/en.js';
import es from '../src/i18n/es.js';

for (const [lang, dict] of Object.entries({ en, es })) {
  test(`${lang}: páginas de kit sem texto em português`, () => {
    const missing = new Set();
    const T = makeTranslator(dict, { onMissing: (s) => missing.add(s) });
    for (const page of Object.values(KIT_PAGES)) {
      for (let i = 0; i < 4; i++) {
        for (const light of [false, true]) {
          const { document } = parseHTML(`<!doctype html><html><body>${kitRenderer(page).render(i, light).html}</body></html>`);
          translateTree(document.body, lang, T);
        }
      }
    }
    assert.deepEqual([...missing], []);
  });
}

test('links internos ganham o prefixo do idioma; imagens e loja não', () => {
  assert.equal(localize('/', 'en'), '/en/');
  assert.equal(localize('/#colecao', 'es'), '/es/#colecao');
  assert.equal(localize('/monte.html', 'en'), '/en/monte.html');
  assert.equal(localize('/kits/caixa-prata/', 'es'), '/es/kits/caixa-prata/');
  assert.equal(localize('/?sacola', 'en'), '/en/?sacola');
  assert.equal(localize('/kits/caixa-prata-frente.webp', 'en'), '/kits/caixa-prata-frente.webp');
  assert.equal(localize('https://alquiverde.com.br/products/x', 'en'), 'https://alquiverde.com.br/products/x');
  assert.equal(localize('/kits/caixa-prata/', 'pt'), '/kits/caixa-prata/');
  assert.equal(stripLang('/en/kits/caixa-prata/'), '/kits/caixa-prata/');
  assert.equal(stripLang('/es/'), '/');
});

test('preços e contadores do montador', () => {
  const T = makeTranslator(en);
  assert.equal(T.tr('De R$ 69,90 por R$ 52,00 (26% de desconto)'), 'Was R$ 69,90, now R$ 52,00 (26% off)');
  assert.equal(T.tr('2/6 sabonetes · 1 extra'), '2/6 soaps · 1 extra');
  assert.equal(makeTranslator(es).tr('Faltam 3 sabonetes'), 'Faltan 3 jabones');
});
