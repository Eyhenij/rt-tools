import { Pipe, PipeTransform } from '@angular/core';

import { messageHasAvailableActions } from './rt-chat-message-actions.logic';
import { IRtChat } from './rt-chat.model';

/**
 * Есть ли у реплики доступные действия — гейт кнопки «…» у неё.
 *
 * Pure-pipe: пересчитывается только при смене реплики или предиката, а не на каждом
 * цикле проверки. Значение приходит из контекста шаблона (реплика треда), поэтому
 * `computed()` здесь неприменим.
 */
@Pipe({ name: 'rtChatMessageHasActions' })
export class RtChatMessageHasActionsPipe implements PipeTransform {
    public transform(message: IRtChat.Message, hasActions: IRtChat.MessageActionsPredicate | null): boolean {
        return messageHasAvailableActions(message, hasActions);
    }
}
