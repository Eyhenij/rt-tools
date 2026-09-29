import { Directive } from '@angular/core';

/** Шапка бокового меню: над полосой пунктов. */
@Directive({
    selector: '[rtSideMenuHeader]',
})
export class RtSideMenuHeaderDirective {}

/** Подвал бокового меню: под полосой пунктов. */
@Directive({
    selector: '[rtSideMenuFooter]',
})
export class RtSideMenuFooterDirective {}
