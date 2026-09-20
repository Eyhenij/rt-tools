/**
 * Двойник хранилища чата: сайты, посетители, переписки и сообщения в памяти спеки.
 *
 * Правила, которые он держит сам, — те же, что держит хранилище: живой сайт ищется по ключу и
 * признаку включённости, посетитель опознаётся парой «сайт — признак», переписка заводится
 * вместе с посетителем одной сделкой. Подделывать их проверкой внутри спеки значило бы проверять
 * не то правило.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

/** Сайт в памяти спеки. Приветствие и часы ответа читает виджет. */
export interface IDoubleSite {
    readonly id: string;
    readonly spaceId: string;
    readonly key: string;
    readonly origins: readonly string[];
    readonly enabled: boolean;
    readonly greeting?: string;
    readonly answerFrom?: number;
    readonly answerTo?: number;
    readonly timeZone?: string;
    readonly hookUrl?: string;
    readonly hookSecret?: string;
    readonly answerWithin?: number;
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
    state: string;
    /** Минута последнего будильника. Пусто — переписка не будила никого ни разу. */
    wokeAt?: Date | null;
}

/** Оператор и сайт, за который он отвечает. */
export interface IDoubleOperatorSite {
    readonly accountId: string;
    readonly siteId: string;
}

/** Сообщение в памяти спеки. */
export interface IDoubleMessage {
    readonly id: string;
    readonly conversationId: string;
    readonly side: string;
    readonly text: string;
    readonly takenAt: Date;
}

