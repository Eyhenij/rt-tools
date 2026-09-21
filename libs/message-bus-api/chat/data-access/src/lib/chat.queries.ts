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

/** Переписка посетителя на этом сайте по его признаку. Пусто — признак чужой или не выдавался. */
export async function findConversationByVisitorToken(
    prisma: PrismaService,
    siteId: string,
    token: string
): Promise<IChatConversationRow | null> {
    const visitor: { id: string; conversations: IChatConversationRow[] } | null = await prisma.chatVisitor.findUnique({
        where: { siteId_token: { siteId, token } },
        select: { id: true, conversations: { select: { id: true, siteId: true, visitorId: true } } },
    });

    return visitor?.conversations[0] ?? null;
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
        select: { conversations: { select: { id: true, siteId: true, visitorId: true } } },
    });

    return { conversation: visitor.conversations[0], visitorToken: token };
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
