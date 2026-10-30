import { Directive, inject, TemplateRef } from '@angular/core';

import { RT_EXPANSION_PANEL_OWNER } from './rt-expansion-panel-group.token';

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
    /** Панель, которой принадлежит тело: ближайшая над шаблоном, сколько бы обёрток ни стояло между. */
    public readonly owner: object | null = inject(RT_EXPANSION_PANEL_OWNER, { optional: true });
}
