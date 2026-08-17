/**
 * Решения раздела приглашений, вынесенные из экрана: подпись состояния и доступность отзыва.
 *
 * Чистые функции без каркаса: их зовут маппер и спека, а проверяются они вызовом — без
 * `TestBed` и без подмены зависимостей.
 */
import { adminLabel } from '@rt/message-bus-admin/common/core/util';
import { ETreeInviteView } from '@rt/message-bus-common';

import { IInvite } from './invite.model';

/**
 * Состояние приглашения по-русски.
 *
 * Набор закрыт, и ветка на каждое его значение стоит здесь, а не в шаблоне: состояние приезжает
 * машинной строкой, и показанное как есть человек читает по-английски.
 */
export function inviteStateLabel(state: ETreeInviteView): string {
    switch (state) {
        case ETreeInviteView.Redeemed:
            return adminLabel('inviteStateRedeemed');
        case ETreeInviteView.Expired:
            return adminLabel('inviteStateExpired');
        case ETreeInviteView.Revoked:
            return adminLabel('inviteStateRevoked');
        default:
            return adminLabel('inviteStateWaiting');
    }
}

/**
 * Вопрос перед отзывом.
 *
 * Называет последствие, а не спрашивает «вы уверены»: отозванное приглашение не возвращается, и
 * дереву понадобится новое — это и решает человек, отвечая.
 */
export function inviteRevokeQuestion(name: string): string {
    return adminLabel('inviteRevokeQuestion', { name });
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
