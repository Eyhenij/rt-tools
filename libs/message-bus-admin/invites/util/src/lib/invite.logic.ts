/**
 * Решения раздела приглашений, вынесенные из экрана: ключ состояния и доступность отзыва.
 *
 * Чистые функции без каркаса: их зовут экран, маппер и спека, а проверяются они вызовом — без
 * `TestBed` и без подмены зависимостей.
 */
import { TAdminLabelKey } from '@rt/message-bus-admin/common/core/util';
import { ETreeInviteView } from '@rt/message-bus-common';

import { IInvite } from './invite.model';

/**
 * Каким ключом словаря названо состояние приглашения.
 *
 * Набор закрыт, и ветка на каждое его значение стоит здесь, а не в шаблоне: состояние приезжает
 * машинной строкой, и показанное как есть человек читает по-английски. Отдаётся ключ, а не текст:
 * текст, взятый здесь, приходит на языке той минуты и до перезагрузки остаётся прежним.
 */
export function inviteStateKey(state: ETreeInviteView): TAdminLabelKey {
    switch (state) {
        case ETreeInviteView.Redeemed:
            return 'inviteStateRedeemed';
        case ETreeInviteView.Expired:
            return 'inviteStateExpired';
        case ETreeInviteView.Revoked:
            return 'inviteStateRevoked';
        default:
            return 'inviteStateWaiting';
    }
}

/**
 * Отзывается только ждущее приглашение.
 *
 * Погашенное, просроченное и отозванное отзывать нечего — приём отвечает на них «не найдено», и
 * показанный пункт меню обещал бы человеку действие, которого нет.
 */
export function inviteCanRevoke(state: ETreeInviteView): boolean {
    return state === ETreeInviteView.Waiting;
}

/**
 * Есть ли у строки хоть одно доступное действие.
 *
 * Кнопка меню у строки, где отзывать нечего, открывала бы пустое меню. Судит предикат по строке,
 * а не по содержимому шаблона: спроецированный шаблон известен только после отрисовки.
 */
export function inviteRowHasActions(row: IInvite.Short.State): boolean {
    return row.canRevoke;
}
