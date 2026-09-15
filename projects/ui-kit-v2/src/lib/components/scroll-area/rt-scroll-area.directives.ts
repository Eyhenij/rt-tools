import { Directive, inject, TemplateRef } from '@angular/core';

/**
 * Маркеры частей области прокрутки — своим файлом, как у соседних семей.
 *
 * Каждый маркер держит свой шаблон и не знает об области ничего: область читает маркеры среди
 * своего содержимого и берёт у них шаблон. Часть, которую потребитель не объявил, для области
 * просто отсутствует — рисовать нечего.
 */

/**
 * Шапка области: стоит сверху и не прокручивается.
 *
 * @example
 * ```html
 * <rt-scroll-area>
 *     <ng-container *rtScrollAreaHeader>
 *         <h3>Заголовок</h3>
 *     </ng-container>
 * </rt-scroll-area>
 * ```
 */
@Directive({
    selector: '[rtScrollAreaHeader]',
})
export class RtScrollAreaHeaderDirective {
    public readonly templateRef: TemplateRef<void> = inject<TemplateRef<void>>(TemplateRef);
}

/** Тело области: единственная часть, которая прокручивается. */
@Directive({
    selector: '[rtScrollAreaContent]',
})
export class RtScrollAreaContentDirective {
    public readonly templateRef: TemplateRef<void> = inject<TemplateRef<void>>(TemplateRef);
}

/** Подвал области: стоит снизу и не прокручивается. */
@Directive({
    selector: '[rtScrollAreaFooter]',
})
export class RtScrollAreaFooterDirective {
    public readonly templateRef: TemplateRef<void> = inject<TemplateRef<void>>(TemplateRef);
}
