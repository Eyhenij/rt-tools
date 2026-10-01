import { Directive, inject, TemplateRef } from '@angular/core';

/**
 * Тело `rt-expansion-panel`, собираемое лениво: ставится на `<ng-template>` внутри панели, и его
 * содержимое создаётся при раскрытии и уходит после сворачивания. Сворачивание при этом доигрывает
 * движение до конца: тело уходит вместе со своим содержимым, а не пустым.
 */
@Directive({
    selector: 'ng-template[rtExpansionPanelContent]',
})
export class RtExpansionPanelContentDirective {
    public readonly templateRef: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}
