import { inject, Directive, TemplateRef } from '@angular/core';

/** Отбор страницы. Шаблон один, а встаёт он в ряд, под кнопку «Ещё отборы» или в шторку телефона. */
@Directive({ selector: '[rtPageBarFilter]' })
export class RtPageBarFilterDirective {
    public readonly templateRef: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}

/** Поиск страницы: поле занимает свободное место ряда, а на телефоне встаёт в шторку над отборами. */
@Directive({ selector: '[rtPageBarSearch]' })
export class RtPageBarSearchDirective {
    public readonly templateRef: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}
