import { Directive, input, InputSignal, TemplateRef } from '@angular/core';

import { IRtSheetTemplateContext } from '@rt-tools/ui-kit-v2/bottom-sheet';

/**
 * Свои шапка и подвал шторки у компонента, который открывает список через `[rtPopover]` внутри
 * себя: поле выбора, выбор нескольких, подсказки, набор отборов, шапка столбца таблицы. Компонент
 * берёт директиву хост-директивой, и панель в его шаблоне читает шаблоны отсюда, когда своих
 * `rtPopoverSheetHeader` и `rtPopoverSheetFooter` ей не задано. На широком экране, где список
 * открыт у поля, шаблоны ничего не меняют.
 *
 * @example
 * ```html
 * <rt-select [sheetHeaderTemplate]="headerTpl" [sheetFooterTemplate]="footerTpl" />
 * <ng-template #headerTpl let-close>…</ng-template>
 * ```
 */
@Directive({
    selector: '[rtSheetTemplates]',
})
export class RtSheetTemplatesDirective {
    /** Своя шапка шторки: встаёт на место кнопки закрытия, заголовка и действия. */
    public readonly sheetHeaderTemplate: InputSignal<TemplateRef<IRtSheetTemplateContext> | null> =
        input<TemplateRef<IRtSheetTemplateContext> | null>(null);

    /** Свой подвал шторки: не прокручивается, стоит под списком. */
    public readonly sheetFooterTemplate: InputSignal<TemplateRef<IRtSheetTemplateContext> | null> =
        input<TemplateRef<IRtSheetTemplateContext> | null>(null);
}
