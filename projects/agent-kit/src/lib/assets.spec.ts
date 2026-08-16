import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { targetOf } from './assets.js';
import { IEntryOfCatalog } from './catalog.js';
import { DEFAULT_LAYOUT, TKind } from './config.js';

/**
 * Наборы сценариев по исполняемым ресурсам пакета.
 *
 * Гарды, проверки и умолчания — файлы, которые пакет только перекладывает: линтер в `assets/` не
 * ходит, а спеки механизма раскладки исполняют TypeScript, а не то, что он перекладывает.
 * Сломанная строка в любом из них уезжала в чужое дерево зелёным прогоном.
 *
 * Сами сценарии написаны на том же языке, что и ресурсы, — иначе их пришлось бы переписывать на
 * каждую правку гарда. Отсюда обёртка: она зовёт наборы по одному и переносит вывод упавшего в
 * отказ, чтобы в отчёте прогона было видно, какой именно набор покраснел.
 */
const TESTS: string = join(__dirname, '..', '..', 'tests');

const run: (suite: string) => string = (suite: string): string => {
    try {
        return execFileSync('bash', [join(TESTS, suite)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (error: unknown) {
        const failure: { stdout?: string; stderr?: string } = error as { stdout?: string; stderr?: string };
        throw new Error(`набор ${suite} упал:\n${failure.stdout ?? ''}${failure.stderr ?? ''}`);
    }
};

const expectGreen: (suite: string) => void = (suite: string): void => {
    expect(existsSync(join(TESTS, suite))).toBe(true);
    expect(run(suite)).toContain('0 провалов');
};

describe('исполняемые ресурсы пакета', (): void => {
    it('SC-AK-02 — гард пакета проверяется своим набором сценариев', (): void => {
        expectGreen('syntax.test.sh');
    }, 120_000);

    it('гейт правил выбирает правило по роду файла, тексту правки и помнит загруженное', (): void => {
        expectGreen('skill-gate.test.sh');
    }, 120_000);

    it('гарды поставки разбирают командную строку, имя ветки и номер заявки', (): void => {
        expectGreen('git-guards.test.sh');
    }, 120_000);

    it('гард замысла требует папку задачи, замысел и договорённость — и ровно их', (): void => {
        expectGreen('task-flow-guard.test.sh');
    }, 120_000);

    it('гард документов держит пару «правка и её документ» и спутник правила', (): void => {
        expectGreen('docs-guard.test.sh');
    }, 120_000);

    it('умолчания зовутся из надстройки и отдают ей остальное', (): void => {
        expectGreen('defaults.test.sh');
    }, 120_000);

    it('SC-AK-07, SC-AK-09 — настройки сливаются по ключам, а корни проверок берутся из них', (): void => {
        expectGreen('checks.test.sh');
    }, 120_000);

    it('SC-AK-142, SC-AK-149 — гард единообразия берёт признаки у объявленных наборов', (): void => {
        expectGreen('reuse-guard.test.sh');
    }, 120_000);

    it('SC-AK-04, SC-AK-215, SC-AK-228 — текст правила не называет чужого дерева', (): void => {
        expectGreen('texts.test.sh');
    }, 120_000);

    it('SC-AK-211, SC-AK-212, SC-AK-219 — ресурс описан целиком, и у правила есть паттерн', (): void => {
        expectGreen('rules-review.test.sh');
    }, 120_000);
});

/**
 * Образцы — единственный род, у которого путь внутри рода значит место в дереве, а не слой:
 * `tasks/_template/plan.md` ложится туда, где идёт работа. Отсюда и сценарии: умолчание рода и
 * названный деревом каталог.
 */
describe('куда ложится образец', (): void => {
    const sample: Pick<IEntryOfCatalog, 'id' | 'kind' | 'name'> = {
        id: 'samples/tasks/_template/plan.md',
        kind: 'samples',
        name: 'tasks/_template/plan',
    };

    it('SC-AK-202 — образец ложится по своему пути внутри каталога документов', (): void => {
        expect(targetOf(sample, DEFAULT_LAYOUT)).toBe('docs/tasks/_template/plan.md');
    });

    it('SC-AK-203 — дерево называет образцам свой каталог', (): void => {
        const layout: Readonly<Record<TKind, string>> = { ...DEFAULT_LAYOUT, samples: 'работа/образцы' };

        expect(targetOf(sample, layout)).toBe('работа/образцы/tasks/_template/plan.md');
    });
});
