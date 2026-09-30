import { Directive, inject, TemplateRef } from '@angular/core';

/**
 * Помечает `<ng-template>` своего значка пункта меню. Кит ставит содержимое на место значка
 * `rt-menu-item__icon` его размером и цветом тона пункта — так приложение рисует значок, которого
 * нет ни в наборе кита, ни в перечне имён Material. Свой значок сильнее `icon` и `glyph`.
 *
 * ```html
 * <rt-menu-item label="Сделать активным">
 *     <ng-template rtMenuItemIcon><svg viewBox="0 0 24 24">…</svg></ng-template>
 * </rt-menu-item>
 * ```
 */
@Directive({
    selector: 'ng-template[rtMenuItemIcon]',
})
export class RtMenuItemIconDirective {
    public readonly templateRef: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}
