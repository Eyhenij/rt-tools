import { inject, Directive, TemplateRef } from '@angular/core';

/**
 * Тело `rt-aside`: `<ng-template rtAsideContent>`. Создаётся, только пока панель не пуста: пустая
 * панель показывает заглушку, а форму тела не строит. Шапка и подвал остаются элементами
 * `rt-aside-header` и `rt-aside-footer`.
 */
@Directive({ selector: 'ng-template[rtAsideContent]' })
export class RtAsideContentDirective {
    public readonly template: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}
