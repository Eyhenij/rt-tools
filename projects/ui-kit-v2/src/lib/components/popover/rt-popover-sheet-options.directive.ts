import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    Directive,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    TemplateRef,
} from '@angular/core';

/**
 * Входы нижней шторки у `[rtPopover]`: высота, действие в шапке и неприменённый выбор. Директива
 * панели берёт их хост-директивой, и в разметке они стоят рядом с `rtPopoverSheet`. На широком
 * экране, где панель открыта у триггера, они ничего не меняют. Шторка читает их, пока открыта:
 * высота меняется на лету, когда поиск внутри неё получает и теряет фокус.
 *
 * @example
 * ```html
 * <button
 *     [rtPopover]="panelTpl"
 *     [rtPopoverSheet]="true"
 *     [rtPopoverSheetFull]="searchFocused()"
 *     [rtPopoverSheetAction]="doneTpl"
 *     [rtPopoverSheetUnsaved]="changed()"
 *     (rtPopoverSheetApply)="apply()"></button>
 * ```
 */
@Directive({
    selector: '[rtPopoverSheetOptions]',
})
export class RtPopoverSheetOptionsDirective {
    /** Шторка во всю высоту экрана: для содержимого, в котором человек печатает. */
    public readonly rtPopoverSheetFull: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Действие справа в шапке шторки: шаблон с кнопкой «Готово» или «Применить». Пусто — действия нет. */
    public readonly rtPopoverSheetAction: InputSignal<TemplateRef<unknown> | null> = input<TemplateRef<unknown> | null>(null);

    /**
     * Выбор в шторке изменён и не применён: на просьбу закрыть — кнопкой, подложкой, свайпом или
     * Escape — шторка сначала спрашивает, применить ли его.
     */
    public readonly rtPopoverSheetUnsaved: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Человек ответил на вопрос шторки «Применить»: выбор нужно применить, следом шторка закроется. */
    public readonly rtPopoverSheetApply: OutputEmitterRef<void> = output<void>();
}
