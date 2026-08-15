/**
 * Вошедший: то, что приёмник прочитал по куке входа, а не то, чем назвался запрос.
 *
 * Лежит под символом по той же причине, что и дерево запроса: поле с обычным именем приходит в
 * теле запроса, и перепутать прочитанное с присланным нельзя даже опечаткой.
 *
 * Живёт в слое утилит, потому что читают его и проверка входа, и операции чтения груза, а вторая
 * копия этого чтения разошлась бы с первой в коде отказа.
 */

/** Учётная запись, опознанная по куке входа. */
export interface IRequestAccount {
    readonly id: string;
    /** Имя, как его назвал владелец: оно уходит в ответ о том, кто вошёл. */
    readonly name: string;
    /** Вход, которым пришли: его обрывает выход, и только его. */
    readonly sessionId: string;
}

/** Ключ, под которым вошедший лежит в запросе. */
export const ACCOUNT_OF_REQUEST: unique symbol = Symbol('message-bus.account');

/** Запрос, в который проверка входа положила учётную запись. */
export interface IAccountBearingRequest {
    [ACCOUNT_OF_REQUEST]?: IRequestAccount;
}

/** Положить опознанного вошедшего в запрос. Зовёт проверка входа, и больше никто. */
export function rememberAccount(request: IAccountBearingRequest, account: IRequestAccount): void {
    request[ACCOUNT_OF_REQUEST] = account;
}

/**
 * Вошедший.
 *
 * Пусто здесь означает не отказ вызывающему, а дефект приложения: операция объявлена, но
 * проверкой входа не закрыта. Человеку править нечего, и отказ поэтому свой, а не его.
 */
export function accountOf(request: IAccountBearingRequest): IRequestAccount {
    const account: IRequestAccount | undefined = request[ACCOUNT_OF_REQUEST];

    if (!account) {
        throw new Error('вошедший не прочитан: операция не закрыта проверкой входа');
    }

    return account;
}
