import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Содержимое слота `rtChatComposerBar` в показе: полоса правки ответа из кадра. Кит рисует только
 * слот, саму полосу приносит потребитель, поэтому она живёт рядом с историей, а не в пакете.
 */
@Component({
    selector: 'app-chat-edit-bar',
    templateUrl: './test-chat-edit-bar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestRtChatEditBarComponent {}
