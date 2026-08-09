/**
 * Каталог и отбор. Проверяется главным образом одно: что `only`, названный законами, не уносит
 * с собой шаблоны — иначе проект, выбравший девять законов, остался бы без шаблона правила и
 * узнал бы об этом, только пойдя за ним.
 */
import { IEntryOfCatalog, idOf, isChosen, ISelection, resolveSelection, titleOf } from './catalog.js';
import { TKind } from './config.js';
import { IVariant } from './variants.js';

const entry: (kind: TKind, name: string, variant?: IVariant) => IEntryOfCatalog = (
    kind: TKind,
    name: string,
    variant: IVariant | null = null
): IEntryOfCatalog => ({
    id: `${kind}/${name}${variant ? `.${variant.value}` : ''}.md`,
    kind,
    name,
    title: name,
    variant,
    text: '',
});

const picked: (only?: readonly string[], skip?: readonly string[], variants?: Record<string, string>) => ISelection = (
    only: readonly string[] = [],
    skip: readonly string[] = [],
    variants: Record<string, string> = {}
): ISelection => ({ only, skip, variants });

const ACCESS: IEntryOfCatalog = entry('laws', 'access');
const DELIVERY: IEntryOfCatalog = entry('laws', 'delivery');
const MONEY: IEntryOfCatalog = entry('laws', 'application/money');
const RULE: IEntryOfCatalog = entry('templates', 'rule');
const GITHUB: IEntryOfCatalog = entry('rules', 'git-workflow', { axis: 'host', value: 'github' });
const GITLAB: IEntryOfCatalog = entry('rules', 'git-workflow', { axis: 'host', value: 'gitlab' });
const CATALOG: readonly IEntryOfCatalog[] = [ACCESS, DELIVERY, MONEY, RULE, GITHUB, GITLAB];

describe('titleOf', () => {
    it('берёт заголовок первой строки', () => {
        expect(titleOf('# Поставка\n\nтекст\n', 'delivery')).toBe('Поставка');
    });

    it('у файла без заголовка остаётся имя', () => {
        expect(titleOf('---\nname: rule\n---\n', 'rule')).toBe('rule');
    });
});

describe('isChosen', () => {
    const HOST: Record<string, string> = { host: 'github' };

    it('пустой `only` берёт всё общее', () => {
        const common: readonly IEntryOfCatalog[] = [ACCESS, DELIVERY, MONEY, RULE];

        expect(common.every((one: IEntryOfCatalog): boolean => isChosen(one, picked()))).toBe(true);
    });

    it('`only` из законов ограничивает законы', () => {
        expect(isChosen(ACCESS, picked([ACCESS.id]))).toBe(true);
        expect(isChosen(DELIVERY, picked([ACCESS.id]))).toBe(false);
    });

    it('`only` из законов шаблоны не трогает', () => {
        expect(isChosen(RULE, picked([ACCESS.id]))).toBe(true);
    });

    it('`skip` вычитает из выбранного', () => {
        expect(isChosen(ACCESS, picked([ACCESS.id], [ACCESS.id]))).toBe(false);
    });

    it('`skip` работает и без `only`', () => {
        expect(isChosen(DELIVERY, picked([], [DELIVERY.id]))).toBe(false);
    });

    it('берётся только названный вид', () => {
        expect(isChosen(GITHUB, picked([], [], HOST))).toBe(true);
        expect(isChosen(GITLAB, picked([], [], HOST))).toBe(false);
    });

    it('без ответа по оси не берётся ни один вид', () => {
        expect(isChosen(GITHUB, picked())).toBe(false);
        expect(isChosen(GITLAB, picked())).toBe(false);
    });
});

describe('idOf', () => {
    it('принимает все три формы имени', () => {
        expect(idOf('access', 'laws', CATALOG)).toBe(ACCESS.id);
        expect(idOf('access.md', 'laws', CATALOG)).toBe(ACCESS.id);
        expect(idOf('laws/access.md', 'laws', CATALOG)).toBe(ACCESS.id);
    });

    it('закон приложения зовётся и коротким именем, и со слоем', () => {
        expect(idOf('money', 'laws', CATALOG)).toBe(MONEY.id);
        expect(idOf('application/money', 'laws', CATALOG)).toBe(MONEY.id);
        expect(idOf('laws/application/money.md', 'laws', CATALOG)).toBe(MONEY.id);
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
