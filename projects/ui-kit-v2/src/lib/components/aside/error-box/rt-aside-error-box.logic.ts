function errorAsText(error: unknown): string {
    try {
        return JSON.stringify(error) ?? String(error);
    } catch {
        return String(error);
    }
}

/**
 * Текст, который кнопка блока ошибки кладёт в буфер обмена.
 *
 * Вид повторяет первый кит — `Error time: <дата>_<время>;Error info: <JSON>`: кто разбирал такие
 * копии раньше, читает их так же. Ошибку с петлёй внутри `JSON.stringify` не пишет и бросает —
 * тогда в копию идёт её строковый вид, и нажатие не падает.
 */
export function rtAsideErrorCopyText(error: unknown, now: Date): string {
    return `Error time: ${now.toDateString()}_${now.toTimeString()};Error info: ${errorAsText(error)}`;
}
