/**
 * Кука входа в запросе: как её достать из заголовка.
 *
 * Разбор свой, а не пакетом-разборщиком: приёмнику нужна ровно одна кука, а новая зависимость —
 * это ещё один пакет в образе и ещё одна строка, которую придётся поднимать при каждом
 * обновлении. Формат заголовка простой и меняться ему негде: пары «имя=значение» через `;`.
 */
import { SESSION_COOKIE } from './session-token.util';

/**
 * Значение куки входа. Пусто — её в запросе нет.
 *
 * Заголовок, повторённый дважды, каркас отдаёт массивом; такой запрос кукой не считается вовсе —
 * два входа в одном запросе не выбор приёмника, какой из них взять.
 */
export function sessionCookieOf(raw: string | string[] | undefined): string {
    if (typeof raw !== 'string') {
        return '';
    }

    for (const pair of raw.split(';')) {
        const at: number = pair.indexOf('=');

        if (at < 0) {
            continue;
        }

        if (pair.slice(0, at).trim() === SESSION_COOKIE) {
            return decodeURIComponent(pair.slice(at + 1).trim());
        }
    }

    return '';
}
