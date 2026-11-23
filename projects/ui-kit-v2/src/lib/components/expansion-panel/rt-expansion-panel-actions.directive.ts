import { Directive, inject, TemplateRef } from '@angular/core';

import { rtSlotTemplate } from '@rt-tools/ui-kit-v2/core';

import { RT_EXPANSION_PANEL_OWNER } from './rt-expansion-panel-group.token';

/**
 * Шаблон действий в заголовке `rt-expansion-panel`: кнопки, флажки, меню —
 * `<ng-template rtExpansionPanelActions>`. Встают в строку заголовка между подписью и шевроном, но
 * вне кнопки-переключателя — кнопка внутри кнопки недопустима, и нажатие по действию не раскрывает
 * панель. Несколько шаблонов встают все, в порядке записи.
 */
@Directive({
    selector: '[rtExpansionPanelActions]',
})
export class RtExpansionPanelActionsDirective {
    public readonly template: TemplateRef<unknown> | null = rtSlotTemplate('rt-expansion-panel', 'rtExpansionPanelActions');
    /** Панель, которой принадлежат действия: ближайшая над узлом. */
    public readonly owner: object | null = inject(RT_EXPANSION_PANEL_OWNER, { optional: true });
}
