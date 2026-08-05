/**
 * Подпись по умолчанию, когда из URL не удалось извлечь имя файла. Нейтральная
 * и непереводимая: кит не знает языка потребителя, а видимую подпись
 * вызывающая сторона передаёт вторым аргументом.
 */
const DEFAULT_ATTACHMENT_NAME: string = 'file';

/**
 * Извлекает имя файла из URL: последний сегмент пути без query/fragment,
 * декодированный из percent-encoding. Нужен для вложений, у которых источник
 * отдаёт только ссылку на скачивание без метаданных (имени/размера).
 *
 * @param url Ссылка на файл. Пустая/`null` → `fallback`.
 * @param fallback Что вернуть, если сегмент пустой или URL не распарсился.
 */
export function fileNameFromUrl(url: string | null | undefined, fallback: string = DEFAULT_ATTACHMENT_NAME): string {
    if (!url) {
        return fallback;
    }

    const path: string = url.split('?')[0].split('#')[0];
    // У абсолютных URL имя файла живёт только в pathname — отбрасываем протокол и хост,
    // иначе для ссылки без пути ("https://host/") именем стал бы сам хост.
    let pathname: string = path;
    const schemeIdx: number = path.indexOf('://');
    if (schemeIdx !== -1) {
        const slashIdx: number = path.indexOf('/', schemeIdx + 3);
        pathname = slashIdx === -1 ? '' : path.slice(slashIdx);
    }
    const segment: string = pathname.split('/').filter(Boolean).pop() ?? '';
    if (!segment) {
        return fallback;
    }

    try {
        return decodeURIComponent(segment);
    } catch {
        // Некорректный percent-encoding — показываем сегмент как есть.
        return segment;
    }
}
