/**
 * Польза проверок набора по строкам отметок дня: ложные и настоящие отказы, лишние запуски, цена
 * дефекта, раздел отчёта и списки кандидатов.
 *
 * Сценарии `docs/specs/agent-kit/push-set-usefulness/`.
 */
import { join } from 'node:path';

import {
    ICheckUsefulness,
    IPushSetUsefulness,
    IRunLine,
    TSumsOf,
    hookSumsOf,
    namesOf,
    parseRunLines,
    pushSetLines,
    usefulnessOf,
} from './push-set-usefulness.js';

const NO_NAMES: ReadonlyMap<string, string> = new Map();

function only(usefulness: IPushSetUsefulness): ICheckUsefulness {
    return usefulness.checks[0];
}

describe('parseRunLines', () => {
    it('SC-AK-1658 — строка из четырёх полей читается без отметки предмета', () => {
        const lines: readonly IRunLine[] = parseRunLines('s1 101 green 30\ns1 101 red 12 1763000000 55 touched\n');

        expect(lines.map((line: IRunLine): string | null => line.subject)).toEqual([null, 'touched']);
    });

    it('SC-AK-1658 — старые строки считаются в запусках, отказах и ложных, а лишние — «предмет не записан»', () => {
        const check: ICheckUsefulness = only(usefulnessOf(parseRunLines('s1 101 red 10\ns1 101 green 20\n'), NO_NAMES));

        expect([check.runs, check.seconds, check.refusals, check.falseRefusals, check.idle]).toEqual([2, 30, 1, 1, null]);
        expect(pushSetLines(usefulnessOf(parseRunLines('s1 101 green 20\n'), NO_NAMES)).join('\n')).toContain('предмет не записан');
    });
});

describe('usefulnessOf', () => {
    it('SC-AK-1659 — красный запуск, после которого на той же подписи зелёный, — ложный отказ', () => {
        const check: ICheckUsefulness = only(usefulnessOf(parseRunLines('s1 101 red 10\ns1 101 green 10\n'), NO_NAMES));

        expect([check.refusals, check.falseRefusals, check.realRefusals]).toEqual([1, 1, 0]);
    });

    it('SC-AK-1660 — красный запуск без зелёного повтора на той же подписи — настоящий отказ', () => {
        const check: ICheckUsefulness = only(usefulnessOf(parseRunLines('s1 101 red 10\ns2 101 green 10\n'), NO_NAMES));

        expect([check.falseRefusals, check.realRefusals]).toEqual([0, 1]);
    });

    it('SC-AK-1663 — цена дефекта — секунды всех запусков на один настоящий отказ', () => {
        const runs: string = 's1 101 red 30\ns2 101 red 30\ns3 101 green 30\ns4 101 green 30\n';
        const check: ICheckUsefulness = only(usefulnessOf(parseRunLines(runs), NO_NAMES));

        expect(check.secondsPerDefect).toBe(60);
        expect(pushSetLines(usefulnessOf(parseRunLines('s1 102 green 3\n'), NO_NAMES)).join('\n')).toContain('ни одного дефекта');
    });

    it('SC-AK-1663 — лишний запуск и шаг, который набор не запускал, считаются порознь', () => {
        const runs: string = 's1 101 green 5 1 2 idle\ns1 101 green 5 1 2 touched\ns1 101 not-run 0 1 2 not-run\n';
        const check: ICheckUsefulness = only(usefulnessOf(parseRunLines(runs), NO_NAMES));

        expect([check.runs, check.idle, check.notRun]).toEqual([2, 1, 1]);
    });
});

