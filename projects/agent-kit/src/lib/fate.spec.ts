/**
 * Спека о судьбе своих записей: что приезжает из приёма и как это сводится с надстройками дерева.
 *
 * Дерево одноразовое и берётся из обвязки отправки: настройка и токен у этих спек те же. Приём
 * подменяется двойником — он отвечает заготовленным и считает, сколько раз его позвали: отказ до
 * сети проверяется именно этим счётом.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';

import { IOutcomeOfCommand } from './commands.js';
import { OVERRIDES_DIR } from './config.js';
import { fate } from './fate.js';
import { IOwnRead, IOwnRecord, TReadOwn } from './ship.js';
import { dropTree, freshTree, put, said, start, treeEnv, treeRoot } from './shipment.fixture.js';

/** Статья, которая уже стоит в разложенной редакции: взята из ресурса пакета слово в слово. */
const IN_PACKAGE: string = 'The scenario id stands at the start of the test title, followed by a dash.';

/** Статья, которой в редакции нет: ради неё надстройка и заведена. */
const NOT_IN_PACKAGE: string = 'Проба сама называет, какого прогона ждёт, и второй раз его не зовёт.';

/** Файл надстройки дерева: он же называется в выводе рядом с записью. */
const OVERRIDE_FILE: string = `${OVERRIDES_DIR}/rules/testing.md`;

/** Сколько раз позвали приём: отказ до сети проверяется этим счётом, а не текстом вывода. */
let calls: number = 0;

/** Одна запись приёма с умолчаниями: спеки называют только то, что судят. */
function record(one: Partial<IOwnRecord>): IOwnRecord {
    return {
        id: 'запись-1',
        kind: 'proposal',
        name: 'rules/testing.md',
        state: 'new',
        fixNote: null,
        releaseVersion: null,
        text: 'Текст предложения.',
        ...one,
    };
}

/** Двойник приёма: отдаёт названные записи первого рода и пустоту второго. */
function reading(rows: readonly IOwnRecord[]): TReadOwn {
    return async (_intake: string, _token: string, kind: string): Promise<IOwnRead> => {
        calls += 1;
        const mine: readonly IOwnRecord[] = rows.filter((row: IOwnRecord): boolean => row.kind === kind);

        return { ok: true, status: 200, said: '', rows: mine, total: mine.length };
    };
}

/** Двойник приёма, который записей не отдал: так отвечает отозванный токен. */
function refusing(status: number, message: string): TReadOwn {
    return async (): Promise<IOwnRead> => {
        calls += 1;

        return { ok: false, status, said: message, rows: [], total: 0 };
    };
}

/** Надстройка с помеченным разделом: пометку ставит отправка, здесь она кладётся руками. */
function override(article: string): void {
    put(OVERRIDE_FILE, `## Своё\n\n<!-- rt-proposed: rules/testing.md · «${article}» · 2026-09-01 -->\n\nТекст раздела надстройки.\n`);
}

function asking(rows: readonly IOwnRecord[]): Promise<IOutcomeOfCommand> {
    return fate(treeEnv(), { read: reading(rows) });
}

beforeEach((): void => {
    freshTree();
    start();
    calls = 0;
});
afterEach((): void => dropTree());

describe('судьба своих записей', () => {
    it('SC-AK-961 — у записи названы состояние, починка и версия выпуска', async () => {
        const outcome: IOutcomeOfCommand = await asking([
            record({ state: 'released', fixNote: 'статья правила о слоге', releaseVersion: '0.27.0' }),
        ]);

        expect(said(outcome)).toContain('rules/testing.md');
        expect(said(outcome)).toContain('released');
        expect(said(outcome)).toContain('починка: статья правила о слоге');
        expect(said(outcome)).toContain('выпущено 0.27.0');
        expect(outcome.code).toBe(0);
    });

    it('SC-AK-962 — надстройка названа рядом с записью, к которой её привязала пометка', async () => {
        override(NOT_IN_PACKAGE);

        const outcome: IOutcomeOfCommand = await asking([record({ text: `Повод. ${NOT_IN_PACKAGE}` })]);

        expect(said(outcome)).toContain(OVERRIDE_FILE);
        expect(said(outcome)).toContain('раздел «Своё»');
        expect(said(outcome)).not.toContain('пометок без записи');
    });

    it('SC-AK-963 — надстройка, чья статья уже в разложенной редакции, названа на снятие', async () => {
        override(IN_PACKAGE);

        const outcome: IOutcomeOfCommand = await asking([record({ text: `Повод. ${IN_PACKAGE}` })]);

        expect(said(outcome)).toContain('снимается: статья уже в разложенной редакции');
    });

    it('SC-AK-964 — выпущенная починка, не дошедшая до дерева, зовёт обновление, а не снятие', async () => {
        override(NOT_IN_PACKAGE);

        const outcome: IOutcomeOfCommand = await asking([
            record({ text: `Повод. ${NOT_IN_PACKAGE}`, state: 'released', releaseVersion: '0.27.0' }),
        ]);

        expect(said(outcome)).toContain('ждёт обновления: починка вышла в 0.27.0');
        expect(said(outcome)).not.toContain('снимается');
    });

    it('SC-AK-965 — пометка, записи о которой приём не отдал, названа отдельно', async () => {
        override(NOT_IN_PACKAGE);

        const outcome: IOutcomeOfCommand = await asking([record({ text: 'Текст про другое.' })]);

        expect(said(outcome)).toContain('пометок без записи в приёме: 1');
        expect(said(outcome)).toContain(OVERRIDE_FILE);
    });

    it('SC-AK-966 — команда не правит ни одного файла дерева', async () => {
        override(NOT_IN_PACKAGE);
        const before: string = readFileSync(join(treeRoot(), OVERRIDE_FILE), 'utf8');

        await asking([record({ text: `Повод. ${NOT_IN_PACKAGE}`, state: 'released', releaseVersion: '0.27.0' })]);

        expect(readFileSync(join(treeRoot(), OVERRIDE_FILE), 'utf8')).toBe(before);
        expect(existsSync(join(treeRoot(), OVERRIDE_FILE))).toBe(true);
    });

    it('SC-AK-967 — без токена вызов не идёт в сеть, и отказ называет, где токен лежит', async () => {
        start({ token: '' });

        const outcome: IOutcomeOfCommand = await fate(treeEnv(), { read: reading([]) });

        expect(calls).toBe(0);
        expect(outcome.code).toBe(1);
        expect(said(outcome)).toContain('token');
        expect(said(outcome)).toContain('enroll');
    });

    it('SC-AK-967 — отказ приёма кончает команду и называет ответ', async () => {
        const outcome: IOutcomeOfCommand = await fate(treeEnv(), { read: refusing(401, 'токен не принят') });

        expect(outcome.code).toBe(1);
        expect(said(outcome)).toContain('401');
        expect(said(outcome)).toContain('токен не принят');
    });
});
