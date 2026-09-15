import { Directive, inject, TemplateRef } from '@angular/core';

/**
 * Маркеры частей панели инструментов — своим файлом, как у соседних семей.
 *
 * Каждый маркер держит свой шаблон и о списке не знает ничего: список читает маркеры среди своего
 * содержимого и берёт у них шаблон. Часть, которую потребитель не объявил, для списка просто
 * отсутствует.
 */

/**
 * Левая сторона панели: то, чем человек отбирает записи.
 *
 * @example
 * ```html
 * <rt-dynamic-list>
 *     <ng-container *rtDynamicListSelectors>
 *         <rt-select [options]="stages()" />
 *     </ng-container>
 * </rt-dynamic-list>
 * ```
 */
@Directive({
    selector: '[rtDynamicListSelectors]',
})
export class RtDynamicListSelectorsDirective {
    public readonly templateRef: TemplateRef<void> = inject<TemplateRef<void>>(TemplateRef);
}

/** Правая сторона панели: действия над разделом. Поле поиска стоит после них и остаётся за семьёй. */
@Directive({
    selector: '[rtDynamicListActions]',
})
export class RtDynamicListActionsDirective {
    public readonly templateRef: TemplateRef<void> = inject<TemplateRef<void>>(TemplateRef);
}
