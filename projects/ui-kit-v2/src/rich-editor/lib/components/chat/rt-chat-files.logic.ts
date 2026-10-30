/** Выбранные файлы вместе с только что добавленными. Список всегда новый: его читает сигнал. */
export function withAppendedFiles(current: ReadonlyArray<File>, added: ReadonlyArray<File>): File[] {
    return [...current, ...added];
}

/** Выбранные файлы без того, что стоит на этом месте. */
export function withoutFileAt(current: ReadonlyArray<File>, index: number): File[] {
    return current.filter((_: File, position: number): boolean => position !== index);
}

/** Файлы, названные полем выбора. Поле без выбора отдаёт пустой список, а не отсутствие. */
export function pickedFiles(files: FileList | null): File[] {
    return Array.from(files ?? []);
}

/** Можно ли отправить: поле не занято и в нём есть текст или, при включённых вложениях, файл */
export function rtChatCanSend(busy: boolean, value: Partial<{ message: string; files: File[] }>, attachments: boolean): boolean {
    if (busy) {
        return false;
    }
    const hasText: boolean = (value.message ?? '').trim().length > 0;
    return hasText || (attachments && (value.files?.length ?? 0) > 0);
}
