import { Pipe, PipeTransform } from '@angular/core';

import { ERtChatMessageStatus } from '../components/chat/rt-chat.model';

/**
 * Ключи подписей статусов для скринридера: сам индикатор — иконка, и без текста
 * различие «доставлено/прочитано» слышно не будет.
 *
 * Пайп отдаёт ключ, а переводит его `transloco` следующим звеном цепочки.
 * Готовый текст здесь застыл бы на языке, активном в момент загрузки модуля.
 */
const STATUS_KEYS: Readonly<Record<ERtChatMessageStatus, string>> = {
    [ERtChatMessageStatus.Sending]: 'rtKit.chatStatusSending',
    [ERtChatMessageStatus.Sent]: 'rtKit.chatStatusSent',
    [ERtChatMessageStatus.Read]: 'rtKit.chatStatusRead',
    [ERtChatMessageStatus.Failed]: 'rtKit.chatStatusFailed',
};

/** Ключ текстовой расшифровки иконки статуса сообщения. */
@Pipe({ name: 'rtChatStatusLabel' })
export class RtChatStatusLabelPipe implements PipeTransform {
    public transform(status: ERtChatMessageStatus): string {
        return STATUS_KEYS[status];
    }
}
