/**
 * Каталог и отбор. Проверяется главным образом одно: что `only`, названный законами, не уносит
 * с собой шаблоны — иначе проект, выбравший девять законов, остался бы без шаблона правила и
 * узнал бы об этом, только пойдя за ним.
 */
import { cascadeCuts, chosenEntries, ICascadeCut, idleSkips, IIdleSkip, namedButCut } from './cascade.js';
import {
    brokenLinks,
    IBrokenLink,
    IEntryOfCatalog,
    idOf,
    IGapOfVariant,
    isChosen,
    ISelection,
    requiresOf,
    resolveSelection,
    titleOf,
    variantGaps,
} from './catalog.js';
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
    needs: null,
    text: '',
    requires: [],
});

/** Ресурс, требующий свойства дерева: им проверяется отбор по свойствам. */
const needingTrait: (kind: TKind, name: string, trait: string) => IEntryOfCatalog = (
    kind: TKind,
    name: string,
    trait: string
): IEntryOfCatalog => ({ ...entry(kind, name), needs: trait });

/** Ресурс, объявивший требование: им проверяются разорванные связи. */
const needing: (kind: TKind, name: string, requires: readonly string[]) => IEntryOfCatalog = (
    kind: TKind,
    name: string,
    requires: readonly string[]
): IEntryOfCatalog => ({ ...entry(kind, name), requires });

const picked: (
    only?: readonly string[],
    skip?: readonly string[],
    variants?: Record<string, string>,
    has?: readonly string[]
) => ISelection = (
    only: readonly string[] = [],
    skip: readonly string[] = [],
    variants: Record<string, string> = {},
    has: readonly string[] = []
): ISelection => ({ only, skip, variants, has });

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

    it('SC-AK-168 — ресурс с неотвеченным требованием не берётся', () => {
        expect(isChosen(needingTrait('rules', 'observability', 'db'), picked([], [], {}, ['packages']))).toBe(false);
    });

    it('SC-AK-169 — названное деревом свойство ресурс пропускает', () => {
        expect(isChosen(needingTrait('rules', 'observability', 'db'), picked([], [], {}, ['db']))).toBe(true);
    });

    it('SC-AK-170 — молчание дерева о свойствах требованию не отвечает', () => {
        expect(isChosen(needingTrait('rules', 'observability', 'db'), picked())).toBe(false);
    });

    it('SC-AK-171 — ресурс без требования берётся молчащим деревом', () => {
        expect(isChosen(ACCESS, picked())).toBe(true);
    });

    it('SC-AK-172 — выбор поимённо сильнее неотвеченного требования', () => {
        const needing: IEntryOfCatalog = needingTrait('rules', 'observability', 'db');

        expect(isChosen(needing, picked([needing.id]))).toBe(true);
    });

    it('SC-AK-168 — отказ строкой сильнее названного свойства', () => {
        const needing: IEntryOfCatalog = needingTrait('rules', 'observability', 'db');

        expect(isChosen(needing, picked([], [needing.id], {}, ['db']))).toBe(false);
    });
});

