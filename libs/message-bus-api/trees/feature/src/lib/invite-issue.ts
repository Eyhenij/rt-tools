/**
 * Выдача приглашения: одна проверка занятости имени и один выпуск кода на оба пути.
 *
 * Приглашение выдают двое — команда строки запуска и операция запроса админки, — и решают они
 * одно и то же: свободно ли имя, каким будет код и до какого часа он годен. Разойдясь, эти два
 * пути отличались бы тем, что одному имя занято, а другому нет.
 *
 * Код возвращается вызывающему и никуда больше не уходит: в хранилище ложится только его хеш,
 * а печатает код тот, кто позвал, — командой строкой вывода, операцией единственным ответом.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { createInvite, findLiveInviteByName, findTreeByName, IStoredInvite } from '@rt/message-bus-api/trees/data-access';
import { EInviteRefusal, inviteCodeHash, inviteExpiry, inviteState, IRequestTree, issueInviteCode } from '@rt/message-bus-api/trees/util';
import { ETreeInviteView } from '@rt/message-bus-common';

/** Выданное приглашение: код виден вызывающему один раз, срок нужен ему для сообщения. */
export interface IIssuedInvite {
    readonly name: string;
    readonly code: string;
    readonly issuedAt: Date;
    readonly expiresAt: Date;
}

/**
 * Чем кончилась выдача. Одно из двух полей пусто всегда: либо приглашение выдано, либо имя
 * занято, и тогда названо, чем именно.
 */
export interface IInviteOutcome {
    readonly issued: IIssuedInvite | null;
    readonly refusal: EInviteRefusal | null;
    /** Дерево, занявшее имя. Пусто, если отказ не о нём. */
    readonly tree: IRequestTree | null;
    /** Годное приглашение, занявшее имя. Пусто, если отказ не о нём. */
    readonly live: IStoredInvite | null;
}

/**
 * Выдача приглашения на названное имя.
 *
 * Занятое имя отбивает выдачу целиком — и заведённым деревом, и годным приглашением: два дерева
 * с одним именем ни завестись, ни различиться потом не смогут.
 *
 * Момент приходит доводом, а не читается часами внутри: им решается и годность занявшего
 * приглашения, и срок выдаваемого, и спека проверяет их вызовом.
 */
export async function issueInvite(prisma: PrismaService, name: string, at: Date): Promise<IInviteOutcome> {
    const tree: IRequestTree | null = await findTreeByName(prisma, name);

    if (tree) {
        return { tree, issued: null, refusal: EInviteRefusal.TreeExists, live: null };
    }

    const live: IStoredInvite | null = await findLiveInviteByName(prisma, name);

    if (live && inviteState(live, at) === ETreeInviteView.Waiting) {
        return { live, issued: null, refusal: EInviteRefusal.InviteLive, tree: null };
    }

    const code: string = issueInviteCode();
    const expiresAt: Date = inviteExpiry(at);

    await createInvite(prisma, { name, expiresAt, hash: inviteCodeHash(code) }, at);

    return { issued: { name, code, expiresAt, issuedAt: at }, live: null, refusal: null, tree: null };
}
