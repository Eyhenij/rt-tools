/**
 * Спека о слоге уезжающего груза: судится он до отправки, и отбитая запись остаётся на диске.
 *
 * Дерево одноразовое и берётся из обвязки отправки: настройка, токен и двойник приёма у этих
 * спек те же. Проверка слога в него кладётся руками — так же, как её кладёт раскладка: без неё
 * дерево отправляет как прежде, и это отдельный сценарий.
 */
import { copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';

import { IOutcomeOfCommand } from './commands.js';
import {
    accepting,
    ASSETS,
    dropTree,
    freshTree,
    get,
    operationsSent,
    PROPOSALS_FILE,
    proposals,
    put,
    said,
    shipping,
    start,
    treeRoot,
} from './shipment.fixture.js';

/** Каталог, в который дерево кладёт проверки по умолчанию. Он же объявлен раскладкой пакета. */
const CHECKS_DIR: string = 'tools';

/** Разложить проверку слога в одноразовое дерево — вместе с настройкой проверок, которую она читает. */
function layOutProseCheck(): void {
    const target: string = join(treeRoot(), CHECKS_DIR);

    mkdirSync(target, { recursive: true });
    for (const name of ['check-prose-style.mjs', 'rt-kit-checks.config.mjs']) {
        copyFileSync(join(ASSETS, 'checks', name), join(target, name));
    }
}

/** Блок предложения: цитата ближайшего утверждения названа, чтобы отбить его могло только слово. */
function block(text: string): string {
    return [
        '## пакет · rules/styling-bem.md',
        '',
        '- **повод:** правило молчит про токены',
        '- **ближайшее:** нет — про это правило не говорит вовсе',
        '',
        `> ${text}`,
    ].join('\n');
}

/** Разбор происшествия одноразового дерева: каталог у него свой, не тот, где лежат предложения. */
const ANALYSIS_FILE: string = 'docs/postmortems/2026-08-12-разбор.md';

/** Слово, которое проверка слога называет канцеляритом. Одно на все спеки этого файла. */
const OFFICIALESE: string = 'Правка является заменой токена.';
const PLAIN: string = 'Правка меняет токен на другой.';

beforeEach((): void => {
    freshTree();
    start();
});
afterEach((): void => dropTree());

describe('слог уезжающего груза', () => {
    it('SC-AK-954 — запись с канцеляритом не уезжает', async () => {
        layOutProseCheck();
        proposals([block(OFFICIALESE)]);

        const outcome: IOutcomeOfCommand = await shipping(accepting());

        expect(operationsSent()).not.toContain('proposals');
        expect(said(outcome)).toContain('является');
        expect(said(outcome)).toContain(PROPOSALS_FILE);
    });

    it('SC-AK-955 — чистая запись уезжает рядом с отбитой', async () => {
        layOutProseCheck();
        proposals([block(PLAIN), block(OFFICIALESE)]);

        const outcome: IOutcomeOfCommand = await shipping(accepting());

        expect(operationsSent()).toContain('proposals');
        expect(said(outcome).match(/отбито/g) ?? []).toHaveLength(1);
    });

    it('SC-AK-956 — разбор происшествия судится тем же вызовом', async () => {
        layOutProseCheck();
        put(ANALYSIS_FILE, `# Разбор\n\n${OFFICIALESE}\n`);

        const outcome: IOutcomeOfCommand = await shipping(accepting());

        expect(operationsSent()).not.toContain('postmortems');
        expect(said(outcome)).toContain(ANALYSIS_FILE);
    });

    it('SC-AK-957 — отбой записи отправку не роняет', async () => {
        layOutProseCheck();
        proposals([block(OFFICIALESE)]);

        const outcome: IOutcomeOfCommand = await shipping(accepting());

        expect(outcome.code).toBe(0);
        expect(operationsSent()).toContain('summary');
    });

    it('SC-AK-958 — дерево без проверки отправляет как прежде', async () => {
        proposals([block(OFFICIALESE)]);

        const outcome: IOutcomeOfCommand = await shipping(accepting());

        expect(existsSync(join(treeRoot(), CHECKS_DIR, 'check-prose-style.mjs'))).toBe(false);
        expect(operationsSent()).toContain('proposals');
        expect(said(outcome)).toContain('слог не судился');
    });

    it('SC-AK-959 — у отбитой записи отметки об отправке нет', async () => {
        layOutProseCheck();
        proposals([block(OFFICIALESE)]);

        await shipping(accepting());

        expect(get(PROPOSALS_FILE)).not.toContain('**отправлено:**');
        expect(get(PROPOSALS_FILE)).toContain('**отбито:**');
    });

    it('SC-AK-959 — починенная запись уезжает следующей отправкой', async () => {
        layOutProseCheck();
        proposals([block(OFFICIALESE)]);
        await shipping(accepting());

        rmSync(join(treeRoot(), PROPOSALS_FILE));
        proposals([block(PLAIN)]);
        const outcome: IOutcomeOfCommand = await shipping(accepting());

        expect(operationsSent()).toContain('proposals');
        expect(said(outcome)).not.toContain('отбито');
    });
});