describe('variantGaps', () => {
    // Проверка заведена под один случай: правило поставки едет тремя видами, а команды, которые
    // оно зовёт, — одним. Дерево на чужом хостинге получало правило без инструмента и молчание
    // вместо отказа.
    const BOARD: IEntryOfCatalog = entry('checks', 'board', { axis: 'host', value: 'github' });
    const WITH_BOARD: readonly IEntryOfCatalog[] = [...CATALOG, BOARD];

    it('вид под выбор есть — пробела нет', () => {
        expect(variantGaps(WITH_BOARD, picked([], [], { host: 'github' }))).toEqual([]);
    });

    it('SC-AK-01 — вид оставил правило без инструмента, и раскладка отказала', () => {
        const gaps: readonly IGapOfVariant[] = variantGaps(WITH_BOARD, picked([], [], { host: 'gitlab' }));

        expect(gaps).toHaveLength(1);
        expect(gaps[0].name).toBe('board');
        expect(gaps[0].chosen).toBe('gitlab');
        expect(gaps[0].available).toEqual(['github']);
        expect(gaps[0].ids).toEqual(['checks/board.github.md']);
    });

    it('ресурс, названный в отказе, пробелом не считается', () => {
        expect(variantGaps(WITH_BOARD, picked([], ['checks/board.github.md'], { host: 'gitlab' }))).toEqual([]);
    });

    it('род, суженный через `only`, отбирает поимённо', () => {
        expect(variantGaps(WITH_BOARD, picked(['checks/other.mjs'], [], { host: 'gitlab' }))).toEqual([]);
    });

    it('ресурс без видов пробела не даёт', () => {
        expect(variantGaps([ACCESS, RULE], picked([], [], { host: 'gitlab' }))).toEqual([]);
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

describe('requiresOf', () => {
    it('читает строку требования из разметки', () => {
        expect(requiresOf('# Правило\n\n**Требует:** `hooks/a.sh`, `hooks/b.sh`\n')).toEqual(['hooks/a.sh', 'hooks/b.sh']);
    });

    it('читает её же из комментария исполняемого файла', () => {
        expect(requiresOf('#!/usr/bin/env bash\n# Требует: defaults/project.sh\n')).toEqual(['defaults/project.sh']);
    });

    it('ресурс без строки ничего не требует', () => {
        expect(requiresOf('# Правило\n\nтекст\n')).toEqual([]);
    });
});

describe('brokenLinks', () => {
    const HOOK: IEntryOfCatalog = entry('hooks', 'task-context-load');
    const PATTERN: IEntryOfCatalog = needing('patterns', 'task-flow-resume', [HOOK.id]);
    const CATALOG_OF_TWO: readonly IEntryOfCatalog[] = [HOOK, PATTERN];

    it('SC-AK-85 — выбранный ресурс требует невыбранного, и сверка говорит об этом', () => {
        const broken: readonly IBrokenLink[] = brokenLinks(CATALOG_OF_TWO, picked([], [HOOK.id]));

        expect(broken).toEqual([{ id: PATTERN.id, requires: HOOK.id, unknown: false }]);
    });

    it('SC-AK-86 — оба взяты, и связи не разорваны', () => {
        expect(brokenLinks(CATALOG_OF_TWO, picked())).toEqual([]);
    });

    it('SC-AK-136 — связь, порванную каскадом, вторым предупреждением не называют', () => {
        const pricing: IEntryOfCatalog = { ...entry('rules', 'pricing'), text: '---\nname: pricing\nkind: rules\nlaw: money\n---\n' };
        const asking: IEntryOfCatalog = needing('patterns', 'quote', [pricing.id]);

        expect(brokenLinks([ACCESS, MONEY, pricing, asking], picked([], [MONEY.id]))).toEqual([]);
    });

    it('требование невзятого ресурса не считается: его в дереве нет вовсе', () => {
        expect(brokenLinks(CATALOG_OF_TWO, picked([], [PATTERN.id, HOOK.id]))).toEqual([]);
    });

    it('требование, которого нет в пакете, названо промахом шапки, а не выбором дерева', () => {
        const stray: IEntryOfCatalog = needing('rules', 'x', ['hooks/нетакого.sh']);

        expect(brokenLinks([stray], picked())).toEqual([{ id: stray.id, requires: 'hooks/нетакого.sh', unknown: true }]);
    });
});

describe('cascadeCuts', () => {
    /** Ресурс со вступлением: связь родителя с потомком читается только оттуда. */
    const under: (kind: TKind, name: string, field: 'law' | 'rule', parent: string) => IEntryOfCatalog = (
        kind: TKind,
        name: string,
        field: 'law' | 'rule',
        parent: string
    ): IEntryOfCatalog => ({ ...entry(kind, name), text: `---\nname: ${name}\nkind: ${kind}\n${field}: ${parent}\n---\n` });

    const PRICING: IEntryOfCatalog = under('rules', 'pricing', 'law', 'money');
    const QUOTE: IEntryOfCatalog = under('patterns', 'pricing-quote', 'rule', 'pricing');
    const PERMISSIONS: IEntryOfCatalog = under('rules', 'permissions', 'law', 'access');
    const FULL: readonly IEntryOfCatalog[] = [ACCESS, DELIVERY, MONEY, RULE, PRICING, QUOTE, PERMISSIONS];

    const idsOf: (cuts: readonly ICascadeCut[]) => readonly string[] = (cuts: readonly ICascadeCut[]): readonly string[] =>
        cuts.map((one: ICascadeCut): string => one.id);

    it('SC-AK-119 — отказ от закона снимает правила и паттерны при нём', () => {
        expect(idsOf(cascadeCuts(FULL, picked([], [MONEY.id])))).toEqual([PRICING.id, QUOTE.id]);
    });

    it('SC-AK-119 — правило чужого закона при этом остаётся', () => {
        expect(idsOf(cascadeCuts(FULL, picked([], [MONEY.id])))).not.toContain(PERMISSIONS.id);
    });

    it('SC-AK-120 — невыбранный закон потомков не раскладывает', () => {
        expect(idsOf(cascadeCuts(FULL, picked([ACCESS.id, DELIVERY.id])))).toEqual([PRICING.id, QUOTE.id]);
    });

    it('SC-AK-121 — отказ от паттерна ни правила, ни закона не трогает', () => {
        expect(cascadeCuts(FULL, picked([], [QUOTE.id]))).toEqual([]);
    });

    it('SC-AK-129 — пустой выбор берёт весь набор', () => {
        expect(cascadeCuts(FULL, picked())).toEqual([]);
    });

    it('SC-AK-130 — родитель отвергнут, только когда не выбран ни один его вид', () => {
        const pattern: IEntryOfCatalog = under('patterns', 'git-workflow-commit', 'rule', 'git-workflow');

        expect(cascadeCuts([ACCESS, GITHUB, GITLAB, pattern], picked([], [], { host: 'github' }))).toEqual([]);
    });

    it('SC-AK-132 — закон слоя приложения находится по короткому имени из шапки', () => {
        expect(cascadeCuts(FULL, picked([], [MONEY.id]))[0]).toEqual({ id: PRICING.id, parent: 'money', root: 'money' });
    });

    it('SC-AK-133 — снятый внук назван обоими родителями', () => {
        expect(cascadeCuts(FULL, picked([], [MONEY.id]))[1]).toEqual({ id: QUOTE.id, parent: 'pricing', root: 'money' });
    });

    it('SC-AK-135 — родителя нет в каталоге — каскад молчит', () => {
        const orphan: IEntryOfCatalog = under('rules', 'x', 'law', 'нетакого');
        const empty: IEntryOfCatalog = { ...entry('rules', 'y'), text: '---\nname: y\nkind: rules\n---\n' };

        expect(cascadeCuts([ACCESS, orphan, empty], picked())).toEqual([]);
    });

    it('паттерн при точечно отвергнутом правиле снят родителем, а не корнем чужой цепочки', () => {
        expect(cascadeCuts(FULL, picked([], [PRICING.id]))).toEqual([{ id: QUOTE.id, parent: 'pricing', root: 'pricing' }]);
    });
});

describe('namedButCut', () => {
    const PRICING: IEntryOfCatalog = { ...entry('rules', 'pricing'), text: '---\nname: pricing\nkind: rules\nlaw: money\n---\n' };
    const FULL: readonly IEntryOfCatalog[] = [ACCESS, MONEY, RULE, PRICING];

    it('SC-AK-134 — выбор, который после каскада ничего не берёт, называется вслух', () => {
        expect(namedButCut(FULL, picked([ACCESS.id, PRICING.id]))).toEqual([{ id: PRICING.id, parent: 'money', root: 'money' }]);
    });

    it('снятое каскадом, но выбором не названное, здесь не считается', () => {
        expect(namedButCut(FULL, picked([], [MONEY.id]))).toEqual([]);
    });
});

describe('idleSkips', () => {
    const PRICING: IEntryOfCatalog = { ...entry('rules', 'pricing'), text: '---\nname: pricing\nkind: rules\nlaw: money\n---\n' };
    const FULL: readonly IEntryOfCatalog[] = [ACCESS, MONEY, RULE, PRICING, GITHUB, GITLAB];

    it('SC-AK-122 — строка отказа, снятая каскадом, объявляется предупреждением', () => {
        expect(idleSkips(FULL, picked([], [MONEY.id, PRICING.id]))).toEqual([{ id: PRICING.id, by: 'money' }]);
    });

    it('SC-AK-122 — строка на сам отвергнутый закон лишней не считается', () => {
        const idle: readonly IIdleSkip[] = idleSkips(FULL, picked([], [MONEY.id, PRICING.id]));

        expect(idle.map((one: IIdleSkip): string => one.id)).not.toContain(MONEY.id);
    });

    it('SC-AK-124 — строка отказа без ресурса в каталоге называется тем же предупреждением', () => {
        expect(idleSkips(FULL, picked([], ['rules/нетакого.md']))).toEqual([{ id: 'rules/нетакого.md', by: '' }]);
    });

    it('SC-AK-131 — строка отказа на ресурс чужого вида лишней не считается', () => {
        expect(idleSkips(FULL, picked([], [GITLAB.id], { host: 'github' }))).toEqual([]);
    });

    it('точечный отказ при взятом родителе лишним не бывает', () => {
        expect(idleSkips(FULL, picked([], [PRICING.id]))).toEqual([]);
    });
});

describe('chosenEntries', () => {
    const PRICING: IEntryOfCatalog = { ...entry('rules', 'pricing'), text: '---\nname: pricing\nkind: rules\nlaw: money\n---\n' };

    it('SC-AK-128 — отказ от предметного закона одной строкой уносит и правило при нём', () => {
        const ids: readonly string[] = chosenEntries([ACCESS, MONEY, RULE, PRICING], picked([], [MONEY.id])).map(
            (one: IEntryOfCatalog): string => one.id
        );

        expect(ids).toEqual([ACCESS.id, RULE.id]);
    });
});
