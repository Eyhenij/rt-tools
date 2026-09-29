import { Directive } from '@angular/core';

/** Селекторы приложения в панели действий: они стоят рядом с «отметить все». */
@Directive({
    selector: '[rtDataListToolbarSelectors]',
})
export class RtDataListToolbarSelectorsDirective {}

/** Действия приложения в панели: они стоят перед кнопками кита и отделены от них чертой. */
@Directive({
    selector: '[rtDataListToolbarActions]',
})
export class RtDataListToolbarActionsDirective {}
