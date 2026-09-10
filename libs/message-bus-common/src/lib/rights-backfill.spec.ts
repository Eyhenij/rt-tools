import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { RIGHTS, TRight } from './rights';

/**
 * Перенос прежнего доступа на модель прав: сверка миграции с закрытым набором прав.
 *
 * Права объявлены кодом, а роли раздаются строками SQL. Два списка одного и того же набора
 * расходятся молча: код добавляет право, миграция о нём не знает, и роль владельца тихо перестаёт
 * открывать новый раздел. Ни сборка, ни линтер, ни проверка описаний этого не видят — SQL для них
 * текст.
 *
 * Тест читает саму миграцию, а не её пересказ: пересказ разошёлся бы с ней тем же способом.
 */

const MIGRATION: string = readFileSync(
    join(__dirname, '../../../../prisma/migrations/20260910100000_grant_rights_to_existing_accounts/migration.sql'),
    'utf8'
);

/**
 * Права одной роли: кусок текста от её заведения до конца перечисления.
 *
 * Ролей в миграции две, и общий поиск по всему тексту сложил бы их права в одну кучу — набор
 * владельца тогда сошёлся бы с закрытым набором и при потерянном праве, лишь бы его подобрала
 * вторая роль.
 */
function rightsOfRole(key: string): string[] {
    const at: number = MIGRATION.indexOf(`'${key}',`);

    expect(at).toBeGreaterThan(-1);

    const block: string = MIGRATION.slice(at, MIGRATION.indexOf(']', at));

    return [...block.matchAll(/'([a-z]+:[a-z]+)'/g)].map((found: RegExpMatchArray): string => found[1]);
}

describe('перенос прежнего доступа на модель прав', () => {
    it('SC-MB-323 — роль владельца получает все права закрытого набора', () => {
        const listed: string[] = rightsOfRole('owner');

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

    it('SC-MB-323 — роль разбора груза несёт только чтение и пометку груза', () => {
        const listed: string[] = rightsOfRole('cargo-triage');

        expect(listed.length).toBeGreaterThan(0);
        expect(listed).not.toContain('accounts:read');
        expect(listed.every((right: string): boolean => (RIGHTS as readonly string[]).includes(right))).toBe(true);
    });

    it('SC-MB-323 — роль достаётся записям без роли и не трогает остальные', () => {
        expect(MIGRATION).toMatch(/UPDATE\s+"account"/);
        expect(MIGRATION).toMatch(/WHERE\s+"roleId"\s+IS\s+NULL/);
    });

    it('SC-MB-323 — служебная запись разбора получает роль раньше общей раздачи владельца', () => {
        // Порядок здесь и есть решение: общая раздача ставит роль всякой записи без роли, и,
        // выполненная первой, она забрала бы служебную запись себе. Обе правки ищут пустую роль,
        // так что вторая по счёту служебную запись уже не увидит.
        const triageAt: number = MIGRATION.indexOf(`WHERE "nameKey" = 'cargo-triage'`);
        const ownerAt: number = MIGRATION.lastIndexOf(`WHERE "key" = 'owner'`);

        expect(triageAt).toBeGreaterThan(-1);
        expect(ownerAt).toBeGreaterThan(-1);
        expect(triageAt).toBeLessThan(ownerAt);
    });

    it('SC-MB-323 — повторное применение не заводит вторую роль', () => {
        expect(MIGRATION).toMatch(/ON CONFLICT\s+\("key"\)\s+DO NOTHING/);
    });
});
