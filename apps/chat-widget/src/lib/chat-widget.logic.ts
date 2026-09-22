/**
 * Решения виджета, вынесенные из разметки: они проверяются вызовом, а не поднятой страницей.
 *
 * Адрес сервиса, ключ хранилища, годность реплики и слово о часах ответа — всё это виджет решает
 * до того, как что-то нарисовать. Оставшись внутри элемента, каждое из них проверялось бы только
 * поднятым браузером.
 */
import { IChatSiteLookRow } from '@rt/message-bus-common';

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
