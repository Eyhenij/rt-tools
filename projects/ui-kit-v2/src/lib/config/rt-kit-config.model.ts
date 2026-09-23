import { IButton } from '../components/button/rt-button.model';
import { ITheme } from '../platform/theme.model';

/**
 * Настройки кита: то, чем приложение задаёт вид на старте.
 *
 * Всё необязательное — и сам объект, и каждое его поле. Кит, которому не дали
 * ни одной настройки, рисует ровно то же, что рисовал до их появления.
 */
export namespace IRtKitConfig {
    /** Умолчания на весь кит. */
    export interface Global {
        /** Тема первой прорисовки, пока человек ничего не выбирал. Годится и «за машиной». */
        theme?: ITheme.Choice;
    }

    /** Умолчания кнопки. Названы только те виды, которые у кнопки уже есть входом. */
    export interface Button {
        appearance?: IButton.Appearance;
        size?: IButton.Size;
        rounded?: boolean;
    }

    /** Умолчания шторы. */
    export interface Aside {
        /**
         * Закрывает ли `Escape` открытую штору.
         *
         * Умолчание кита — закрывает. Приложению, которому это мешает, иначе
         * пришлось бы писать отказ на каждом вызове, и забытый вызов отличался
         * бы от остальных.
         */
        closeOnEscape?: boolean;
    }

    /** Умолчания по узлам: каждое действует на одну семью и перебивает общее. */
    export interface Components {
        button?: Button;
        aside?: Aside;
    }

    /** Весь объект настроек целиком. */
    export interface Config {
        global?: Global;
        components?: Components;
    }
}
