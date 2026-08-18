/**
 * Порядок строк, одинаковый на любой машине.
 *
 * Локаль названа прямо: взятая у среды, она разошлась бы между машинами, а порядок здесь уезжает
 * в груз и в разложенные файлы — там расхождение читается как правка.
 */
export function byText(one: string, other: string): number {
    return one.localeCompare(other, 'en');
}

/** Порядок пар «ключ и значение» по ключу: карта своего порядка не держит. */
export function byKey(one: readonly [string, unknown], other: readonly [string, unknown]): number {
    return byText(one[0], other[0]);
}
