/**
 * Запросы стороны оператора: за какие сайты он отвечает, страница переписок, страница сообщений
 * и смена состояния переписки.
 *
 * Набор сайтов идёт в сам запрос, а не отсеивается после него: отсев после чтения оставляет
 * соседский разговор в общем счёте строк, и число называет то, чего оператор видеть не должен.
 *
 * Минута обращения приезжает доводом, а не читается часами внутри: реплика посетителя открывает
 * закрытую переписку той же минутой, которой она принята.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { EChatConversationState } from '@rt/message-bus-api/chat/util';
import { IPage, IPageAsked, pageSkip } from '@rt/message-bus-common';

/** Строка списка переписок: то, что панель показывает одной строкой. */
export interface IChatConversationListRow {
    readonly id: string;
    readonly siteId: string;
    readonly state: string;
    readonly lastMessageAt: Date;
    /** Последняя реплика разговора: без неё панель спрашивала бы по строке на каждую переписку. */
    readonly lastMessage: string;
    readonly lastMessageSide: string;
}

/** Строка списка сообщений одной переписки. */
export interface IChatMessageListRow {
    readonly id: string;
    readonly side: string;
    readonly text: string;
    readonly takenAt: Date;
}

/** Чем сужен список переписок: сайтом и состоянием, оба необязательны. */
export interface IChatConversationFilter {
    readonly siteId: string | null;
    readonly state: EChatConversationState | null;
}

/** Сообщение переписки, как оно лежит в хранилище. */
interface IStoredMessage {
    readonly id: string;
    readonly side: string;
    readonly text: string;
    readonly takenAt: Date;
}

/** Переписка вместе с последней репликой. */
interface IStoredConversation {
    readonly id: string;
    readonly siteId: string;
    readonly state: string;
    readonly lastMessageAt: Date;
    readonly messages: readonly IStoredMessage[];
}

/** Сайты, за которые отвечает вошедший. Пусто — он не оператор чата вовсе. */
export async function operatorSites(prisma: PrismaService, accountId: string): Promise<string[]> {
    const rows: { siteId: string }[] = await prisma.chatOperatorSite.findMany({
        where: { operator: { accountId } },
        select: { siteId: true },
    });

    return rows.map((row: { siteId: string }): string => row.siteId);
}

/** Какие сайты попадают в запрос: пересечение набора оператора и названного отбором. */
function askedSites(sites: readonly string[], siteId: string | null): string[] {
    if (!siteId) {
        return [...sites];
    }

    return sites.includes(siteId) ? [siteId] : [];
}

/**
 * Страница переписок оператора, свежие первыми.
 *
 * Сайт, за который оператор не отвечает, даёт пустую страницу, а не отказ: отказ ответил бы на
 * вопрос «а такой сайт есть?» тому, кому спрашивать нечего.
 */
export async function conversationsPage(
    prisma: PrismaService,
    sites: readonly string[],
    filter: IChatConversationFilter,
    asked: IPageAsked
): Promise<IPage<IChatConversationListRow>> {
    const siteIds: string[] = askedSites(sites, filter.siteId);

    if (siteIds.length === 0) {
        return { rows: [], total: 0, page: asked.page, size: asked.size };
    }

    const where: Record<string, unknown> = filter.state ? { siteId: { in: siteIds }, state: filter.state } : { siteId: { in: siteIds } };
    const [rows, total]: [IStoredConversation[], number] = await prisma.$transaction([
        prisma.chatConversation.findMany({
            where,
            orderBy: { lastMessageAt: 'desc' },
            skip: pageSkip(asked),
            take: asked.size,
            select: {
                id: true,
                siteId: true,
                state: true,
                lastMessageAt: true,
                messages: { orderBy: { takenAt: 'desc' }, take: 1, select: { id: true, side: true, text: true, takenAt: true } },
            },
        }),
        prisma.chatConversation.count({ where }),
    ]);

    const listed: IChatConversationListRow[] = rows.map((row: IStoredConversation): IChatConversationListRow => ({
        id: row.id,
        siteId: row.siteId,
        state: row.state,
        lastMessageAt: row.lastMessageAt,
        lastMessage: row.messages[0]?.text ?? '',
        lastMessageSide: row.messages[0]?.side ?? '',
    }));

    return { total, rows: listed, page: asked.page, size: asked.size };
}

/** Переписка одного из сайтов оператора. Пусто — её нет или она чужая: ответ один на две причины. */
export async function conversationOfSites(
    prisma: PrismaService,
    sites: readonly string[],
    conversationId: string
): Promise<{ id: string; siteId: string; state: string } | null> {
    if (sites.length === 0) {
        return null;
    }

    return prisma.chatConversation.findFirst({
        where: { id: conversationId, siteId: { in: [...sites] } },
        select: { id: true, siteId: true, state: true },
    });
}

/**
 * Страница сообщений одной переписки, старые первыми: разговор читается с начала.
 *
 * Названная минута сужает чтение до того, что пришло после неё: этим же запросом экран добирает
 * пропущенное после обрыва потока. Второе чтение ради добора разошлось бы с этим молча — одно
 * отдавало бы сообщение, которого другое уже не видит.
 */
export async function messagesPage(
    prisma: PrismaService,
    conversationId: string,
    asked: IPageAsked,
    since: Date | null = null
): Promise<IPage<IChatMessageListRow>> {
    const where: { conversationId: string; takenAt?: { gt: Date } } = since
        ? { conversationId, takenAt: { gt: since } }
        : { conversationId };
    const [rows, total]: [IChatMessageListRow[], number] = await prisma.$transaction([
        prisma.chatMessage.findMany({
            where,
            orderBy: { takenAt: 'asc' },
            skip: pageSkip(asked),
            take: asked.size,
            select: { id: true, side: true, text: true, takenAt: true },
        }),
        prisma.chatMessage.count({ where }),
    ]);

    return { rows, total, page: asked.page, size: asked.size };
}

/** Смена состояния переписки. Зовётся после того, как переписка признана своей. */
export async function setConversationState(
    prisma: PrismaService,
    conversationId: string,
    state: EChatConversationState
): Promise<{ id: string; state: string }> {
    return prisma.chatConversation.update({
        where: { id: conversationId },
        data: { state },
        select: { id: true, state: true },
    });
}
