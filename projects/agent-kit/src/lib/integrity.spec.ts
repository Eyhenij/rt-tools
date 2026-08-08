/**
 * Целостность ресурсов самого пакета. Набор гоняется по живому каталогу: выдуманный здесь ничего
 * не сказал бы о том, что пакет действительно везёт.
 */
import { join } from 'node:path';

import { IEntryOfCatalog, readCatalog } from './catalog.js';
import { brokenLinks, frontMatterOf, IBrokenLink } from './integrity.js';

const ASSETS: string = join(__dirname, '..', '..', 'assets');

describe('frontMatterOf', () => {
    it('читает объявление вступления', () => {
        expect(frontMatterOf('---\nname: testing\nkind: rule\nlaw: verifiability\n---\n\n# Тесты\n')).toMatchObject({
            name: 'testing',
            kind: 'rule',
            law: 'verifiability',
        });
    });

    it('за пределы вступления не заглядывает', () => {
        expect(frontMatterOf('---\nname: a\n---\n\nlaw: выдуманный\n').law).toBe('');
    });

    it('у файла без вступления шапка пустая', () => {
        expect(frontMatterOf('# Просто текст\n').name).toBe('');
    });
});

describe('brokenLinks', () => {
    it('в ресурсах пакета висячих ссылок нет', () => {
        const broken: readonly IBrokenLink[] = brokenLinks(readCatalog(ASSETS));

        expect(broken.map((one: IBrokenLink): string => `${one.id} → ${one.field}: ${one.wanted}`)).toEqual([]);
    });

    it('находит правило под несуществующим законом', () => {
        const catalog: readonly IEntryOfCatalog[] = [
            {
                id: 'rules/x.md',
                kind: 'rules',
                name: 'x',
                title: 'x',
                variant: null,
                text: '---\nname: x\nkind: rule\nlaw: нетакого\n---\n',
            },
        ];

        expect(brokenLinks(catalog)).toEqual([{ id: 'rules/x.md', field: 'law', wanted: 'нетакого' }]);
    });

    it('закон приложения находится по короткому имени', () => {
        const catalog: readonly IEntryOfCatalog[] = [
            {
                id: 'laws/application/money.md',
                kind: 'laws',
                name: 'application/money',
                title: 'Деньги',
                variant: null,
                text: '# Деньги\n',
            },
            {
                id: 'rules/pricing.md',
                kind: 'rules',
                name: 'pricing',
                title: 'Цены',
                variant: null,
                text: '---\nname: pricing\nkind: rule\nlaw: money\n---\n',
            },
        ];

        expect(brokenLinks(catalog)).toEqual([]);
    });
});
