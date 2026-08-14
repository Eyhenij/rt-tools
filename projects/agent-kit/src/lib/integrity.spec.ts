/**
 * Целостность ресурсов самого пакета. Набор гоняется по живому каталогу: выдуманный здесь ничего
 * не сказал бы о том, что пакет действительно везёт.
 */
import { join } from 'node:path';

import { IEntryOfCatalog, readCatalog } from './catalog.js';
import { ambiguousNames, brokenLinks, frontMatterOf, IAmbiguousName, IBrokenLink } from './integrity.js';

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

    it('SC-AK-127 — находит правило под несуществующим законом', () => {
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

describe('ambiguousNames', () => {
    it('в наборе пакета одноимённых ресурсов одного рода нет', () => {
        const ambiguous: readonly IAmbiguousName[] = ambiguousNames(readCatalog(ASSETS));

        expect(ambiguous.map((one: IAmbiguousName): string => `${one.kind}: ${one.name} — ${one.ids.join(', ')}`)).toEqual([]);
    });

    it('SC-AK-141 — два закона с одинаковым последним звеном имени названы оба', () => {
        const catalog: readonly IEntryOfCatalog[] = [
            { id: 'laws/access.md', kind: 'laws', name: 'access', title: 'Доступ', variant: null, text: '# Доступ\n' },
            {
                id: 'laws/application/access.md',
                kind: 'laws',
                name: 'application/access',
                title: 'Доступ приложения',
                variant: null,
                text: '# Доступ приложения\n',
            },
        ];

        expect(ambiguousNames(catalog)).toEqual([{ kind: 'laws', name: 'access', ids: ['laws/access.md', 'laws/application/access.md'] }]);
    });

    it('виды одного ресурса двусмысленными не считаются', () => {
        const catalog: readonly IEntryOfCatalog[] = [
            {
                id: 'rules/git-workflow.github.md',
                kind: 'rules',
                name: 'git-workflow',
                title: 'Поставка',
                variant: { axis: 'forge', value: 'github' },
                text: '# Поставка\n',
            },
            {
                id: 'rules/git-workflow.gitlab.md',
                kind: 'rules',
                name: 'git-workflow',
                title: 'Поставка',
                variant: { axis: 'forge', value: 'gitlab' },
                text: '# Поставка\n',
            },
        ];

        expect(ambiguousNames(catalog)).toEqual([]);
    });
});
