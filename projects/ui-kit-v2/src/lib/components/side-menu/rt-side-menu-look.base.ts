import { booleanAttribute, Directive, input, InputSignal, InputSignalWithTransform } from '@angular/core';

import { IRtInput } from '@rt-tools/ui-kit-v2/core';

/**
 * Входы вида бокового меню: подписи и заливка значков, поле поиска, подсказка прокрутки панели. Ни
 * один не меняет поведения — по ним приложение даёт меню вид первого кита, а без них меню рисуется
 * как раньше. Вынесены из класса меню, чтобы тот оставался в пределе длины файла.
 */
@Directive()
export abstract class RtSideMenuLookBase {
    /** Подсказки строк подменю — у подписей и у кнопок строк. Доступные имена остаются. */
    public readonly subMenuTooltipsShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    /**
     * Подписи под значками полосы. Выключено — имя пункта уходит в подсказку справа от значка, а
     * подсказка подчиняется `subMenuTooltipsShown`; доступное имя пункт держит всегда.
     */
    public readonly railTitlesShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    /** Залитые значки полосы — залитый рисунок материального набора и заливка шрифта лигатуры. */
    public readonly railIconFill: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    /** Залитые значки строк и папок подменю — так же, как `railIconFill` у полосы. */
    public readonly subItemIconFill: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    /** Подсказка прокрутки внизу панели подменю, как у полосы: длинный список не обрывается молча. */
    public readonly panelScrollHintShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    /** Размер поля поиска подменю — ступень `rt-input`. */
    public readonly searchSize: InputSignal<IRtInput.Size> = input<IRtInput.Size>('sm');
    /** Вид поля поиска подменю — вид `rt-input`. */
    public readonly searchAppearance: InputSignal<IRtInput.Appearance> = input<IRtInput.Appearance>('outline');
}
