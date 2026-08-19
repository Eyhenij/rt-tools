/**
 * Отказ выдачи приглашения.
 *
 * Отличается от отказа чтения тем, что у него бывает своё слово. Приёмник отбивает занятое имя
 * текстом, который написан человеку — «дерево уже заведено», «годное приглашение уже выдано», —
 * и род отказа этого не несёт: оба приезжают одним кодом. Поэтому здесь, рядом с родом, лежит
 * сказанное приёмником.
 *
 * Берётся оно не у всякого отказа: своё слово есть у отбитого обращения — занятое имя, пустое
 * имя, — а у поломки службы его нет, и показывать человеку внутренности не за чем. Решение —
 * чистая функция: проверяется вызовом, без поднятого экрана и без запроса.
 */
import { EReadFault, readFaultKind } from '@rt/message-bus-admin/common/core/util';

/** Отказ выдачи: род и то, что сказал приёмник. Пустое слово — говорить будет экран сам. */
export interface IInviteFault {
    readonly kind: EReadFault;
    /** Слово приёмника. Пусто — отказ не о том, что сделал человек, а о поломке. */
    readonly said: string;
}

/** Коды, у отказа которых слово приёмника показывается человеку: он про его же действие. */
const SPOKEN: readonly number[] = [400, 409];

/** Слово приёмника из тела ответа. Пусто — тело не тем, и пересказывать нечего. */
function saidOf(body: unknown): string {
    const message: unknown = typeof body === 'object' && body !== null ? Reflect.get(body, 'message') : body;

    return typeof message === 'string' ? message.trim() : '';
}

/** Отказ выдачи целиком: род по коду ответа, слово — только у отбитого обращения. */
export function inviteFaultOf(status: number, body: unknown): IInviteFault {
    return { kind: readFaultKind(status), said: SPOKEN.includes(status) ? saidOf(body) : '' };
}