/** Вызов наружу в памяти спеки: по нему видно, что ушло и чем кончилось. */
export interface IDoubleHookCall {
    readonly id: string;
    readonly siteId: string;
    readonly conversationId: string;
    readonly kind: string;
    readonly body: string;
    attempts: number;
    lastStatus: number | null;
    lastFault: string;
    deliveredAt: Date | null;
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
    public readonly operatorSites: IDoubleOperatorSite[] = [];
    public readonly hookCalls: IDoubleHookCall[] = [];

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
            findMany: async (args: Record<string, unknown>): Promise<unknown> => this.#messagesPage(args),
            count: async (args: Record<string, unknown>): Promise<number> => this.#messagesOf(args).length,
        };
    }

    public get chatHookCall(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return {
            create: async (args: Record<string, unknown>): Promise<unknown> => this.#recordCall(args),
            update: async (args: Record<string, unknown>): Promise<unknown> => this.#markCall(args),
        };
    }

    public get chatOperatorSite(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return {
            findMany: async (args: Record<string, unknown>): Promise<unknown> => this.#operatorSites(args),
        };
    }

    public get chatConversation(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return {
            update: async (args: Record<string, unknown>): Promise<unknown> => this.#touch(args),
            findMany: async (args: Record<string, unknown>): Promise<unknown> => this.#conversationsFound(args),
            count: async (args: Record<string, unknown>): Promise<number> => this.#conversationsOf(args).length,
            findFirst: async (args: Record<string, unknown>): Promise<unknown> => this.#oneConversation(args),
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
        const where: { id?: string; key?: string; enabled?: boolean } = args['where'] as {
            id?: string;
            key?: string;
            enabled?: boolean;
        };
        /*
         * Площадку спрашивают двумя путями: приём — по ключу и признаку включённости, отправка
         * вызова наружу — по признаку записи. Выключенность там не спрашивается: разговор,
         * который уже идёт, выключение площадки не отменяет.
         */
        const found: IDoubleSite | undefined = where.id
            ? this.sites.find((site: IDoubleSite): boolean => site.id === where.id)
            : this.sites.find((site: IDoubleSite): boolean => site.key === where.key && site.enabled === where.enabled);

        // Умолчания хранилища: площадка без приветствия, часов и вызовов наружу — законное состояние
        return found && this.#withSiteDefaults(found);
    }

    /** Умолчания записи площадки: то же, что подставляет хранилище на старых записях. */
    #withSiteDefaults(site: IDoubleSite): IDoubleSite {
        return {
            greeting: '',
            answerFrom: 0,
            answerTo: 0,
            timeZone: '',
            hookUrl: '',
            hookSecret: '',
            answerWithin: 0,
            ...site,
        };
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
            state: 'live',
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
        const data: { lastMessageAt?: Date; state?: string; wokeAt?: Date | null } = args['data'] as {
            lastMessageAt?: Date;
            state?: string;
            wokeAt?: Date | null;
        };
        const conversation: IDoubleConversation | undefined = this.conversations.find(
            (row: IDoubleConversation): boolean => row.id === where.id
        );

        if (!conversation) {
            return null;
        }

        if (data.lastMessageAt) {
            conversation.lastMessageAt = data.lastMessageAt;
        }

        if (data.state) {
            conversation.state = data.state;
        }

        if ('wokeAt' in data) {
            conversation.wokeAt = data.wokeAt ?? null;
        }

        return conversation;
    }

    /** Запись отправки заводится до первой попытки: по ней видно и то, что не ушло. */
    #recordCall(args: Record<string, unknown>): { id: string; attempts: number } {
        const data: Record<string, unknown> = args['data'] as Record<string, unknown>;

        this.#issued += 1;

        const call: IDoubleHookCall = {
            id: `hook-call-${this.#issued}`,
            siteId: data['siteId'] as string,
            conversationId: data['conversationId'] as string,
            kind: data['kind'] as string,
            body: data['body'] as string,
            attempts: 0,
            lastStatus: null,
            lastFault: '',
            deliveredAt: null,
        };

        this.hookCalls.push(call);

        return { id: call.id, attempts: call.attempts };
    }

    /** Исход попытки: сколько их было, чем ответили и приняли ли вызов. */
    #markCall(args: Record<string, unknown>): IDoubleHookCall | null {
        const where: { id: string } = args['where'] as { id: string };
        const data: Record<string, unknown> = args['data'] as Record<string, unknown>;
        const call: IDoubleHookCall | undefined = this.hookCalls.find((row: IDoubleHookCall): boolean => row.id === where.id);

        if (!call) {
            return null;
        }

        call.attempts = data['attempts'] as number;
        call.lastStatus = (data['lastStatus'] as number | null) ?? null;
        call.lastFault = data['lastFault'] as string;

        if (data['deliveredAt']) {
            call.deliveredAt = data['deliveredAt'] as Date;
        }

        return call;
    }

    /** Сайты оператора по признаку учётной записи, как их спрашивает чтение. */
    #operatorSites(args: Record<string, unknown>): { siteId: string }[] {
        const where: { operator: { accountId: string } } = args['where'] as { operator: { accountId: string } };

        return this.operatorSites
            .filter((row: IDoubleOperatorSite): boolean => row.accountId === where.operator.accountId)
            .map((row: IDoubleOperatorSite): { siteId: string } => ({ siteId: row.siteId }));
    }

    /**
     * Два чтения списка переписок разведены по отбору: панель спрашивает сайты набором, будильник
     * — площадки с условленным временем. Отбор называет запрос, и двойник его же и читает.
     */
    #conversationsFound(args: Record<string, unknown>): unknown {
        const where: Record<string, unknown> = args['where'] as Record<string, unknown>;

        return where['site'] ? this.#talksToWake(args) : this.#conversationsPage(args);
    }

    /** Живые переписки площадок с включённым будильником, вместе с площадкой и последней репликой. */
    #talksToWake(args: Record<string, unknown>): unknown[] {
        const limit: number = (args['take'] as number) ?? this.conversations.length;

        return this.conversations
            .filter((talk: IDoubleConversation): boolean => talk.state === 'live')
            .map((talk: IDoubleConversation): { talk: IDoubleConversation; site: IDoubleSite | undefined } => ({
                talk,
                site: this.sites.find((site: IDoubleSite): boolean => site.id === talk.siteId),
            }))
            .filter((pair: { site: IDoubleSite | undefined }): boolean => Boolean(pair.site?.answerWithin))
            .sort(
                (first: { talk: IDoubleConversation }, second: { talk: IDoubleConversation }): number =>
                    first.talk.lastMessageAt.getTime() - second.talk.lastMessageAt.getTime()
            )
            .slice(0, limit)
            .map((pair: { talk: IDoubleConversation; site: IDoubleSite | undefined }): unknown => ({
                id: pair.talk.id,
                lastMessageAt: pair.talk.lastMessageAt,
                wokeAt: pair.talk.wokeAt ?? null,
                site: this.#withSiteDefaults(pair.site as IDoubleSite),
                messages: this.messages
                    .filter((row: IDoubleMessage): boolean => row.conversationId === pair.talk.id)
                    .sort((first: IDoubleMessage, second: IDoubleMessage): number => second.takenAt.getTime() - first.takenAt.getTime())
                    .slice(0, 1)
                    .map((row: IDoubleMessage): { side: string } => ({ side: row.side })),
            }));
    }

    /** Переписки, попадающие под отбор запроса: сайты набором и, если названо, состояние. */
    #conversationsOf(args: Record<string, unknown>): IDoubleConversation[] {
        const where: { siteId: { in: string[] }; state?: string } = args['where'] as { siteId: { in: string[] }; state?: string };

        return this.conversations
            .filter((row: IDoubleConversation): boolean => where.siteId.in.includes(row.siteId))
            .filter((row: IDoubleConversation): boolean => (where.state ? row.state === where.state : true))
            .sort(
                (first: IDoubleConversation, second: IDoubleConversation): number =>
                    second.lastMessageAt.getTime() - first.lastMessageAt.getTime()
            );
    }

    /** Страница переписок вместе с последней репликой каждой из них. */
    #conversationsPage(args: Record<string, unknown>): Record<string, unknown>[] {
        const skip: number = (args['skip'] as number) ?? 0;
        const take: number = (args['take'] as number) ?? this.conversations.length;

        return this.#conversationsOf(args)
            .slice(skip, skip + take)
            .map((row: IDoubleConversation): Record<string, unknown> => ({
                id: row.id,
                siteId: row.siteId,
                state: row.state,
                lastMessageAt: row.lastMessageAt,
                messages: this.messages
                    .filter((message: IDoubleMessage): boolean => message.conversationId === row.id)
                    .sort((first: IDoubleMessage, second: IDoubleMessage): number => second.takenAt.getTime() - first.takenAt.getTime())
                    .slice(0, 1),
            }));
    }

    /** Одна переписка из набора сайтов. Пусто — её нет или она чужая. */
    #oneConversation(args: Record<string, unknown>): IDoubleConversation | null {
        const where: { id: string; siteId: { in: string[] } } = args['where'] as { id: string; siteId: { in: string[] } };

        return (
            this.conversations.find((row: IDoubleConversation): boolean => row.id === where.id && where.siteId.in.includes(row.siteId)) ??
            null
        );
    }

    /** Сообщения одной переписки, старые первыми. Названная минута оставляет пришедшее после неё. */
    #messagesOf(args: Record<string, unknown>): IDoubleMessage[] {
        const where: { conversationId: string; takenAt?: { gt: Date } } = args['where'] as {
            conversationId: string;
            takenAt?: { gt: Date };
        };
        const since: Date | null = where.takenAt?.gt ?? null;

        return this.messages
            .filter((row: IDoubleMessage): boolean => row.conversationId === where.conversationId)
            .filter((row: IDoubleMessage): boolean => (since ? row.takenAt.getTime() > since.getTime() : true))
            .sort((first: IDoubleMessage, second: IDoubleMessage): number => first.takenAt.getTime() - second.takenAt.getTime());
    }

    /** Страница сообщений одной переписки. */
    #messagesPage(args: Record<string, unknown>): IDoubleMessage[] {
        const skip: number = (args['skip'] as number) ?? 0;
        const take: number = (args['take'] as number) ?? this.messages.length;

        return this.#messagesOf(args).slice(skip, skip + take);
    }
}
