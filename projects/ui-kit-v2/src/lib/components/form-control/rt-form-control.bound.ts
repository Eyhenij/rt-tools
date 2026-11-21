/**
 * Граница поля из входа ограничения: `min`, `max`. Сигнальная форма (`[formField]`) пишет во вход
 * с именем ограничения `undefined`, когда форма такого ограничения не задала; это то же, что `null`
 * прежней привязки, — границы нет.
 */
export function rtBoundOrNull<TBound>(value: TBound | null | undefined): TBound | null {
    return value ?? null;
}

/**
 * Граница поля, тип которой форма выводит из типа значения поля. У поля диапазона значение —
 * объект, и сигнальная форма типизирует его `min`, `max` тем же объектом; границу задаёт только
 * строка дня, всё остальное читается как её отсутствие.
 */
export function rtDayBoundOrNull(value: unknown): string | null {
    return typeof value === 'string' ? value : null;
}
