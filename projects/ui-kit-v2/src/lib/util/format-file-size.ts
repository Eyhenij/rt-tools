/**
 * Форматирует размер файла в байтах в человекочитаемую строку (SI, base-1000).
 *
 * Используется десятичная система (1 кБ = 1000 Б), а не двоичная (KiB), —
 * так размер совпадает с тем, что показывает большинство ОС и файловых менеджеров.
 * Единицы — латиницей (`B` / `kB` / `MB` / `GB`), как в макете карточки файла.
 *
 * @param bytes Размер в байтах. `null`/`undefined`/`NaN`/отрицательное → пустая строка
 *   (caller сам решает, скрывать бейдж или нет).
 * @returns Строка вида `"82 kB"`, `"1.4 MB"` или `""`, если размер неизвестен.
 */
export function formatFileSize(bytes: number | null | undefined): string {
    if (bytes === null || bytes === undefined || Number.isNaN(bytes) || bytes < 0) {
        return '';
    }

    if (bytes < 1_000) {
        return `${bytes} B`;
    }

    if (bytes < 1_000_000) {
        return `${Math.round(bytes / 1_000)} kB`;
    }

    if (bytes < 1_000_000_000) {
        return `${(bytes / 1_000_000).toFixed(1)} MB`;
    }

    return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
}
