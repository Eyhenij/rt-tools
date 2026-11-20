/**
 * Модель `<rt-input>`: один корневой неймспейс с префиксом `I`.
 */
export namespace IRtInput {
    /**
     * Допустимые HTML-типы инпута.
     *
     * `time` заведён под режим работы пользователя: браузер сам отдаёт `HH:MM` и
     * раскладку под локаль, а разбор строки руками означал бы своё поле ввода
     * времени рядом с китом.
     */
    export type Type = 'text' | 'password' | 'email' | 'time' | 'url';

    /** Размерный вариант поля (высота). Общий для всего input-семейства. */
    export type Size = 'sm' | 'md' | 'lg';

    /**
     * Вид рамки поля. `outline` — рамка со всех сторон, `fill` — залитое поле с чертой снизу, как у
     * материального поля первого кита, `pill` — залитое поле-таблетка без черты.
     */
    export type Appearance = 'outline' | 'fill' | 'pill';

    /**
     * Поле как строка поиска над списком вариантов: `role="combobox"` и ссылки на список. Нужно подсказчику
     * в шторке, где набирают в поле поиска, а не в поле под шторкой.
     */
    export interface Combobox {
        /** Идентификатор списка вариантов (`aria-controls`). */
        readonly controls: string;
        /** Список открыт (`aria-expanded`). */
        readonly expanded: boolean;
        /** Идентификатор подсвеченного варианта (`aria-activedescendant`) или `null`. */
        readonly activeDescendant: string | null;
    }
}
