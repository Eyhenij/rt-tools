/**
 * Запросы чата: живой сайт по ключу, посетитель по признаку, переписка и реплика в неё.
 *
 * Заведение посетителя вместе с его перепиской идёт одной сделкой: между двумя запросами
 * посетитель стоял бы без переписки, и вторая реплика с той же страницы завела бы ему вторую.
 *
 * Минута приёма приезжает доводом, а не читается часами внутри: порядок сообщений задаёт
 * сервис, и спека проверяет это вызовом.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

/**
 * Сайт, каким его читает приём реплики: ключ уже сошёлся, дальше решает список адресов.
 *
 * Приветствие и часы ответа лежат здесь же, а не читаются вторым запросом: виджет спрашивает их
 * тем же обращением, которым узнаёт, жива ли площадка, — а два чтения одного и того же
 * разошлись бы молча.
 */
export interface IChatSiteRow {
    readonly id: string;
    readonly spaceId: string;
    /** Ключ площадки: им вызов наружу называет площадку приложению. */
    readonly key: string;
    readonly origins: readonly string[];
    /** Приветствие площадки. Пусто — виджет открывается сразу полем набора. */
    readonly greeting: string;
    /** Часы ответа минутами суток; равные концы означают, что часы не названы. */
    readonly answerFrom: number;
    readonly answerTo: number;
    /** Имя пояса площадки. Пусто — часы считаются по поясу узла. */
    readonly timeZone: string;
    /** Адрес приложения площадки. Пусто — вызовы наружу по ней не уходят вовсе. */
    readonly hookUrl: string;
    /** Тайна подписи вызова. Пусто — подписать вызов нечем, и он не уходит. */
    readonly hookSecret: string;
    /** Через сколько минут без ответа переписка будит оператора. Ноль — будильник выключен. */
    readonly answerWithin: number;
}

/** Переписка посетителя: чем на неё ссылаться и кому она принадлежит. */
export interface IChatConversationRow {
    readonly id: string;
    readonly siteId: string;
    readonly visitorId: string;
}

/** Заведённая переписка вместе с признаком, выданным посетителю. */
export interface IChatStartedRow {
    readonly conversation: IChatConversationRow;
    readonly visitorToken: string;
}

/** Принятая реплика: чем её назвать в ответе. */
export interface IChatTakenRow {
    readonly id: string;
    readonly takenAt: Date;
}

/** Поля площадки, которые читают и приём реплики, и отправка вызова наружу. */
export const SITE_FIELDS: Readonly<Record<keyof IChatSiteRow, true>> = {
    id: true,
    spaceId: true,
    key: true,
    origins: true,
    greeting: true,
    answerFrom: true,
    answerTo: true,
    timeZone: true,
    hookUrl: true,
    hookSecret: true,
    answerWithin: true,
};

/**
 * Живой сайт по ключу. Пусто — ключа нет или сайт выключен: по ответу эти две причины не
 * различаются, и запрос их тоже не разводит.
 */
export async function findLiveSiteByKey(prisma: PrismaService, key: string): Promise<IChatSiteRow | null> {
    return prisma.chatSite.findFirst({
        where: { key, enabled: true },
        select: SITE_FIELDS,
    });
}

/**
 * Площадка по признаку: её читает отправка вызова наружу.
 *
 * Выключенность здесь не спрашивается: событие о переписке выключенной площадки приложению
 * нужно не меньше — выключенный сайт перестаёт принимать новых посетителей, а не разговоры,
 * которые уже идут.
 */
export async function findSiteById(prisma: PrismaService, id: string): Promise<IChatSiteRow | null> {
    return prisma.chatSite.findFirst({ where: { id }, select: SITE_FIELDS });
}

/**
 * Адреса всех живых площадок одним списком: по нему отвечается позволение браузеру.
 *
 * Ключ площадки в этом ответе не участвует, и участвовать не может: предварительный запрос
 * браузер шлёт без тела, а ключ приём реплики берёт как раз из тела. Позволение поэтому даётся
 * адресу, который стоит в списке хоть одной живой площадки, а пару «ключ и адрес» сводит сама
 * операция — чужая пара получает отказ, и страница его читает.
 */
export async function liveSiteOrigins(prisma: PrismaService): Promise<string[]> {
    const sites: { origins: string[] }[] = await prisma.chatSite.findMany({
        where: { enabled: true },
        select: { origins: true },
    });

    return sites.flatMap((site: { origins: string[] }): string[] => site.origins);
}

/** Поля переписки, которыми на неё ссылаются. */
const CONVERSATION_FIELDS: Readonly<Record<keyof IChatConversationRow, true>> = { id: true, siteId: true, visitorId: true };

/** Посетитель сайта по признаку вместе с его переписками, свежие первыми. Пусто — признак чужой. */
async function visitorWithTalks(
    prisma: PrismaService,
    siteId: string,
    token: string
): Promise<{ id: string; conversations: IChatConversationRow[] } | null> {
    return prisma.chatVisitor.findUnique({
        where: { siteId_token: { siteId, token } },
        select: { id: true, conversations: { orderBy: { lastMessageAt: 'desc' }, select: CONVERSATION_FIELDS } },
    });
}

/**
 * Последняя переписка посетителя на этом сайте по его признаку. Пусто — признак чужой или не
 * выдавался.
 */
export async function findConversationByVisitorToken(
    prisma: PrismaService,
    siteId: string,
    token: string
): Promise<IChatConversationRow | null> {
    const visitor: { conversations: IChatConversationRow[] } | null = await visitorWithTalks(prisma, siteId, token);

    return visitor?.conversations[0] ?? null;
}

