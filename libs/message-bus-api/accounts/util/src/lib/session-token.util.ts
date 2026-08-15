/**
 * Вход: значение, которым браузер представляется между запросами, его хеш и срок.
 *
 * Значение уезжает в куку, недоступную скриптам, а в хранилище ложится только хеш — по нему
 * вход не подделывается. Растягивания здесь нет по той же причине, что и у токена дерева:
 * тридцать два случайных байта перебором не берутся, а растягивание платилось бы на каждом
 * запросе всякого раздела.
 */
import { createHash, randomBytes } from 'node:crypto';

/** Длина случайной части входа в байтах. */
const SESSION_BYTES: number = 32;

/** Имя куки, в которой браузер несёт вход. */
export const SESSION_COOKIE: string = 'message_bus_session';

/**
 * Сколько живёт вход, когда настройка молчит, — двенадцать часов в миллисекундах.
 *
 * Число — допущение исполнителя, открытый вопрос `Q-21` договорённости: его называет владелец, и
 * меняется оно настройкой, а не правкой кода.
 */
export const DEFAULT_SESSION_TTL_MS: number = 12 * 60 * 60 * 1000;

/** Новое значение входа. Уходит в куку и в хранилище не попадает — туда ложится только хеш. */
export function issueSessionToken(): string {
    return randomBytes(SESSION_BYTES).toString('hex');
}

/** Хеш входа — то, чем вход опознаётся в хранилище. */
export function sessionTokenHash(token: string): string {
    return createHash('sha256').update(token, 'utf8').digest('hex');
}

/**
 * Сколько живёт вход по настройке окружения.
 *
 * Незаданное, нечисловое и неположительное значение читаются одинаково — как «настройки нет»:
 * срок в ноль секунд означал бы вход, просроченный в момент выдачи, и служба выглядела бы
 * сломанной входом, а не ненастроенной.
 */
export function sessionTtlMs(raw: string | undefined): number {
    const named: number = Number(raw);

    return Number.isFinite(named) && named > 0 ? named : DEFAULT_SESSION_TTL_MS;
}

/** Когда истекает вход, заведённый в этот момент. */
export function sessionExpiry(at: Date, ttlMs: number): Date {
    return new Date(at.getTime() + ttlMs);
}

/** Жив ли вход: не оборван и не просрочен. */
export function sessionAlive(session: { expiresAt: Date; revokedAt: Date | null }, at: Date): boolean {
    return session.revokedAt === null && session.expiresAt.getTime() > at.getTime();
}
