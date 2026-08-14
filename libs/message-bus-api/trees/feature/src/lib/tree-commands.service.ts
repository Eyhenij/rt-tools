/**
 * Команды деревьев: заведение, выдача нового токена, отзыв и список.
 *
 * Операциями запроса они не делаются намеренно: токен дерева зовёт только приём груза, а
 * выдавать и отзывать токены — дело команд, которые ходят к хранилищу напрямую. Токен дерева
 * поэтому не открывает ни одной из них — такой операции у приёмника нет вовсе.
 *
 * Служба ничего не печатает: она отвечает строками, а печатает их вызывающий. Так решение
 * проверяется вызовом, а токен не уходит в журнал вместе с выводом.
 */
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import {
    createTreeWithToken,
    findTreeByName,
    findTreeClash,
    ITreeClash,
    listTrees,
    replaceTreeToken,
    revokeTreeTokens,
} from '@rt/message-bus-api/trees/data-access';
import {
    IRequestTree,
    issueTreeToken,
    ITreeAddCommand,
    ITreeCommandParse,
    ITreeCommandReport,
    parseTreeCommand,
    tokenIssuedLines,
    treeListLines,
    treeTokenHash,
} from '@rt/message-bus-api/trees/util';

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
