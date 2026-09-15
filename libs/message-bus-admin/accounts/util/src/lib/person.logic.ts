/**
 * Решения раздела людей, вынесенные из экрана: подписи роли, состояния и последнего входа.
 *
 * Чистые функции без каркаса: их зовут перевод и его тест, а проверяются они вызовом — без
 * `TestBed` и без подмены зависимостей.
 */
import { adminLabel } from '@rt/message-bus-admin/common/core/util';

/**
 * Роль словами.
 *
 * Роли нет — это законное состояние записи: до раздачи прав так стояли все, и приёмник отдаёт
 * пустоту. Слово о ней говорит экран, а не приём: сказанное приёмом, оно жило бы в двух местах и
 * разошлось бы на первой правке словаря.
 */
export function personRoleLabel(role: string | null): string {
    return role ?? adminLabel('personRoleNone');
}

/**
 * Действует ли запись.
 *
 * Признак — пустота времени отключения, а не своя колонка: отключение случается один раз, и его
 * время само по себе и есть ответ.
 */
export function personIsLive(disabledAt: string | null): boolean {
    return disabledAt === null;
}

/**
 * Состояние записи по-русски: показывается им её строка.
 *
 * Спрашивается о том же времени отключения, что и признак действия, а не о самом признаке: два
 * значения, посчитанные из одного, расходятся молча, если одно из них где-то посчитают иначе.
 */
export function personStateLabel(disabledAt: string | null): string {
    return personIsLive(disabledAt) ? adminLabel('personStateLive') : adminLabel('personStateDisabled');
}

/**
 * Слово вместо времени последнего входа.
 *
 * Пустая ячейка читается как «не дочитали», а «этой записью не входили ни разу» — законное
 * состояние: так стоит всякая запись до первого входа.
 */
export function personLastLoginLabel(lastLoginAt: Date | null): string {
    return lastLoginAt === null ? adminLabel('personNeverLoggedIn') : '';
}

/**
 * Вопрос перед отключением.
 *
 * Называет запись и последствие, а не спрашивает «вы уверены»: отключённая запись не возвращается,
 * и человек решает по имени и по цене, а не по слову «да».
 */
export function personDisableQuestion(name: string): string {
    return adminLabel('personDisableQuestion', { name });
}

/**
 * Есть ли у строки действия в меню.
 *
 * Отключённая запись действий не несёт: отключить её второй раз нельзя, а новый пароль записи,
 * которой не входят, ничего не меняет. Своя запись здесь не отличается — её отличает экран, у
 * которого есть имя вошедшего; предикат строки его не знает.
 */
export function personRowHasActions(row: { readonly isLive: boolean }): boolean {
    return row.isLive;
}
