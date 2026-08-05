/**
 * Тело сообщения чата в rich-формате Quill delta. Форма и whitelist атрибутов
 * зафиксированы контрактом бэка: только текстовые вставки + ограниченный набор
 * форматирования, никаких ссылок и вложенных объектов (анонимность).
 */

/** Атрибуты форматирования Quill delta — строго whitelist (без link/media). */
export interface IQuillDeltaAttributes {
    bold?: true;
    italic?: true;
    underline?: true;
    strike?: true;
    blockquote?: true;
    'code-block'?: true;
    list?: 'ordered' | 'bullet';
    header?: 1 | 2 | 3;
}

/** Одна операция delta: текстовая вставка + опциональные атрибуты. */
export interface IQuillDeltaOp {
    insert: string;
    attributes?: IQuillDeltaAttributes;
}

/** Тело сообщения в rich-формате Quill delta. */
export interface IQuillDelta {
    ops: IQuillDeltaOp[];
}
