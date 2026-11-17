/**
 * Строки дня двух деревьев для раздела «Качество».
 *
 * Дни лежат в прошлом и названы прямо: спека открывает раздел с явным периодом, и числа не зависят от
 * дня прогона. Весь август даёт долю, а один его день даёт счёт вместо доли.
 *
 * Строка за сегодняшний день здесь не засевается: полнота смотрит на свежие дни, и такую строку шлёт
 * сама спека, которой она нужна.
 *
 * Третье число считается по разборам: выпущенный разбор с фиксом и следующий за ним на том же ресурсе.
 * Первая строка августа ставит дерево на версию с этим фиксом.
 */
import { TREES } from './stand.mjs';

const QUALITY_LINES = Object.freeze([
    Object.freeze({
        tree: TREES[0],
        origin: 'stand-quality-one',
        day: '2026-08-01',
        version: '0.33.0',
        metrics: { sessions: 1 },
    }),
    Object.freeze({
        tree: TREES[0],
        origin: 'stand-quality-one',
        day: '2026-08-12',
        version: '0.34.0',
        metrics: {
            tasksAccepted: 7,
            tasksFirstPass: 6,
            tasksNoHandover: 1,
            ownerCorrections: 3,
            'guardRefusals:git-guard-push': 6,
            'guardEmpty:git-guard-push': 4,
            'wastedRuns:e2e': 2,
            'wastedSeconds:e2e': 300,
        },
    }),
    Object.freeze({
        tree: TREES[1],
        origin: 'stand-quality-two',
        day: '2026-08-13',
        version: '0.35.0',
        metrics: {
            tasksAccepted: 3,
            tasksClosed: 1,
            tasksFirstPass: 2,
            tasksLost: 1,
            ownerCorrections: 1,
            'guardEmpty:git-guard-push': 1,
            'gateRefusals:testing': 2,
            'rulesAfterLoad:testing': 1,
        },
    }),
    /** День теста приёма окон: строка нужна, чтобы сводка рисовалась, и ни один кадр сюда не смотрит. */
    Object.freeze({
        tree: TREES[0],
        origin: 'stand-quality-one',
        day: '2026-10-05',
        version: '0.37.0',
        metrics: { sessions: 1 },
    }),
    Object.freeze({
        tree: TREES[0],
        origin: 'stand-quality-one',
        day: '2026-11-12',
        version: '0.37.0',
        metrics: {
            calls: 100,
            refusalsHook: 3,
            refusalsPermission: 1,
            deadEnds: 0,
            tasksMerged: 1,
            tasksTimed: 1,
            takenMinutes: 390,
            'refusalPairs:skill-gate:flow-step-guard': 4,
        },
    }),
    Object.freeze({
        tree: TREES[0],
        origin: 'stand-quality-one',
        day: '2026-11-13',
        version: '0.37.0',
        metrics: {
            calls: 187,
            refusalsHook: 30,
            refusalsPermission: 3,
            refusalsStop: 2,
            reasks: 3,
            interrupts: 5,
            ownerWords: 196,
            idleMinutes: 144,
            goalNotMet: 1,
            deadEnds: 20,
            tasksMerged: 2,
            tasksTimed: 1,
            takenMinutes: 210,
            'recordRefusals:grill-gate': 6,
            'guardRefusals:grill-gate': 4,
            'refusalPairs:grill-gate:skill-gate': 6,
        },
    }),
    Object.freeze({
        tree: TREES[1],
        origin: 'stand-quality-two',
        day: '2026-11-14',
        version: '0.36.0',
        metrics: { tasksMerged: 1 },
    }),
]);

/**
 * Окна эпиков ноября. Окно 13 ноября слито в тот день и выпущено 15-го: за 13-е оно читается
 * «не выпущен», за период до 15-го — «выпущен». Окно второго дерева открыто.
 */
const EPIC_WINDOWS = Object.freeze([
    Object.freeze({
        tree: TREES[0],
        origin: 'stand-quality-one',
        epic: 3227,
        from: '2026-11-13T00:34:01Z',
        to: '2026-11-13T03:04:27Z',
        calls: 187,
        refusals: 35,
        reasks: 3,
        merged: 1,
        released: 1,
        mergedAt: '2026-11-13T05:48:08Z',
        releasedAt: '2026-11-15T10:00:00Z',
        minutes: 2347,
    }),
    Object.freeze({
        tree: TREES[1],
        origin: 'stand-quality-two',
        epic: 3190,
        from: '2026-11-11T14:38:55Z',
        to: null,
        calls: 6394,
        refusals: 683,
        reasks: 3,
        merged: 0,
        released: 0,
        mergedAt: null,
        releasedAt: null,
        minutes: null,
    }),
]);

/** Отметка сборки окон: после последнего их момента, как её ставит отправитель. */
const WINDOW_STAMP = Date.parse('2026-11-16T00:00:00Z');

/** Фикс и его повтор. Зовётся после шагов записей: фикс должен быть уже выпущен. */
export async function seedQualityRepeat(sql) {
    await sql(
        [
            `UPDATE "postmortem" SET "resource" = 'git-guard-push' WHERE "file" IN ('stand-case-21.md', 'stand-case-23.md');`,
            'INSERT INTO "record_transition" ("id", "kind", "recordId", "state", "at")',
            `SELECT 'cccccccc-0000-4000-8000-000000000021', 'postmortem', "id", 'released', TIMESTAMP '2026-08-02 12:00:00'`,
            `FROM "postmortem" WHERE "file" = 'stand-case-21.md';`,
        ].join('\n')
    );
}

export async function seedQuality(intake, tokens) {
    for (const line of QUALITY_LINES) {
        await intake('metrics', tokens.get(line.tree.slug), {
            schema: '2',
            tree: line.tree.slug,
            origin: line.origin,
            day: line.day,
            version: line.version,
            stamp: 100,
            metrics: line.metrics,
        });
    }
    for (const { tree, ...window } of EPIC_WINDOWS) {
        await intake('epic-windows', tokens.get(tree.slug), { schema: '2', tree: tree.slug, ...window, stamp: WINDOW_STAMP });
    }
}
