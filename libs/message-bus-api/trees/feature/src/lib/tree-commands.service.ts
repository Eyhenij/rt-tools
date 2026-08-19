/**
 * Команды деревьев: заведение, выдача нового токена, отзыв и список.
 *
 * Токены операциями запроса не выдаются и не отзываются намеренно: токен дерева зовёт только
 * приём груза, а выдавать и отзывать его — дело команд, которые ходят к хранилищу напрямую.
 * Приглашение — другое дело: его выдаёт ещё и админка, и решает выдачу общая с ней функция, а
 * не своя копия проверок здесь.
 *
 * Служба ничего не печатает: она отвечает строками, а печатает их вызывающий. Так решение
 * проверяется вызовом, а токен не уходит в журнал вместе с выводом.
 */
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import {
    createTreeWithToken,
    findLiveInviteByName,
    findTreeByName,
    findTreeClash,
    IStoredInvite,
    ITreeClash,
    listInvites,
    listTrees,
    replaceTreeToken,
    revokeInvite,
    revokeTreeTokens,
} from '@rt/message-bus-api/trees/data-access';
import {
    EInviteRefusal,
    inviteIssuedLines,
    inviteListLines,
    inviteState,
    issueTreeToken,
    IRequestTree,
    ITreeAddCommand,
    ITreeCommandParse,
    ITreeCommandReport,
    ITreeInviteRow,
    parseTreeCommand,
    tokenIssuedLines,
    treeListLines,
    treeTokenHash,
} from '@rt/message-bus-api/trees/util';

import { IInviteOutcome, issueInvite } from './invite-issue';

/** Отказ команды: одна строка причины и признак, по которому вызывающий выберет код выхода. */
function refusal(cause: string): ITreeCommandReport {
    return { lines: [cause], failed: true };
}

/** Дерево в выводе команды: читаемым именем его зовёт владелец, признаком — груз. */
function named(tree: { name: string; slug: string }): string {
    return `«${tree.name}» (${tree.slug})`;
}

@Injectable()
export class TreeCommandsService {
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    /**
     * Разбор доводов и выполнение команды.
     *
     * Момент отзыва приезжает доводом, а не читается часами внутри: одна и та же команда
     * проверяется вызовом, а не подкруткой времени вокруг спеки.
     */
    public async run(argv: readonly string[], at: Date = new Date()): Promise<ITreeCommandReport> {
        const parse: ITreeCommandParse = parseTreeCommand(argv);

        if (!parse.command) {
            return refusal(parse.fault ?? 'команда не разобрана');
        }

        switch (parse.command.kind) {
            case 'add':
                return this.#add(parse.command);

            case 'token':
                return this.#issue(parse.command.name, at);

            case 'revoke':
                return this.#revoke(parse.command.name, at);

            case 'invite':
                return this.#invite(parse.command.name, at);

            case 'uninvite':
                return this.#uninvite(parse.command.name, at);

            case 'invites':
                return { lines: inviteListLines(this.#inviteRows(await listInvites(this.#prisma), at)), failed: false };

            default:
                return { lines: treeListLines(await listTrees(this.#prisma)), failed: false };
        }
    }

    /**
     * Заведение дерева с первым токеном.
     *
     * Занятое имя или признак отбивают команду целиком: прежнее дерево остаётся какое было, и
     * его токен цел — иначе повторная команда молча меняла бы вход соседу.
     */
    async #add(command: ITreeAddCommand): Promise<ITreeCommandReport> {
        const clash: ITreeClash | null = await findTreeClash(this.#prisma, command.name, command.slug);

        if (clash) {
            return refusal(`дерево ${named(clash)} уже заведено: его имя или признак заняты, прежний токен цел`);
        }

        const token: string = issueTreeToken();
        await createTreeWithToken(this.#prisma, { name: command.name, slug: command.slug, hash: treeTokenHash(token) });

        return { lines: tokenIssuedLines(`дерево заведено: ${named(command)}`, token), failed: false };
    }

    /** Новый токен взамен прежнего: у дерева годен один, и новый помечает прежний отозванным. */
    async #issue(name: string, at: Date): Promise<ITreeCommandReport> {
        const tree: IRequestTree | null = await findTreeByName(this.#prisma, name);

        if (!tree) {
            return refusal(`дерева с именем «${name}» нет`);
        }

        const token: string = issueTreeToken();
        await replaceTreeToken(this.#prisma, tree.id, treeTokenHash(token), at);

        return { lines: tokenIssuedLines(`новый токен дерева ${named(tree)}; прежний отозван`, token), failed: false };
    }

    /**
     * Выдача приглашения. Код печатается один раз: в хранилище уходит только его хеш.
     *
     * Занятое имя отбивает выдачу целиком — и заведённым деревом, и годным приглашением: два
     * дерева с одним именем ни завестись, ни различиться потом не смогут.
     */
    async #invite(name: string, at: Date): Promise<ITreeCommandReport> {
        const outcome: IInviteOutcome = await issueInvite(this.#prisma, name, at);

        if (outcome.refusal === EInviteRefusal.TreeExists && outcome.tree) {
            return refusal(`дерево ${named(outcome.tree)} уже заведено: приглашение ему не нужно, а имя занято`);
        }

        if (outcome.refusal === EInviteRefusal.InviteLive && outcome.live) {
            return refusal(
                `приглашение для «${name}» уже выдано и годно до ${outcome.live.expiresAt.toISOString()}; отозвать — tree:uninvite «${name}»`
            );
        }

        if (!outcome.issued) {
            return refusal(`приглашение для «${name}» не выдано: имя занято`);
        }

        return {
            lines: inviteIssuedLines(`приглашение выдано для «${name}»`, outcome.issued.code, outcome.issued.expiresAt),
            failed: false,
        };
    }

    /** Отзыв приглашения до того, как им воспользовались: погашенное отзывать уже нечего. */
    async #uninvite(name: string, at: Date): Promise<ITreeCommandReport> {
        const live: IStoredInvite | null = await findLiveInviteByName(this.#prisma, name);

        if (!live) {
            return refusal(`годного приглашения для «${name}» нет: оно погашено, отозвано или не выдавалось`);
        }

        await revokeInvite(this.#prisma, live.id, at);

        return { lines: [`приглашение для «${name}» отозвано`], failed: false };
    }

    /** Приглашения со состоянием на названный момент: просроченность решается им, а не часами. */
    #inviteRows(invites: readonly IStoredInvite[], at: Date): ITreeInviteRow[] {
        return invites.map((invite: IStoredInvite): ITreeInviteRow => ({
            name: invite.name,
            state: inviteState(invite, at),
            issuedAt: invite.issuedAt,
            expiresAt: invite.expiresAt,
            treeSlug: invite.treeSlug,
        }));
    }

    /** Отзыв токена. Записи дерева при этом не трогаются: приехавший груз читается по-прежнему. */
    async #revoke(name: string, at: Date): Promise<ITreeCommandReport> {
        const tree: IRequestTree | null = await findTreeByName(this.#prisma, name);

        if (!tree) {
            return refusal(`дерева с именем «${name}» нет`);
        }

        const revoked: number = await revokeTreeTokens(this.#prisma, tree.id, at);
        const said: string = revoked
            ? `токен дерева ${named(tree)} отозван; приехавший по нему груз читается по-прежнему`
            : `у дерева ${named(tree)} годного токена не было`;

        return { lines: [said], failed: false };
    }
}
