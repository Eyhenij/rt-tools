import { Directive, inject, TemplateRef } from '@angular/core';

import { IRtDynamicSelector } from './rt-dynamic-selector.model';

/**
 * Маркеры частей строки списка выбранного — своим файлом, как у соседних семей.
 *
 * Маркер держит свой шаблон и о списке не знает ничего: селектор и поле списка строк читают его
 * среди своего содержимого и отдают шаблон списку. Удаление и ручка перетаскивания остаются
 * за китом.
 */

/**
 * Свои кнопки у каждой строки: стоят перед кнопкой удаления.
 *
 * @example
 * ```html
 * <rt-dynamic-selector keyExp="id" displayExp="name" [entities]="people()">
 *     <ng-template rtDynamicSelectorRowControls let-person>
 *         <rt-icon-button icon="info" ariaLabel="About" (clicked)="open(person)" />
 *     </ng-template>
 * </rt-dynamic-selector>
 * ```
 */
@Directive({
    selector: '[rtDynamicSelectorRowControls]',
})
export class RtDynamicSelectorRowControlsDirective<T = unknown> {
    public readonly templateRef: TemplateRef<IRtDynamicSelector.RowContext<T>> =
        inject<TemplateRef<IRtDynamicSelector.RowContext<T>>>(TemplateRef);
}

/** Своё название строки вместо подписи из поля записи. */
@Directive({
    selector: '[rtDynamicSelectorRowTitle]',
})
export class RtDynamicSelectorRowTitleDirective<T = unknown> {
    public readonly templateRef: TemplateRef<IRtDynamicSelector.RowContext<T>> =
        inject<TemplateRef<IRtDynamicSelector.RowContext<T>>>(TemplateRef);
}
