import { Directive, inject, TemplateRef } from '@angular/core';

import { IRtLoadError } from '@rt-tools/ui-kit-v2/empty-state';
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

/**
 * Свой вид пустого результата в окне выбора: `<ng-template rtDynamicSelectorEmpty let-query>` встаёт
 * вместо заглушки «ничего не найдено». Сильнее входа `emptyResultsText`; в контексте — строка поиска.
 */
@Directive({
    selector: 'ng-template[rtDynamicSelectorEmpty]',
})
export class RtDynamicSelectorEmptyDirective {
    public readonly templateRef: TemplateRef<{ $implicit: string }> = inject<TemplateRef<{ $implicit: string }>>(TemplateRef);

    /** Type-guard: сужает контекст шаблона до строки поиска. */
    public static ngTemplateContextGuard(
        _directive: RtDynamicSelectorEmptyDirective,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
        context: unknown
    ): context is { $implicit: string } {
        return true;
    }
}

/**
 * Свой вид ошибки загрузки в окне выбора: `<ng-template rtDynamicSelectorError let-error let-retry="retry">`
 * встаёт вместо записей; в контексте текст ошибки и повтор загрузки.
 */
@Directive({
    selector: 'ng-template[rtDynamicSelectorError]',
})
export class RtDynamicSelectorErrorDirective {
    public readonly templateRef: TemplateRef<IRtLoadError.Context> = inject<TemplateRef<IRtLoadError.Context>>(TemplateRef);

    /** Type-guard: сужает контекст шаблона до текста ошибки и повтора. */
    public static ngTemplateContextGuard(
        _directive: RtDynamicSelectorErrorDirective,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
        context: unknown
    ): context is IRtLoadError.Context {
        return true;
    }
}
