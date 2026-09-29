import { Directive, inject, TemplateRef } from '@angular/core';

import { IRtChat } from './rt-chat.model';

/**
 * Контекст шаблона `[rtChatMessageActions]`: `$implicit` — реплика треда.
 */
export interface IRtChatMessageActionsContext {
    $implicit: IRtChat.Message;
}

/**
 * Захватывает `<ng-template rtChatMessageActions let-message>` — содержимое «…»-меню
 * действий у реплики. `rt-chat` рисует этот шаблон рядом с точечными действиями реплики,
 * прокидывая её через `$implicit`.
 *
 * Точечные действия остаются на месте: удаление, повтор отправки и скачивание общи для
 * любой переписки. Шаблон нужен тем действиям, которых кит не знает и знать не должен, —
 * без него потребителю оставалось ждать правки кита либо ставить кнопку над диалогом, то
 * есть не там, где читают реплику.
 *
 * Дженерика у контекста нет: тип реплики у переписки один, и type-carrier, который у
 * строки таблицы несёт тип строки, здесь не нужен.
 *
 * @example
 * ```html
 * <rt-chat [messages]="messages()" [messageHasActions]="canAct">
 *     <ng-template rtChatMessageActions let-message>
 *         <rt-menu-item icon="link" label="Скопировать ссылку" (selected)="copy(message)" />
 *     </ng-template>
 * </rt-chat>
 * ```
 */
@Directive({
    selector: 'ng-template[rtChatMessageActions]',
})
export class RtChatMessageActionsDirective {
    public readonly template: TemplateRef<IRtChatMessageActionsContext> = inject<TemplateRef<IRtChatMessageActionsContext>>(TemplateRef);

    /** Type-guard: сужает контекст шаблона до реплики при проверке шаблонов. */
    public static ngTemplateContextGuard(
        _directive: RtChatMessageActionsDirective,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
        context: unknown
    ): context is IRtChatMessageActionsContext {
        return true;
    }
}
