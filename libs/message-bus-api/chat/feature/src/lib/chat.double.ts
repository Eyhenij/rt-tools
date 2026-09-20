/**
 * Двойник хранилища чата: сайты, посетители, переписки и сообщения в памяти спеки.
 *
 * Правила, которые он держит сам, — те же, что держит хранилище: живой сайт ищется по ключу и
 * признаку включённости, посетитель опознаётся парой «сайт — признак», переписка заводится
 * вместе с посетителем одной сделкой. Подделывать их проверкой внутри спеки значило бы проверять
 * не то правило.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

/** Сайт в памяти спеки. */
export interface IDoubleSite {
    readonly id: string;
    readonly spaceId: string;
    readonly key: string;
    readonly origins: readonly string[];
    readonly enabled: boolean;
}

/** Посетитель в памяти спеки. */
export interface IDoubleVisitor {
    readonly id: string;
    readonly siteId: string;
    readonly token: string;
    readonly firstSeenAt: Date;
}

/** Переписка в памяти спеки. */
export interface IDoubleConversation {
    readonly id: string;
    readonly siteId: string;
    readonly visitorId: string;
    lastMessageAt: Date;
}

/** Сообщение в памяти спеки. */
export interface IDoubleMessage {
    readonly id: string;
    readonly conversationId: string;
    readonly side: string;
    readonly text: string;
    readonly takenAt: Date;
}

/** Ключ пары «сайт — признак посетителя», как его шлёт запрос. */
interface IVisitorKey {
    readonly siteId_token: { readonly siteId: string; readonly token: string };
}

export class ChatPrismaDouble {
    public readonly sites: IDoubleSite[] = [];
    public readonly visitors: IDoubleVisitor[] = [];
    public readonly conversations: IDoubleConversation[] = [];
    public readonly messages: IDoubleMessage[] = [];

    #issued: number = 0;

    public get chatSite(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return {
            findFirst: async (args: Record<string, unknown>): Promise<unknown> => this.#site(args) ?? null,
        };
    }

    public get chatVisitor(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return {
            findUnique: async (args: Record<string, unknown>): Promise<unknown> => this.#visitor(args),
            create: async (args: Record<string, unknown>): Promise<unknown> => this.#start(args),
        };
    }

    public get chatMessage(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return {
            create: async (args: Record<string, unknown>): Promise<unknown> => this.#append(args),
        };
    }

    public get chatConversation(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return {
            update: async (args: Record<string, unknown>): Promise<unknown> => this.#touch(args),
        };
    }

    /** Сделка хранилища: запросы уже посчитаны, здесь они только собираются вместе. */
    // eslint-disable-next-line sonarjs/function-name -- имя задано клиентом хранилища, а не этим двойником
    public async $transaction(operations: readonly Promise<unknown>[]): Promise<unknown[]> {
        return Promise.all(operations);
    }

    /** Этот же двойник как клиент хранилища: подстановки в дереве написаны руками. */
    public asPrisma(): PrismaService {
        // eslint-disable-next-line no-restricted-syntax -- двойник повторяет ту часть клиента хранилища, которую зовёт домен, и его типом не является
        return this as unknown as PrismaService;
    }

    #site(args: Record<string, unknown>): IDoubleSite | undefined {
        const where: { key: string; enabled: boolean } = args['where'] as { key: string; enabled: boolean };

        return this.sites.find((site: IDoubleSite): boolean => site.key === where.key && site.enabled === where.enabled);
    }

    #visitor(args: Record<string, unknown>): { id: string; conversations: IDoubleConversation[] } | null {
        const key: IVisitorKey['siteId_token'] = (args['where'] as IVisitorKey).siteId_token;
        const visitor: IDoubleVisitor | undefined = this.visitors.find(
            (row: IDoubleVisitor): boolean => row.siteId === key.siteId && row.token === key.token
        );

        if (!visitor) {
            return null;
        }

        return {
            id: visitor.id,
            conversations: this.conversations.filter((row: IDoubleConversation): boolean => row.visitorId === visitor.id),
        };
    }

    #start(args: Record<string, unknown>): { conversations: IDoubleConversation[] } {
        const data: Record<string, unknown> = args['data'] as Record<string, unknown>;
        const created: { create: { siteId: string; createdAt: Date; lastMessageAt: Date } } = data['conversations'] as {
            create: { siteId: string; createdAt: Date; lastMessageAt: Date };
        };

        this.#issued += 1;

        const visitor: IDoubleVisitor = {
            id: `visitor-${this.#issued}`,
            siteId: data['siteId'] as string,
            token: data['token'] as string,
            firstSeenAt: data['firstSeenAt'] as Date,
        };
        const conversation: IDoubleConversation = {
            id: `conversation-${this.#issued}`,
            siteId: created.create.siteId,
            visitorId: visitor.id,
            lastMessageAt: created.create.lastMessageAt,
        };

        this.visitors.push(visitor);
        this.conversations.push(conversation);

        return { conversations: [conversation] };
    }

    #append(args: Record<string, unknown>): IDoubleMessage {
        const data: Record<string, unknown> = args['data'] as Record<string, unknown>;

        this.#issued += 1;

        const message: IDoubleMessage = {
            id: `message-${this.#issued}`,
            conversationId: data['conversationId'] as string,
            side: data['side'] as string,
            text: data['text'] as string,
            takenAt: data['takenAt'] as Date,
        };

        this.messages.push(message);

        return message;
    }

    #touch(args: Record<string, unknown>): IDoubleConversation | null {
        const where: { id: string } = args['where'] as { id: string };
        const data: { lastMessageAt: Date } = args['data'] as { lastMessageAt: Date };
        const conversation: IDoubleConversation | undefined = this.conversations.find(
            (row: IDoubleConversation): boolean => row.id === where.id
        );

        if (!conversation) {
            return null;
        }

        conversation.lastMessageAt = data.lastMessageAt;

        return conversation;
    }
}
