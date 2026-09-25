import { ERtChatMessageStatus, IRtChat } from '../../rt-chat.model';

/**
 * Лента сообщений для показа `rt-chat` на витрине.
 *
 * Лежит отдельно от обёрток, потому что его берут двое: матрица состояний и вводная история.
 * Скопированный в обе, он расходится первой же правкой, и матрица с вводной начинают показывать
 * разное — а увидеть это можно только положив два кадра рядом.
 *
 * Время постоянное: вычисленное на месте, оно уводило бы кадр каждый день.
 *
 * Имя собеседника выдумано: витрину читает всякий, кто взял пакет, а в эталонном снимке имя
 * лежит картинкой, которую не найдёт ни один поиск по дереву.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
const NOW: string = '2026-03-14T16:02:00.000Z';

/** Автор чужих реплик: имя одно на все показы — разные читались бы как разные собеседники. */
export const CHAT_PEER: string = 'Петрова А. С.';

export const CHAT_MESSAGES: readonly IRtChat.Message[] = [
    { id: 1, author: 'Система', own: false, system: true, text: 'Переписка создана', createdAt: NOW },
    { id: 2, author: CHAT_PEER, own: false, text: 'Добрый день! Договор на согласовании.', createdAt: NOW },
    { id: 3, author: 'Вы', own: true, status: ERtChatMessageStatus.Read, text: 'Спасибо, ждём.', createdAt: NOW },
    {
        id: 4,
        author: CHAT_PEER,
        own: false,
        text: 'Приложила подписанный экземпляр.',
        createdAt: NOW,
        attachments: [{ id: 1, name: 'договор-2024-118.pdf', publicId: 'p1' }],
    },
];
