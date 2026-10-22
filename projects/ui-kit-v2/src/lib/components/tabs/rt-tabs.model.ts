import { IRtIcon } from '@rt-tools/ui-kit-v2/core';

/**
 * Модель `<rt-tabs>`: один корневой неймспейс с префиксом `I`.
 * Содержит публичные union-типы для ориентации и стороны header-контролов.
 */
export namespace IRtTabs {
    /** Идентификатор вкладки. Строка — стабильный id, число — индекс-подобный ключ. */
    export type Id = string | number;

    /** Ориентация полосы вкладок. */
    export type Direction = 'horizontal' | 'vertical';

    /**
     * Что делают стрелки и Home/End на вкладке: `auto` — сразу открывают вкладку, `manual` — только
     * переводят фокус, а открывают Enter и Space.
     */
    export type Activation = 'auto' | 'manual';

    /**
     * Где стоят стрелки прокрутки переполненной полосы: `overlay` — поверх вкладок, только в ту
     * сторону, куда можно прокрутить; `inline` — обе в своих местах по краям, полоса между ними уже,
     * стрелка в сторону, куда прокручивать некуда, неактивна.
     */
    export type ScrollArrows = 'overlay' | 'inline';

    /**
     * На сколько сдвигает полосу одно нажатие на стрелку: `fixed` — на 80 px, как прежде; `page` —
     * на видимую ширину, `third` — на её треть, как у Material.
     */
    export type ScrollStep = 'fixed' | 'page' | 'third';

    /**
     * Длительность движения при смене вкладки: переезда полосы и сдвига панели. Число — миллисекунды,
     * строка — значение CSS (`'500ms'`, `'0.5s'`); строка из одних цифр читается как миллисекунды.
     * `null` — длительности берутся из токенов `--rt-tabs-indicator-duration` и `--rt-tabs-panel-duration`.
     */
    export type AnimationDuration = string | number | null;

    /** Сторона размещения header-контрола относительно полосы вкладок. */
    export type ControlSide = 'left' | 'right';

    /** Семантический цвет иконки/бейджа вкладки — маппится на палитру `rt-icon`. */
    export type TitleColor = IRtIcon.Color;
}