/** Названная переписка посетителя. Пусто — признак чужой или переписка не его. */
export async function findVisitorConversation(
    prisma: PrismaService,
    siteId: string,
    token: string,
    conversationId: string
): Promise<IChatConversationRow | null> {
    const visitor: { conversations: IChatConversationRow[] } | null = await visitorWithTalks(prisma, siteId, token);

    return visitor?.conversations.find((talk: IChatConversationRow): boolean => talk.id === conversationId) ?? null;
}

/** Признак записи посетителя сайта. Пусто — признак чужой или не выдавался. */
export async function findVisitorId(prisma: PrismaService, siteId: string, token: string): Promise<string | null> {
    const visitor: { id: string } | null = await visitorWithTalks(prisma, siteId, token);

    return visitor?.id ?? null;
}

/** Посетитель и его переписка одной сделкой. Признак выдаёт зовущий: его же он вернёт виджету. */
export async function startConversation(prisma: PrismaService, siteId: string, token: string, at: Date): Promise<IChatStartedRow> {
    const visitor: { conversations: IChatConversationRow[] } = await prisma.chatVisitor.create({
        data: {
            siteId,
            token,
            firstSeenAt: at,
            conversations: { create: { siteId, createdAt: at, lastMessageAt: at } },
        },
        select: { conversations: { select: CONVERSATION_FIELDS } },
    });

    return { conversation: visitor.conversations[0], visitorToken: token };
}

/** Новое обращение посетителя, который уже есть: его заводит только просьба посетителя. */
export async function startVisitorConversation(
    prisma: PrismaService,
    siteId: string,
    visitorId: string,
    at: Date
): Promise<IChatConversationRow> {
    return prisma.chatConversation.create({
        data: { siteId, visitorId, createdAt: at, lastMessageAt: at },
        select: CONVERSATION_FIELDS,
    });
}

/** Строка списка обращений посетителя: чем её показать в виджете. */
export interface IChatVisitorTalkRow {
    readonly id: string;
    readonly state: string;
    readonly lastMessageAt: Date;
    /** Последняя реплика обращения. Пусто — обращение заведено, но в нём ещё не писали. */
    readonly lastMessage: string;
    readonly lastMessageSide: string;
    /** Имя того, кто ответил последним. Пусто — названного ответа ещё не было. */
    readonly operatorName: string;
}

interface IStoredVisitorTalk {
    readonly id: string;
    readonly state: string;
    readonly lastMessageAt: Date;
    readonly messages: readonly { readonly side: string; readonly text: string }[];
}

/**
 * Обращения посетителя на сайте, свежие первыми. Пусто — признак чужой: чужой посетитель и
 * посетитель без обращений различаются, первый получает отказ.
 *
 * Имя отвечавшего читается вторым запросом, одним на все обращения: последняя реплика и последний
 * названный ответ — разные сообщения, и одно чтение сообщений их не достаёт.
 */
export async function visitorConversations(prisma: PrismaService, siteId: string, token: string): Promise<IChatVisitorTalkRow[] | null> {
    const visitor: { conversations: IStoredVisitorTalk[] } | null = await prisma.chatVisitor.findUnique({
        where: { siteId_token: { siteId, token } },
        select: {
            conversations: {
                orderBy: { lastMessageAt: 'desc' },
                select: {
                    id: true,
                    state: true,
                    lastMessageAt: true,
                    messages: { orderBy: { takenAt: 'desc' }, take: 1, select: { side: true, text: true } },
                },
            },
        },
    });

    if (!visitor) {
        return null;
    }

    const named: { conversationId: string; authorName: string }[] = await prisma.chatMessage.findMany({
        where: {
            conversationId: { in: visitor.conversations.map((talk: IStoredVisitorTalk): string => talk.id) },
            authorName: { not: '' },
        },
        orderBy: { takenAt: 'desc' },
        select: { conversationId: true, authorName: true },
    });

    return visitor.conversations.map((talk: IStoredVisitorTalk): IChatVisitorTalkRow => ({
        id: talk.id,
        state: talk.state,
        lastMessageAt: talk.lastMessageAt,
        lastMessage: talk.messages[0]?.text ?? '',
        lastMessageSide: talk.messages[0]?.side ?? '',
        operatorName: named.find((row: { conversationId: string }): boolean => row.conversationId === talk.id)?.authorName ?? '',
    }));
}

/**
 * Реплика посетителя в его переписку.
 *
 * Сообщение и свежесть переписки пишутся одной сделкой: панель оператора ставит переписки по
 * минуте последнего сообщения, и переписка, у которой сообщение уже легло, а минута ещё нет,
 * стояла бы в конце списка ровно тогда, когда её ждут в начале.
 *
 * Той же сделкой переписка становится живой: закрытую её закрыл оператор, а человек вернулся и
 * написал — оставленная закрытой, она лежала бы там, куда никто не смотрит.
 */
export async function appendVisitorMessage(prisma: PrismaService, conversationId: string, text: string, at: Date): Promise<IChatTakenRow> {
    const [message]: [IChatTakenRow, unknown] = await prisma.$transaction([
        prisma.chatMessage.create({
            data: { conversationId, text, side: 'visitor', takenAt: at },
            select: { id: true, takenAt: true },
        }),
        prisma.chatConversation.update({ where: { id: conversationId }, data: { lastMessageAt: at, state: 'live' } }),
    ]);

    return message;
}
