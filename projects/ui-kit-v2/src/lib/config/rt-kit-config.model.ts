import { IButton } from '../components/button/rt-button.model';
import { IRtDataTable } from '../components/data-table/rt-data-table.model';
import { IRtDynamicSelector } from '../components/dynamic-selector/rt-dynamic-selector.model';
import { IRtIcon } from '../components/icon/rt-icon.model';
import { IRtInput } from '../components/input/rt-input.model';
import { TRtRadius } from '../components/radius/rt-radius.model';
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
        /** Шаг скругления всех кнопок, пока на кнопке не назван свой. */
        radius?: TRtRadius;
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

    /**
     * Умолчания поля выбора записей и поля строк. Оба читают значки, вид кнопки приглашения и перенос
     * названия; поиск и пустой результат есть только у поля выбора записей.
     */
    export interface DynamicSelector {
        /** Значок кнопки приглашения. Умолчание кита — кнопка без значка. */
        invitationButtonIcon?: IRtIcon.Name | null;
        /** Вид кнопки приглашения. Умолчание кита — `outlined`. */
        invitationButtonAppearance?: IButton.Appearance;
        /** Значок кнопки «Очистить список». Умолчание кита — `close`. */
        clearIcon?: IRtIcon.Name;
        /** Вид поля поиска в окне выбора. Умолчание кита — `outline`. */
        searchAppearance?: IRtInput.Appearance;
        /** Подпись пустого результата поиска. Умолчание кита — пустая строка, то есть подпись кита. */
        emptyResultsText?: string;
        /** Переносится ли название строки списка. Умолчание кита — переносится. */
        titleWrap?: boolean;
        /** Шаг скругления поля поиска в окне выбора. Умолчание кита — скругление самого поля. */
        searchRadius?: TRtRadius | null;
        /** Выделять ли в подписи пункта символы, совпавшие с поиском. Умолчание кита — не выделять. */
        highlightSearch?: boolean;
        /** Подпись кнопки применения в окне выбора. Умолчание кита — пустая строка, то есть подпись кита. */
        applyLabel?: string;
        /** Регистр подписи кнопки применения. Умолчание кита — `none`, подпись как есть. */
        applyLabelCase?: IRtDynamicSelector.LabelCase;
    }

    /** Умолчания по узлам: каждое действует на одну семью и перебивает общее. */
    export interface Components {
        button?: Button;
        aside?: Aside;
        dataTable?: DataTable;
        dataList?: DataList;
        dynamicSelector?: DynamicSelector;
    }

    /** Весь объект настроек целиком. */
    export interface Config {
        global?: Global;
        components?: Components;
    }
}
