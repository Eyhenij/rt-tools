import { IButton } from '../components/button/rt-button.model';
import { IRtDataTable } from '../components/data-table/rt-data-table.model';
import { IRtInput } from '../components/input/rt-input.model';
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

    /** Умолчания таблицы первого кита — и отдельной, и той, что стоит внутри списка. */
    export interface DataTable {
        /** Вид семьи. Умолчание кита — вид первого кита. */
        look?: IRtDataTable.Look;
    }

    /** Умолчания списка первого кита. */
    export interface DataList {
        /** Вид поля поиска. Умолчание кита — `fill`, как у поля Material первого кита. */
        appearance?: IRtInput.Appearance;

        /** Вид полей отбора. Умолчание кита — `outline`, как у первого кита. */
        filterAppearance?: IRtInput.Appearance;
    }

    /** Умолчания по узлам: каждое действует на одну семью и перебивает общее. */
    export interface Components {
        button?: Button;
        aside?: Aside;
        dataTable?: DataTable;
        dataList?: DataList;
    }

    /** Весь объект настроек целиком. */
    export interface Config {
        global?: Global;
        components?: Components;
    }
}
