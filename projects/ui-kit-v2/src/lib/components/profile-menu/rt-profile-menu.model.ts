/**
 * Модель `<rt-profile-menu>`: один корневой неймспейс с префиксом `I`.
 */

export namespace IRtProfileMenu {
    /**
     * Пункт смены организации:
     *  - `hidden` — пункта нет: организация приходит человеку из принадлежности;
     *  - `denied` — пункт стоит недоступным, подсказка объясняет почему;
     *  - `allowed` — пункт доступен и шлёт `changeOrganization`.
     *
     * Одно значение вместо двух флагов: сочетание «скрыт, но доступен» ничего не значит.
     */
    export type OrganizationChange = 'hidden' | 'denied' | 'allowed';

    /** Язык в переключателе: код уходит наружу, подпись видна человеку. */
    export interface Locale {
        readonly value: string;
        readonly label: string;
    }
}
