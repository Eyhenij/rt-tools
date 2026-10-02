/**
 * Решения виджета, вынесенные из разметки: они проверяются вызовом, а не поднятой страницей.
 *
 * Адрес сервиса, ключ хранилища, годность реплики и слово о часах ответа — всё это виджет решает
 * до того, как что-то нарисовать. Оставшись внутри элемента, каждое из них проверялось бы только
 * поднятым браузером.
 */
import { CHAT_SIDE_OPERATOR, EChatTalkState, IChatMessageRow, IChatSiteLookRow, IChatVisitorTalkListRow } from '@rt/message-bus-common';

/** Минута суток часами и минутами. */
function clockOf(minutes: number): string {
    const hour: number = Math.floor(minutes / 60) % 24;
    const minute: number = minutes % 60;

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** Под каким именем признак посетителя лежит в хранилище браузера. */
export function widgetStorageKey(siteKey: string): string {
    return `rt-chat:${siteKey}`;
}

/**
 * Адрес сервиса.
 *
 * Названный признаком тега — он и берётся: площадка вправе держать сервис на своём поддомене.
 * Не названный — берётся оттуда, откуда приехал сам скрипт: страница потребителя стоит на чужом
 * узле, и свой адрес сервису там взять больше неоткуда.
 */
export function widgetServiceOrigin(asked: string, scriptSrc: string): string {
    const named: string = asked.trim();

    if (named) {
        return named.endsWith('/') ? named.slice(0, named.length - 1) : named;
    }

    try {
        return new URL(scriptSrc).origin;
    } catch {
        return '';
    }
}

/** Годна ли реплика к отправке. Пустая не уходит вовсе: обращение за ней тратится впустую. */
export function widgetSendable(text: string): boolean {
    return text.trim().length > 0;
}

/** Что сказать о часах ответа: отвечает сейчас, ответит в рабочие часы или часы не названы. */
export enum EWidgetHoursWord {
    Answering = 'answering',
    Later = 'later',
    Silent = 'silent',
}

/** Слово о часах по ответу сервиса: решение о «сейчас» принято им, здесь только выбор слова. */
export function widgetHoursWord(look: IChatSiteLookRow): EWidgetHoursWord {
    if (look.answerFrom === look.answerTo) {
        return EWidgetHoursWord.Silent;
    }

    return look.answering ? EWidgetHoursWord.Answering : EWidgetHoursWord.Later;
}

/** Часы ответа словами человека: «09:00–18:00». Минуты суток приезжают числами. */
export function widgetHoursText(look: IChatSiteLookRow): string {
    return `${clockOf(look.answerFrom)}–${clockOf(look.answerTo)}`;
}

/**
 * Время реплики часами и минутами в поясе посетителя: «12:40».
 *
 * Сервис отдаёт минуту приёма строкой ISO. Нечитаемая строка даёт пустое время, а не «NaN:NaN»:
 * пузырь без времени читается лучше, чем с мусором.
 */
export function widgetTimeText(takenAt: string): string {
    const moment: Date = new Date(takenAt);

    if (Number.isNaN(moment.getTime())) {
        return '';
    }

    return clockOf(moment.getHours() * 60 + moment.getMinutes());
}

/** Под каким именем в хранилище браузера лежат минуты, когда посетитель последний раз видел обращения. */
export function widgetSeenKey(siteKey: string): string {
    return `rt-chat-seen:${siteKey}`;
}

/**
 * Непрочитан ли ответ в обращении.
 *
 * Непрочитан, когда последняя реплика — ответ, и она свежее минуты, когда посетитель последний раз
 * видел это обращение. Не видел ни разу — ответ непрочитан. Своя реплика посетителя точки не
 * ставит: её он читал, когда писал.
 */
export function widgetUnread(talk: IChatVisitorTalkListRow, seenAt: string): boolean {
    if (talk.lastMessageSide !== CHAT_SIDE_OPERATOR) {
        return false;
    }

    const seen: number = new Date(seenAt).getTime();

    return Number.isNaN(seen) || new Date(talk.lastMessageAt).getTime() > seen;
}

/**
 * Список обращений после пришедшего закрытия: строка закрытого обращения получает состояние и
 * минуту закрытия. Обращения, которого в списке нет, закрытие не добавляет — его строку принесёт
 * следующее чтение списка.
 */
export function widgetClosedTalks(
    talks: readonly IChatVisitorTalkListRow[],
    conversationId: string,
    closedAt: string
): IChatVisitorTalkListRow[] {
    return talks.map((talk: IChatVisitorTalkListRow): IChatVisitorTalkListRow =>
        talk.id === conversationId ? { ...talk, closedAt, state: EChatTalkState.Closed } : talk
    );
}

/** Инициалы для круга аватара: первые буквы двух первых слов имени, заглавными. */
export function widgetInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word: string): string => word.charAt(0))
        .join('')
        .toUpperCase();
}

/** Первое слово имени: им подписан пузырь ответа, как в макете — «Анна». */
export function widgetFirstName(name: string): string {
    return name.trim().split(/\s+/)[0] ?? '';
}

/** Имя того, кто ответил последним в ленте. Пусто — названного ответа ещё не было. */
export function widgetLastAuthor(messages: readonly IChatMessageRow[]): string {
    for (let index: number = messages.length - 1; index >= 0; index -= 1) {
        const author: string = messages[index].authorName ?? '';

        if (author) {
            return author;
        }
    }

    return '';
}

/**
 * Когда была последняя реплика, словами строки списка.
 *
 * Сегодня — часами и минутами, вчера — словом дня, раньше — числом и месяцем: «24 сент.». Минута
 * «сейчас» приезжает доводом, а не читается часами внутри: решение проверяется вызовом.
 */
export function widgetDayText(takenAt: string, now: Date, yesterday: string): string {
    const moment: Date = new Date(takenAt);

    if (Number.isNaN(moment.getTime())) {
        return '';
    }

    const day: (at: Date) => number = (at: Date): number => new Date(at.getFullYear(), at.getMonth(), at.getDate()).getTime();
    const daysAgo: number = Math.round((day(now) - day(moment)) / 86_400_000);

    if (daysAgo <= 0) {
        return widgetTimeText(takenAt);
    }

    if (daysAgo === 1) {
        return yesterday;
    }

    return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(moment);
}
