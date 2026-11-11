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
]);

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
}
