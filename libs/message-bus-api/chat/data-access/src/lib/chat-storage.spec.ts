/**
 * Что обещает сама миграция чата: снятие сайта уносит его переписки, а таблиц приёма она не
 * трогает вовсе.
 *
 * Читается текст миграции, а не поднятая база: обещание живёт в связях и в том, чего в файле
 * нет, — а «чего нет» на живой базе не спросить ничем, кроме того же текста. Каждое утверждение
 * об отсутствии идёт в паре с утверждением о наличии: поиск по опечатке не находит ничего и
 * этим зелен.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/** Корень дерева: отсюда до него шесть шагов вверх. */
const ROOT: string = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', '..', '..');

/** Текст миграции, заведшей записи чата. */
const MIGRATION: string = readFileSync(join(ROOT, 'prisma/migrations/20260920120000_chat_storage/migration.sql'), 'utf8');

/** Таблицы чата: их эта миграция и заводит. */
const CHAT_TABLES: readonly string[] = ['chat_space', 'chat_site', 'chat_visitor', 'chat_conversation', 'chat_message'];

/** Таблицы приёма груза: их эта миграция не называет ни одной. */
const INTAKE_TABLES: readonly string[] = ['tree', 'proposal', 'observation', 'postmortem', 'account', 'role', 'session'];

describe('миграция записей чата', () => {
    it('SC-CH-13 — снятие сайта уносит его переписки и сообщения', () => {
        const cascades: number = MIGRATION.split('ON DELETE CASCADE').length - 1;

        expect(MIGRATION).toContain('ADD CONSTRAINT "chat_conversation_siteId_fkey"');
        expect(MIGRATION).toContain('ADD CONSTRAINT "chat_message_conversationId_fkey"');
        expect(cascades).toBe(5);
    });

    it('SC-CH-14 — таблиц приёма миграция не трогает', () => {
        for (const table of CHAT_TABLES) {
            expect(MIGRATION).toContain(`CREATE TABLE "${table}"`);
        }

        for (const table of INTAKE_TABLES) {
            expect(MIGRATION).not.toContain(`TABLE "${table}"`);
            expect(MIGRATION).not.toContain(`ALTER TABLE "${table}"`);
        }
    });
});
