/**
 * Отказ правки, у которого бывает своё слово.
 *
 * Отличается от отказа чтения тем, что на занятое имя, пустое поле и запись, которую нельзя
 * трогать, приёмник отвечает текстом, написанным человеку, — и род отказа этого не несёт: все они
 * приезжают одним-двумя кодами. Поэтому здесь, рядом с родом, лежит сказанное приёмником.
 *
 * Берётся оно не у всякого отказа: своё слово есть у отклонённого обращения — то, что сделал
 * человек, — а у поломки службы его нет, и показывать человеку внутренности не за чем. Решение —
 * чистая функция: проверяется вызовом, без поднятого экрана и без запроса.
 *
 * Лежит в общем слое, а не в домене: панели выдачи приглашения и правок людей читают одно и то
 * же поле одного и того же отказа, и вторая копия разошлась бы с первой молча.
 */
import { EReadFault, readFaultKind } from './read-fault';

/** Отказ правки: род и то, что сказал приёмник. Пустое слово — говорить будет экран сам. */
export interface ISpokenFault {
    readonly kind: EReadFault;
    /** Слово приёмника. Пусто — отказ не о том, что сделал человек, а о поломке. */
    readonly said: string;
}

/** Коды, у отказа которых слово приёмника показывается человеку: он про его же действие. */
const SPOKEN: readonly number[] = [400, 404, 409];

/** Роды отказа набором: пришедшее вне набора отказом правки не считается вовсе. */
const KINDS: readonly EReadFault[] = Object.values(EReadFault);

/** Слово приёмника из тела ответа. Пусто — тело не тем, и пересказывать нечего. */
function saidOf(body: unknown): string {
    const message: unknown = typeof body === 'object' && body !== null ? Reflect.get(body, 'message') : body;

    return typeof message === 'string' ? message.trim() : '';
}

/** Отказ правки целиком: род по коду ответа, слово — только у отклонённого обращения. */
export function spokenFaultOf(status: number, body: unknown): ISpokenFault {
    return { kind: readFaultKind(status), said: SPOKEN.includes(status) ? saidOf(body) : '' };
}

/** Отказ правки из ошибки потока. Пусто — ошибка не отсюда, и разбирать её нечем. */
function spokenFaultFrom(error: unknown): ISpokenFault | null {
    if (typeof error !== 'object' || error === null) {
        return null;
    }

    const kind: unknown = Reflect.get(error, 'kind');
    const said: unknown = Reflect.get(error, 'said');
    const known: EReadFault | undefined = KINDS.find((one: EReadFault): boolean => one === kind);

    return known !== undefined && typeof said === 'string' ? { kind: known, said } : null;
}

/**
 * Что показать человеку вместо результата.
 *
 * Слово приёмника показывается как есть, когда оно есть: отклонённое обращение он объясняет
 * человеку сам. Поломка службы своего слова не несёт, и на неё отвечает строка экрана, названная
 * вызывающим.
 */
export function spokenFaultText(error: unknown, fallback: string): string {
    const fault: ISpokenFault | null = spokenFaultFrom(error);

    return fault === null || fault.said === '' ? fallback : fault.said;
}
