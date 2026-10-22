import { Directive, inject } from '@angular/core';

import { RT_EXPANSION_PANEL_OWNER } from './rt-expansion-panel-group.token';

/**
 * Действия в заголовке `rt-expansion-panel`: кнопки, флажки, меню. Встают в строку заголовка между
 * подписью и шевроном, но вне кнопки-переключателя — кнопка внутри кнопки недопустима, и нажатие
 * по действию не раскрывает панель.
 */
@Directive({
    selector: '[rtExpansionPanelActions]',
})
export class RtExpansionPanelActionsDirective {
    /** Панель, которой принадлежат действия: ближайшая над узлом. */
    public readonly owner: object | null = inject(RT_EXPANSION_PANEL_OWNER, { optional: true });
}
