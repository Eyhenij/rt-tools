import { inject, Directive, TemplateRef } from '@angular/core';

/**
 * Подпись заголовка колонки: `<ng-template rtTableSortHeaderContent>`. Рисуется один раз: внутри
 * кнопки сортировки, когда колонка сортируется, и простым содержимым иначе.
 */
@Directive({ selector: 'ng-template[rtTableSortHeaderContent]' })
export class RtTableSortHeaderContentDirective {
    public readonly template: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}
