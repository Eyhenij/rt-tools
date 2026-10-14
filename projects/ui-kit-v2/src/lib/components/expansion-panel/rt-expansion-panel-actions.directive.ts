import { Directive } from '@angular/core';

/**
 * Действия в заголовке `rt-expansion-panel`: кнопки, флажки, меню. Встают в строку заголовка между
 * подписью и шевроном, но вне кнопки-переключателя — кнопка внутри кнопки недопустима, и нажатие
 * по действию не раскрывает панель.
 */
@Directive({
    selector: '[rtExpansionPanelActions]',
})
export class RtExpansionPanelActionsDirective {}
