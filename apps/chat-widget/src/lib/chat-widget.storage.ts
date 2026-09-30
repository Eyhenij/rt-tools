/**
 * Хранилище браузера виджета: признак посетителя и минуты, когда он видел обращения.
 *
 * Закрытое хранилище — не отказ: виджет тогда живёт до перезагрузки страницы, как у посетителя
 * без признака.
 */
/** Чтение хранилища браузера: закрытое хранилище — не отказ, а посетитель без признака. */
export function read(key: string): string {
    try {
        return localStorage.getItem(key) ?? '';
    } catch {
        return '';
    }
}

/** Запись в хранилище. Не записалась — разговор живёт до перезагрузки страницы, и это не отказ. */
export function write(key: string, value: string): void {
    try {
        localStorage.setItem(key, value);
    } catch {
        return;
    }
}

/** Минуты, когда посетитель видел обращения. Испорченная запись читается как пустая. */
export function readSeen(key: string): Record<string, string> {
    try {
        const parsed: unknown = JSON.parse(read(key) || '{}');

        return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
    } catch {
        return {};
    }
}
