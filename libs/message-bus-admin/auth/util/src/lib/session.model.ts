/**
 * Кто вошёл. Имя — единственное, что приёмник о вошедшем отдаёт: ни значения входа, ни его
 * срока в ответе нет и быть не может, а саму куку браузер скриптам не показывает.
 */
export interface IAdminSession {
    readonly name: string;
}

/** Пара, которой человек представляется. Живёт до отправки и нигде не сохраняется. */
export interface ISignInPair {
    readonly name: string;
    readonly password: string;
}
