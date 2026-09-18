/**
 * Отказ правки, у которого есть код.
 *
 * Отличается от отказа чтения тем, что на занятое имя, пустое поле и запись, которую нельзя
 * трогать, приёмник отвечает кодом причины, а род отказа этого не несёт: все они приезжают
 * одним-двумя кодами ответа. Поэтому здесь, рядом с родом, лежит код причины.
 *
 * Берётся он не у всякого отказа: код есть у отклонённого обращения — того, что сделал человек, —
 * а у поломки службы его нет, и показывать человеку внутренности не за чем. Решение — чистая
 * функция: проверяется вызовом, без поднятого экрана и без запроса.
 *
 * Слово приёмника здесь не читается вовсе. Тело ответа несёт его рядом с кодом — для дерева, —
 * и обращение к нему вернуло бы русский текст на английском экране, притом молча: набор кодов
 * пополняется, а запасной путь остался бы прежним.
 *
 * Лежит в общем слое, а не в домене: панели выдачи приглашения и правок людей читают одно и то
 * же поле одного и того же отказа, и вторая копия разошлась бы с первой молча.
 */
import { IRefusal, refusalOf } from '@rt/message-bus-common';

import { TAdminText } from './admin-text.service';
import { EReadFault, readFaultKind } from './read-fault';

/** Отказ правки: род и код причины. Пусто — отказ не о том, что сделал человек, а о поломке. */
export interface ISpokenFault {
    readonly kind: EReadFault;
    /** Код причины. Пусто — приёмник его не назвал, и говорить будет экран сам. */
    readonly refusal: IRefusal | null;
}

/** Коды, у отказа которых причина показывается человеку: он про его же действие. */
const SPOKEN: readonly number[] = [400, 404, 409];

/** Роды отказа набором: пришедшее вне набора отказом правки не считается вовсе. */
const KINDS: readonly EReadFault[] = Object.values(EReadFault);

/** Отказ правки целиком: род по коду ответа, причина — только у отклонённого обращения. */
export function spokenFaultOf(status: number, body: unknown): ISpokenFault {
    return { kind: readFaultKind(status), refusal: SPOKEN.includes(status) ? refusalOf(body) : null };
}

/** Отказ правки из ошибки потока. Пусто — ошибка не отсюда, и разбирать её нечем. */
function spokenFaultFrom(error: unknown): ISpokenFault | null {
    if (typeof error !== 'object' || error === null) {
        return null;
    }

    const kind: unknown = Reflect.get(error, 'kind');
    const known: EReadFault | undefined = KINDS.find((one: EReadFault): boolean => one === kind);

    if (known === undefined) {
        return null;
    }

    return { kind: known, refusal: refusalOf(Reflect.get(error, 'refusal')) };
}

/** Код причины отказа. Пусто — приёмник его не назвал: говорить будет экран сам. */
export function spokenRefusalOf(error: unknown): IRefusal | null {
    return spokenFaultFrom(error)?.refusal ?? null;
}

/**
 * Что показать человеку вместо результата.
 *
 * Текст берётся из словаря по коду: отклонённое обращение приёмник объясняет кодом, а слово на
 * выбранном языке рисует экран. Поломка службы кода не несёт, и на неё отвечает строка экрана,
 * названная вызывающим.
 */
export function spokenFaultText(error: unknown, fallback: string, text: TAdminText): string {
    const refusal: IRefusal | null = spokenRefusalOf(error);

    return refusal === null ? fallback : text(refusal.code, refusal.params);
}
