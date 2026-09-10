import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { RIGHTS, TRight } from './rights';

/**
 * Перенос прежнего доступа на модель прав: сверка миграции с закрытым набором прав.
 *
 * Права объявлены кодом, а роль владельца раздаётся строкой SQL. Два списка одного и того же
 * набора расходятся молча: код добавляет право, миграция о нём не знает, и роль владельца тихо
 * перестаёт открывать новый раздел. Ни сборка, ни линтер, ни проверка описаний этого не видят —
 * SQL для них текст.
 *
 * Тест читает саму миграцию, а не её пересказ: пересказ разошёлся бы с ней тем же способом.
 */

const MIGRATION: string = readFileSync(
    join(__dirname, '../../../../prisma/migrations/20260910090000_rights_backfill/migration.sql'),
    'utf8'
);

describe('перенос прежнего доступа на модель прав', () => {
    it('SC-MB-323 — роль владельца получает все права закрытого набора', () => {
        const listed: readonly string[] = [...MIGRATION.matchAll(/'([a-z]+:[a-z]+)'/g)].map((found: RegExpMatchArray): string => found[1]);

        // Сначала проверяется, что список вообще нашёлся: пустой список сошёлся бы с пустым
        // ожиданием, и тест зеленел бы на миграции, потерявшей права целиком.
        expect(listed.length).toBeGreaterThan(0);
        expect([...listed].sort()).toEqual([...RIGHTS].sort());
    });

    it('SC-MB-323 — право из набора не потеряно ни одно', () => {
        RIGHTS.forEach((right: TRight): void => {
            expect(MIGRATION).toContain(`'${right}'`);
        });
    });

    it('SC-MB-323 — роль достаётся записям без роли и не трогает остальные', () => {
        expect(MIGRATION).toMatch(/UPDATE\s+"account"/);
        expect(MIGRATION).toMatch(/WHERE\s+"roleId"\s+IS\s+NULL/);
    });

    it('SC-MB-323 — повторное применение не заводит вторую роль', () => {
        expect(MIGRATION).toMatch(/ON CONFLICT\s+\("key"\)\s+DO NOTHING/);
    });
});
