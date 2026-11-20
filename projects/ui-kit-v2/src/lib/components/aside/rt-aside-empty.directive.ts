import { Directive, inject, TemplateRef } from '@angular/core';

/**
 * Своя заглушка пустой панели: `<ng-template rtAsideEmpty>` внутри `rt-aside` встаёт в тело
 * панели вместо заглушки по умолчанию, пока у панели стоит вход `empty`.
 */
@Directive({
    selector: 'ng-template[rtAsideEmpty]',
})
export class RtAsideEmptyDirective {
    public readonly templateRef: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}
