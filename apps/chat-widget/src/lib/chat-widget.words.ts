/**
 * Слова виджета.
 *
 * Свои, а не из словаря админки: виджет стоит в чужой странице и приезжает туда одним файлом —
 * словарь админки привёз бы с собой подписи семи разделов, до которых посетителю дела нет.
 *
 * Набор один, на языке владельца: второй язык — работа своя, и здесь он не обещан.
 */

/** Ключ слова набора. */
export type TWidgetWord =
    | 'bubble'
    | 'close'
    | 'placeholder'
    | 'send'
    | 'sideVisitor'
    | 'sideOperator'
    | 'unavailable'
    | 'answering'
    | 'later'
    | 'sendFailed'
    | 'tooLong';

export const WIDGET_WORDS: Readonly<Record<TWidgetWord, string>> = Object.freeze({
    /** Подпись свёрнутого виджета: её читает и тот, кто пользуется голосом экрана. */
    bubble: 'Чат с поддержкой',
    close: 'Свернуть чат',
    placeholder: 'Напишите нам',
    send: 'Отправить',
    sideVisitor: 'Вы',
    sideOperator: 'Поддержка',
    unavailable: 'Чат недоступен',
    answering: 'Отвечаем сейчас',
    later: 'Ответим в рабочие часы',
    sendFailed: 'Реплика не ушла',
    tooLong: 'Реплика длиннее, чем принимает сервис',
});
