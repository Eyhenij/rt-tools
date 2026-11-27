import { Directive, inject, input, InputSignal, TemplateRef } from '@angular/core';

/** Что получает шаблон второго экрана «Ещё»: просьбу вернуться к первому экрану. */
export interface IRtSheetMoreContext {
    readonly $implicit: () => void;
    readonly back: () => void;
}

/**
 * Дополнительное шторки за кнопкой «⋮». Если шаблон есть, шторка ставит в шапке круглую кнопку «⋮»
 * левее значков `[sheetAction]`, а нажатие открывает второй экран той же шторки: слева шеврон «назад»,
 * заголовок `rtSheetMoreTitle` (без него — «Ещё» на языке кита), ниже — сам шаблон. Что и как стоит
 * на втором экране, решает приложение: шторка раскладку не задаёт.
 *
 * Это место по умолчанию для того, что не главное действие и не справка. Нужное на виду приложение
 * кладёт в те же места, что и прежде: в шапку `[sheetAction]`, в подвал `[sheetFooter]` или в тело.
 *
 * @example
 * ```html
 * <rt-bottom-sheet [open]="open()">
 *     <span sheetHeader>Фильтры</span>
 *     <ng-template rtSheetMore>
 *         <rt-toggle-switch label="Свободные" [formControl]="onlyFree" />
 *     </ng-template>
 *     <button sheetPrimary rtButton label="Применить"></button>
 * </rt-bottom-sheet>
 * ```
 */
@Directive({
    selector: 'ng-template[rtSheetMore]',
})
export class RtSheetMoreDirective {
    public readonly template: TemplateRef<IRtSheetMoreContext> = inject<TemplateRef<IRtSheetMoreContext>>(TemplateRef);

    /** Заголовок второго экрана; без него — «Ещё» на языке кита. */
    public readonly rtSheetMoreTitle: InputSignal<string | null> = input<string | null>(null);
}
