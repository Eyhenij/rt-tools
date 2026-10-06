/**
 * Кто вошёл: имя для шапки и права для меню, стражей и кнопок.
 *
 * Права — роли клиента шины в токене Keycloak. Приёмник читает их из того же токена, и второго
 * источника у них нет.
 */
export interface IAdminSession {
    readonly name: string;
    readonly rights: readonly string[];
}
