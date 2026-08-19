/**
 * Перевод приглашения из ответа приёмника в то, чем пользуется экран.
 *
 * Времена приезжают строкой и становятся временем здесь, а не в каждой перерисовке. Здесь же
 * считается доступность отзыва: она лежит полем строки, и посчитанная в шаблоне пересчитывалась
 * бы на каждой проверке.
 *
 * Состояние сверяется с набором явно: `getAsType` умолчания не принимает, а значение вне набора
 * возвращает строкой `'unknown'` — на экране это была бы строка состояния, которого нет.
 */
import { ETreeInviteView } from '@rt/message-bus-common';
import { BaseMapper } from '@rt-tools/utils';

import { inviteCanRevoke, inviteRevokeQuestion, inviteStateLabel } from './invite.logic';
import { IInvite } from './invite.model';

/** Состояния, объявленные набором: пришедшее не из него считается ждущим — таково умолчание. */
const STATES: readonly ETreeInviteView[] = Object.values(ETreeInviteView);

/** Состояние из ответа. Пришедшее вне набора приводится к ждущему, а не роняет список. */
function stateOf(raw: string): ETreeInviteView {
    const found: ETreeInviteView | undefined = STATES.find((state: ETreeInviteView): boolean => state === raw);

    return found ?? ETreeInviteView.Waiting;
}

/** Строка списка приглашений. */
export class InviteShortMapper extends BaseMapper<IInvite.Short.State> {
    public override mapFrom(data: IInvite.Short.Api): IInvite.Short.State {
        const state: ETreeInviteView = stateOf(this.typeCast.getAsString(data.state));
        const name: string = this.typeCast.getAsString(data.name);

        return {
            name,
            state,
            stateLabel: inviteStateLabel(state),
            issuedAt: new Date(this.typeCast.getAsString(data.issuedAt)),
            expiresAt: new Date(this.typeCast.getAsString(data.expiresAt)),
            // Пустая строка вместо пустоты: у непогашенного приглашения дерева ещё нет, и ячейка
            // показывает пустое место, а не слово «null».
            treeSlug: this.typeCast.getAsString(data.treeSlug, ''),
            canRevoke: inviteCanRevoke(state),
            revokeQuestion: inviteRevokeQuestion(name),
        };
    }
}

/**
 * Выданное приглашение.
 *
 * Срок становится временем здесь, как и у строки списка. Код переносится как есть: показать его
 * второй раз неоткуда, и трогать его переводом нечем.
 */
export class InviteIssuedMapper extends BaseMapper<IInvite.Issued.State> {
    public override mapFrom(data: IInvite.Issued.Api): IInvite.Issued.State {
        return {
            name: this.typeCast.getAsString(data.name),
            code: this.typeCast.getAsString(data.code),
            expiresAt: new Date(this.typeCast.getAsString(data.expiresAt)),
        };
    }
}
