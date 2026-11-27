import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
    TemplateRef,
} from '@angular/core';

import { IRtSheetTemplateContext } from '@rt-tools/ui-kit-v2/bottom-sheet';
import { RtSheetTemplatesDirective } from './rt-sheet-templates.directive';

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
 *     [rtPopoverSheetFull]="longForm()"
 *     [rtPopoverSheetAction]="doneTpl"
 *     [rtPopoverSheetUnsaved]="changed()"
 *     (rtPopoverSheetApply)="apply()"></button>
 * ```
 */
@Directive({
    selector: '[rtPopoverSheetOptions]',
})
export class RtPopoverSheetOptionsDirective {
    /** Шаблоны компонента, в чьём шаблоне стоит панель: его входы `sheetHeaderTemplate` и `sheetFooterTemplate`. */
    readonly #hostTemplates: RtSheetTemplatesDirective | null = inject(RtSheetTemplatesDirective, { optional: true, host: true });

    /** Своя шапка шторки: шаблон панели, а без него — шаблон компонента вокруг неё. */
    public readonly header: Signal<TemplateRef<IRtSheetTemplateContext> | null> = computed(
        (): TemplateRef<IRtSheetTemplateContext> | null => this.rtPopoverSheetHeader() ?? this.#hostTemplates?.sheetHeaderTemplate() ?? null
    );

    /** Свой подвал шторки: шаблон панели, а без него — шаблон компонента вокруг неё. */
    public readonly footer: Signal<TemplateRef<IRtSheetTemplateContext> | null> = computed(
        (): TemplateRef<IRtSheetTemplateContext> | null => this.rtPopoverSheetFooter() ?? this.#hostTemplates?.sheetFooterTemplate() ?? null
    );

    /** Своя шапка шторки: шаблон встаёт на место кнопки закрытия, заголовка и действия. */
    public readonly rtPopoverSheetHeader: InputSignal<TemplateRef<IRtSheetTemplateContext> | null> =
        input<TemplateRef<IRtSheetTemplateContext> | null>(null);

    /** Свой подвал шторки: шаблон стоит под панелью и не прокручивается. */
    public readonly rtPopoverSheetFooter: InputSignal<TemplateRef<IRtSheetTemplateContext> | null> =
        input<TemplateRef<IRtSheetTemplateContext> | null>(null);

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
