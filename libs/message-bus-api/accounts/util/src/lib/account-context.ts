/**
 * Вошедший: то, что модуль входа прочитал из токена Keycloak, а не то, чем назвался запрос.
 *
 * Модуль кладёт вызывающего под своим символом, и поле с обычным именем из тела запроса с ним не
 * перепутать даже опечаткой. Здесь он только переводится в слова приёмника: операции чтения груза
 * знают вошедшего по ключу и имени, а не по форме токена.
 *
 * Живёт в слое утилит, потому что читают его операции разных доменов, а вторая копия этого чтения
 * разошлась бы с первой в том, какое имя уходит в журнал.
 */
import { ICaller } from '@rt-tools/auth-contract';
import { REQUEST_CALLER } from '@rt-tools/auth-server';

/** Человек, опознанный по токену Keycloak. */
export interface IRequestAccount {
    /** Ключ человека в Keycloak: он не меняется, когда меняются имя и почта. */
    readonly id: string;
    /** Имя, как оно записано в Keycloak, а без имени — почта: оно уходит в журнал и в ответы чата. */
    readonly name: string;
}

/** Запрос, в который модуль входа положил вызывающего. */
export interface IAccountBearingRequest {
    [REQUEST_CALLER]?: ICaller;
}

/**
 * Вошедший запроса.
 *
 * Бросает, если вызывающего нет: значит, операция не закрыта входом, а читает вошедшего. Это
 * дефект объявления, и отвечать вызывающему пустым именем вместо отказа нельзя.
 */
export function accountOf(request: IAccountBearingRequest): IRequestAccount {
    const caller: ICaller | undefined = request[REQUEST_CALLER];

    if (!caller) {
        throw new Error('the entered one is not read: the operation is not closed by the check of the entry');
    }

    return { id: caller.subject, name: caller.name ?? caller.email ?? caller.subject };
}

/**
 * Запрос с вошедшим, каким его оставляет модуль входа. Прав у такого вошедшего нет: право проверяет
 * модуль до операции, а операции читают только ключ и имя.
 */
export function requestSignedInAs(id: string, name: string): IAccountBearingRequest {
    return { [REQUEST_CALLER]: { name, subject: id, email: null, emailVerified: false, permissions: new Set() } };
}
