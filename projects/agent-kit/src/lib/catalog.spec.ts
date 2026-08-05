/**
 * Каталог и отбор. Проверяется главным образом одно: что `only`, названный законами, не уносит
 * с собой шаблоны — иначе проект, выбравший девять законов, остался бы без шаблона правила и
 * узнал бы об этом, только пойдя за ним.
 */
import { IEntryOfCatalog, idOf, isChosen, resolveSelection, titleOf } from './catalog.js';
import { TKind } from './config.js';

const entry: (kind: TKind, name: string) => IEntryOfCatalog = (kind: TKind, name: string): IEntryOfCatalog => ({
    id: `${kind}/${name}.md`,
    kind,
    name,
    title: name,
    text: '',
});

const ACCESS: IEntryOfCatalog = entry('laws', 'access');
const DELIVERY: IEntryOfCatalog = entry('laws', 'delivery');
const RULE: IEntryOfCatalog = entry('templates', 'rule');
const CATALOG: readonly IEntryOfCatalog[] = [ACCESS, DELIVERY, RULE];

describe('titleOf', () => {
    it('берёт заголовок первой строки', () => {
        expect(titleOf('# Поставка\n\nтекст\n', 'delivery')).toBe('Поставка');
    });

    it('у файла без заголовка остаётся имя', () => {
        expect(titleOf('---\nname: rule\n---\n', 'rule')).toBe('rule');
    });
});

describe('isChosen', () => {
    it('пустой `only` берёт всё', () => {
        expect(CATALOG.every((one: IEntryOfCatalog): boolean => isChosen(one, [], []))).toBe(true);
    });

    it('`only` из законов ограничивает законы', () => {
        expect(isChosen(ACCESS, [ACCESS.id], [])).toBe(true);
        expect(isChosen(DELIVERY, [ACCESS.id], [])).toBe(false);
    });

    it('`only` из законов шаблоны не трогает', () => {
        expect(isChosen(RULE, [ACCESS.id], [])).toBe(true);
    });

    it('`skip` вычитает из выбранного', () => {
        expect(isChosen(ACCESS, [ACCESS.id], [ACCESS.id])).toBe(false);
    });

    it('`skip` работает и без `only`', () => {
        expect(isChosen(DELIVERY, [], [DELIVERY.id])).toBe(false);
    });
});

describe('idOf', () => {
    it('принимает все три формы имени', () => {
        expect(idOf('access', 'laws', CATALOG)).toBe(ACCESS.id);
        expect(idOf('access.md', 'laws', CATALOG)).toBe(ACCESS.id);
        expect(idOf('laws/access.md', 'laws', CATALOG)).toBe(ACCESS.id);
    });

    it('чужой род не отдаёт', () => {
        expect(idOf('rule', 'laws', CATALOG)).toBeNull();
    });
});

describe('resolveSelection', () => {
    it('называет промах, а не молчит о нём', () => {
        const { ids, unknown } = resolveSelection(['access', 'нетакого'], 'laws', CATALOG);

        expect(ids).toEqual([ACCESS.id]);
        expect(unknown).toEqual(['нетакого']);
    });

    it('повтор не удваивает', () => {
        expect(resolveSelection(['access', 'laws/access.md'], 'laws', CATALOG).ids).toEqual([ACCESS.id]);
    });
});
