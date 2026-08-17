/**
 * Что команды деревьев печатают.
 *
 * Строки собираются здесь, а не там, где ходят к хранилищу: печать — это решение, и оно
 * проверяется вызовом. Токен при этом остаётся доводом функции и в хранилище не попадает — туда
 * уходит только его хеш.
 */
import { ETreeInviteView } from '@rt/message-bus-common';

/** Приглашение в списке: сам код сюда не попадает — в хранилище его нет. */
export interface ITreeInviteRow {
    readonly name: string;
    readonly state: ETreeInviteView;
    readonly issuedAt: Date;
    readonly expiresAt: Date;
    /** Признак дерева, заведённого этим приглашением; пусто — приглашение не погашено. */
    readonly treeSlug: string | null;
}

/** Состояние приглашения словом: список читает человек, а не разбирает машина. */
const INVITE_STATE_WORDS: Readonly<Record<ETreeInviteView, string>> = {
    [ETreeInviteView.Waiting]: 'ждёт',
    [ETreeInviteView.Redeemed]: 'погашено',
    [ETreeInviteView.Expired]: 'просрочено',
    [ETreeInviteView.Revoked]: 'отозвано',
};

/** Дерево в списке: чем оно называется и когда отчитывалось в последний раз. */
export interface ITreeSummaryRow {
    readonly slug: string;
    readonly name: string;
    /** Есть ли у дерева годный токен. Отозванный не удаляется: груз по нему читается. */
    readonly tokenLive: boolean;
    /** Время последнего прогона. Пусто — дерево не отчитывалось ни разу. */
    readonly ranAt: Date | null;
}

/** День без часов: список читает человек, и час прогона ему ничего не говорит. */
function day(at: Date): string {
    return at.toISOString().slice(0, 'YYYY-MM-DD'.length);
}

/**
 * Токен, напечатанный один раз.
 *
 * Второй раз показать его неоткуда: в хранилище лежит хеш, и потерянный токен не
 * восстанавливается, а замещается новым.
 */
export function tokenIssuedLines(headline: string, token: string): string[] {
    return [headline, 'токен печатается один раз — второй раз показать его неоткуда:', token];
}

/**
 * Код приглашения, напечатанный один раз.
 *
 * Второй раз показать его неоткуда — в хранилище лежит только хеш, — поэтому рядом сразу стоит
 * команда, которой дерево себя заводит: код и способ им воспользоваться передаются вместе.
 */
export function inviteIssuedLines(headline: string, code: string, until: Date): string[] {
    return [
        headline,
        `годно до ${day(until)}; код печатается один раз — второй раз показать его неоткуда:`,
        code,
        `дерево заводит себя командой: npx agent-kit enroll --code ${code}`,
    ];
}

/**
 * Список приглашений: имя будущего дерева, состояние и сроки.
 *
 * Погашенное из списка не выпадает: по нему читается, когда и какое дерево завелось.
 */
export function inviteListLines(rows: readonly ITreeInviteRow[]): string[] {
    if (rows.length === 0) {
        return ['приглашений нет ни одного', 'выдать: tree:invite <имя>'];
    }

    return [
        `приглашений: ${rows.length}`,
        ...rows.map((row: ITreeInviteRow): string => {
            const tail: string = row.treeSlug ? `, дерево ${row.treeSlug}` : '';

            return `  ${row.name} — ${INVITE_STATE_WORDS[row.state]}, выдано ${day(row.issuedAt)}, годно до ${day(row.expiresAt)}${tail}`;
        }),
    ];
}

/**
 * Список деревьев: имя, признак, состояние токена и день последнего прогона.
 *
 * Дерево с отозванным токеном из списка не выпадает: его записи не удалены, и по списку видно,
 * кем они присланы.
 */
export function treeListLines(rows: readonly ITreeSummaryRow[]): string[] {
    if (rows.length === 0) {
        return ['деревьев не заведено ни одного'];
    }

    return [
        `деревьев заведено: ${rows.length}`,
        ...rows.map((row: ITreeSummaryRow): string => {
            const token: string = row.tokenLive ? 'токен годен' : 'токен отозван';
            const ran: string = row.ranAt ? `последний прогон ${day(row.ranAt)}` : 'прогонов не было';

            return `  ${row.name} (${row.slug}) — ${token}, ${ran}`;
        }),
    ];
}