describe('pushSetLines', () => {
    it('SC-AK-1664 — отчёт печатает раздел «Проверки набора» по строке на проверку, с её командой', () => {
        const names: ReadonlyMap<string, string> = new Map([
            ['101', 'node tools/check-specs.mjs'],
            ['102', 'node tools/check-docs.mjs'],
            ['103', 'pnpm exec nx run admin-e2e:e2e'],
        ]);
        const runs: string = 's1 101 green 5 1 2 touched\ns1 102 red 2\ns1 103 green 400 1 2 idle\n';
        const text: string = pushSetLines(usefulnessOf(parseRunLines(runs), names)).join('\n');

        expect(text).toContain('Проверки набора: 3');
        expect(text).toContain(
            '  pnpm exec nx run admin-e2e:e2e: запусков 1, секунд 400, отказов 0, ложных 0, лишних 1, ни одного дефекта'
        );
        expect(text).toContain(
            '  node tools/check-docs.mjs: запусков 1, секунд 2, отказов 1, ложных 0, предмет не записан, секунд на дефект 2'
        );
    });

    it('SC-AK-1665 — бесполезная проверка и проверка с ложными сверх настоящих названы в своих списках', () => {
        const runs: string = 's1 201 green 9\ns1 202 red 4\ns1 202 green 4\ns2 202 red 4\ns2 202 green 4\ns3 202 red 4\n';
        const names: ReadonlyMap<string, string> = new Map([
            ['201', 'node a.mjs'],
            ['202', 'node b.mjs'],
        ]);
        const usefulness: IPushSetUsefulness = usefulnessOf(parseRunLines(runs), names);
        const text: string = pushSetLines(usefulness).join('\n');

        expect(usefulness.neverUseful.map((check: ICheckUsefulness): string => check.id)).toEqual(['201']);
        expect(usefulness.falseOverReal.map((check: ICheckUsefulness): string => check.id)).toEqual(['202']);
        expect(text).toContain('ложных больше настоящих: 1\n  node b.mjs: ложных 2, настоящих 1');
    });

    it('SC-AK-1668 — кандидаты идут по секундам, дорогая проверка первой', () => {
        const usefulness: IPushSetUsefulness = usefulnessOf(parseRunLines('s1 301 green 3\ns1 302 green 300\n'), NO_NAMES);

        expect(usefulness.neverUseful.map((check: ICheckUsefulness): number => check.seconds)).toEqual([300, 3]);
    });
});

describe('namesOf', () => {
    // The package source of the hook: the same file the layout puts into every tree.
    const root: string = join(__dirname, '../../../..');
    const sumsOf: TSumsOf = hookSumsOf(root, 'projects/agent-kit/assets/hooks');
    const step: string = 'RT_SUITES_BASE=<base> pnpm exec nx affected -t test-hooks --base=<base>';
    const plain: string = 'pnpm exec nx affected -t test-hooks';

    it('SC-AK-1667 — одна проверка на двух базах и без базы — одна строка с именем формы без базы', () => {
        const { names, aliases } = namesOf([plain, step], ['origin/main', 'origin/RT-1-x'], sumsOf);
        const shared: string = sumsOf([plain]).get(plain)?.id ?? '';
        const oldText: string = 'RT_SUITES_BASE=origin/RT-1-x pnpm exec nx affected -t test-hooks --base=origin/RT-1-x';
        const old: string = sumsOf([oldText]).get(oldText)?.raw ?? '';
        const usefulness: IPushSetUsefulness = usefulnessOf(parseRunLines(`s1 ${shared} green 600\ns2 ${old} green 500\n`), names, aliases);

        expect(shared).toMatch(/^\d+$/);
        expect(old).not.toBe(shared);
        expect(usefulness.checks).toHaveLength(1);
        expect(only(usefulness)).toMatchObject({ runs: 2, seconds: 1100, name: plain });
    });

    it('SC-AK-1667 — шаг с базой и тот же шаг без неё — одна сумма, её считает хук', () => {
        const withBase: string = 'RT_SUITES_BASE=origin/main pnpm exec nx affected -t test-hooks --base=origin/main';
        const sums: ReadonlyMap<string, { readonly id: string }> = sumsOf([withBase, plain]);

        expect(sums.get(plain)?.id).toMatch(/^\d+$/);
        expect(sums.get(withBase)?.id).toBe(sums.get(plain)?.id);
    });

    it('SC-AK-1667 — без хука сумм нет, и строки остаются без имени', () => {
        expect(namesOf([plain], [], sumsOf).names.size).toBe(1);
        expect(namesOf([plain], [], hookSumsOf(root, 'no/such/hooks')).names.size).toBe(0);
    });
});
