import { fileNameFromUrl, IQuillDelta } from '../../util';

import { ERtChatMessageStatus, IRtChat } from './rt-chat.model';

/**
 * Статус уже сохранённого своего сообщения: сервер знает только, дошло ли оно до
 * собеседника. Часы и ошибка — состояния клиентской очереди, сюда не попадают.
 */
export function deliveryStatus(read: boolean): ERtChatMessageStatus {
    return read ? ERtChatMessageStatus.Read : ERtChatMessageStatus.Sent;
}

/**
 * Сообщение, ещё не подтверждённое сервером. Серверного id и ссылок на вложения
 * у него нет: есть клиентский ключ, текст и выбранные файлы.
 *
 * Rich-тело приходит уже разобранным — доменная форма его хранения тут ни при
 * чём, а хранят его стороны по-разному: одна шлёт обычный текст, другая —
 * строку композера, которая в том же виде уходит на сервер.
 */
export interface IRtPendingMessage {
    tempId: string;
    text: string;
    delta?: IQuillDelta | null;
    createdAt: string;
    status: IRtChat.MessageStatus;
    files: readonly File[];
}

/**
 * Неподтверждённое сообщение → строка ленты. Показывается сразу после отправки:
 * ждать ответа сервера, глядя в пустоту, незачем ни одной из сторон.
 *
 * Скрыть такое сообщение нельзя: на сервере его ещё нет, и удалять нечего.
 */
export function pendingToRtMessage(pending: IRtPendingMessage, authorLabel: string): IRtChat.Message {
    return {
        id: pending.tempId,
        tempId: pending.tempId,
        author: authorLabel,
        own: true,
        text: pending.text,
        delta: pending.delta ?? null,
        createdAt: pending.createdAt,
        status: pending.status,
        canDelete: false,
        attachments: pending.files.map((file: File, index: number): IRtChat.Attachment => ({
            id: index,
            name: file.name,
            // Файл ещё не на сервере — скачивать нечего, карточка только именует.
            publicId: '',
        })),
    };
}

/**
 * Структурный контракт доменного сообщения, достаточный для маппинга в
 * `IRtChat.Message`. Доменные модели удовлетворяют ему по форме;
 * роль-специфика (автор/own/system) задаётся опциями.
 */
export interface IRtMappableMessage {
    id: string | number;
    tempId?: string;
    status?: IRtChat.MessageStatus;
    message: string;
    messageDelta: IQuillDelta | null;
    createdAt: string;
    fileUrl: string | null;
    attachments: readonly { id: number; name: string; publicId: string }[];
}

/**
 * Опции маппинга: роль-специфичные куски, которые не вывести из общего контракта.
 *
 * - `roleLabel` — подпись автора (обычно ярлык роли).
 * - `isOwn` — своё ли это сообщение (правый пузырь).
 * - `isSystem` — системное ли (нейтральный стиль); по умолчанию нет.
 * - `fileName` — имя файла вложения; по умолчанию выводится из `fileUrl`.
 * - `optimistic` — включить `tempId`/`status` (оптимистичная отправка); по умолчанию да.
 *   Для read-only тредов (агент) — `false`: тогда `id` берётся из серверного `id`.
 */
export interface IToRtMessageOptions<TMessage extends IRtMappableMessage> {
    roleLabel: (message: TMessage) => string;
    isOwn: (message: TMessage) => boolean;
    isSystem?: (message: TMessage) => boolean;
    fileName?: (message: TMessage) => string | null;
    optimistic?: boolean;
}

/**
 * Собрать `IRtChat.Message` из доменного сообщения. Общие поля (текст, delta,
 * дата, вложения, файл) берутся из контракта; автор/own/system/имя файла —
 * из опций. Ключ `id` — `tempId ?? id` в оптимистичном режиме (пока сервер не
 * подтвердил), иначе серверный `id`.
 */
export function toRtMessage<TMessage extends IRtMappableMessage>(
    message: TMessage,
    options: IToRtMessageOptions<TMessage>
): IRtChat.Message {
    const optimistic: boolean = options.optimistic ?? true;
    const fileNameFromUrlOrNull: string | null = message.fileUrl ? fileNameFromUrl(message.fileUrl) : null;
    return {
        id: optimistic ? (message.tempId ?? message.id) : message.id,
        tempId: optimistic ? message.tempId : undefined,
        status: optimistic ? message.status : undefined,
        author: options.roleLabel(message),
        own: options.isOwn(message),
        system: options.isSystem?.(message) ?? false,
        text: message.message,
        delta: message.messageDelta,
        createdAt: message.createdAt,
        fileUrl: message.fileUrl,
        fileName: options.fileName ? options.fileName(message) : fileNameFromUrlOrNull,
        attachments: message.attachments.map((attachment: { id: number; name: string; publicId: string }): IRtChat.Attachment => ({
            id: attachment.id,
            name: attachment.name,
            publicId: attachment.publicId,
        })),
    };
}
