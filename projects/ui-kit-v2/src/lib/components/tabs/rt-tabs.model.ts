import { Signal } from '@angular/core';

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

    /** Что делать, когда вкладки не встают: прокручивать полосу (`scroll`) или уносить лишние в меню (`more`). */
    export type Overflow = 'scroll' | 'more';

    /** У каких вкладок ряда виден крестик. */
    export type CloseOn = 'all' | 'selected';

    /** Контекст шаблона меню вкладки: id вкладки, на которой нажали правую кнопку. */
    export interface ContextMenuContext {
        readonly $implicit: Id;
    }

    /** Что нужно ряду от полосы. Тип вкладки — параметр: директива сама читает эту модель. */
    export interface MoreRowDeps<TAB> {
        readonly enabled: Signal<boolean>;
        readonly visible: Signal<readonly TAB[]>;
        readonly selectedId: Signal<Id | null>;
        readonly limit: Signal<number>;
    }

    /** Вкладка ряда с замеренной шириной: вход подбора ряда в режиме «Ещё». */
    export interface MoreSlot {
        readonly id: Id;
        readonly width: number;
        readonly pinned: boolean;
    }

    /** Замеры полосы: всё, из чего подбирается ряд. */
    export interface MoreFit {
        readonly slots: ReadonlyArray<MoreSlot>;
        readonly selectedId: Id | null;
        readonly moreWidth: number;
        readonly available: number;
        /** Сколько вкладок вместе с закреплёнными может стоять в ряду; без значения — сколько влезет. */
        readonly limit?: number;
    }

    /** Видимость стрелок прокрутки у краёв полосы. */
    export interface RestShown {
        readonly before: boolean;
        readonly after: boolean;
    }

    /** Раскладка: ряд в порядке показа и вкладки меню в порядке объявления. */
    export interface MoreLayout {
        readonly row: ReadonlyArray<Id>;
        readonly more: ReadonlyArray<Id>;
    }

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

    /**
     * Где стоит бейдж вкладки: `inline` — после подписи, как прежде; `overlay` — кружком над правым
     * верхним углом иконки, не меняя ширины вкладки. У вкладки без иконки бейдж всегда `inline`.
     */
    export type BadgePosition = 'inline' | 'overlay';

    /** Семантический цвет иконки/бейджа вкладки — маппится на палитру `rt-icon`. */
    export type TitleColor = IRtIcon.Color;
}
