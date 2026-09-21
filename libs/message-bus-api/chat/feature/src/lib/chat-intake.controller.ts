/**
 * `POST /api/chat/conversations` и `POST /api/chat/messages` — обращения посетителя сайта.
 *
 * Обе операции открыты: посетитель пишет без входа, и представиться ему нечем, кроме ключа
 * сайта. Взамен их сторожат три вещи — живой сайт по ключу, адрес страницы из списка сайта и
 * предел частоты на посетителя.
 *
 * Отказ не называет, что именно не сошлось: ненайденный ключ и выключенный сайт отвечают
 * одинаково, чужой признак посетителя и чужая переписка — тоже. Разница в ответах сказала бы
 * тому, кто перебирает, какие ключи и переписки заведены.
 *
 * Момент обращения приезжает последним доводом, а не читается часами внутри: окно предела и
 * порядок сообщений решаются им, и спека проверяет их вызовом.
 */
import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    HttpException,
    HttpStatus,
    Logger,
    NotFoundException,
    Post,
    Req,
    UnauthorizedException,
} from '@nestjs/common';

import { PublicOperation } from '@rt/message-bus-api/access/util';
import { RateLimitService } from '@rt/message-bus-api/access/feature';
import { IChatConversationStarted, IChatMessageTaken } from '@rt/message-bus-api/chat/api';
import {
    appendVisitorMessage,
    findConversationByVisitorToken,
    findLiveSiteByKey,
    IChatConversationRow,
    IChatMessageRow,
    IChatSiteRow,
    IChatStartedRow,
    startConversation,
} from '@rt/message-bus-api/chat/data-access';
import {
    CHAT_RATE_LIMIT,
    CHAT_RATE_WINDOW_MS,
    CHAT_TEXT_LIMIT,
    chatTextFault,
    EChatTextFault,
    issueVisitorToken,
    originAllowed,
} from '@rt/message-bus-api/chat/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { ERefusal, refusalBody } from '@rt/message-bus-common';

/** Запрос, каким его видит операция: тело уже разобрано каркасом, адрес страницы берётся здесь. */
interface IChatRequest {
    readonly ip?: string;
    readonly headers?: Record<string, string | string[] | undefined>;
}

/** Через сколько секунд повторять, когда предел частоты отбил реплику. */
const RETRY_AFTER_SECONDS: number = CHAT_RATE_WINDOW_MS / 1000;

/** Строка тела без окружающих пробелов. Пустая строка считается неназванной. */
function field(body: Record<string, unknown>, key: string): string {
    const raw: unknown = body[key];

    return typeof raw === 'string' ? raw.trim() : '';
}

/** Первое значение заголовка: каркас отдаёт то строку, то список. */
function header(request: IChatRequest, name: string): string {
    const raw: string | string[] | undefined = request.headers?.[name];

    if (Array.isArray(raw)) {
        return raw[0] ?? '';
    }

    return raw ?? '';
}

@Controller('chat')
export class ChatIntakeController {
    readonly #prisma: PrismaService;
    readonly #rate: RateLimitService;
    readonly #log: Logger = new Logger(ChatIntakeController.name);

    constructor(prisma: PrismaService, rate: RateLimitService) {
        this.#prisma = prisma;
        this.#rate = rate;
    }

    /**
     * Заведение переписки.
     *
     * Признак посетителя приезжает, если виджет его уже получал: тогда возвращается живая
     * переписка, а вторая не заводится — перезагрузка страницы иначе рвала бы разговор на куски,
     * которые оператор видит как разных людей.
     */
    @Post('conversations')
    @PublicOperation()
    public async start(@Body() body: unknown, @Req() request: IChatRequest, at: Date = new Date()): Promise<IChatConversationStarted> {
        const fields: Record<string, unknown> = (body ?? {}) as Record<string, unknown>;
        const site: IChatSiteRow = await this.#site(fields, request);
        const asked: string = field(fields, 'visitor');

        if (asked) {
            const live: IChatConversationRow | null = await findConversationByVisitorToken(this.#prisma, site.id, asked);

            if (live) {
                return { conversationId: live.id, visitorToken: asked };
            }
        }

        this.#hold(`chat-start:${this.#clientKey(request)}`, at);

        const started: IChatStartedRow = await startConversation(this.#prisma, site.id, issueVisitorToken(), at);

        return { conversationId: started.conversation.id, visitorToken: started.visitorToken };
    }

    /** Приём реплики посетителя в его переписку. */
    @Post('messages')
    @PublicOperation()
    public async take(@Body() body: unknown, @Req() request: IChatRequest, at: Date = new Date()): Promise<IChatMessageTaken> {
        const fields: Record<string, unknown> = (body ?? {}) as Record<string, unknown>;
        const site: IChatSiteRow = await this.#site(fields, request);
        const token: string = field(fields, 'visitor');
        const asked: string = field(fields, 'conversation');
        const conversation: IChatConversationRow | null = token ? await findConversationByVisitorToken(this.#prisma, site.id, token) : null;

        if (!conversation || conversation.id !== asked) {
            this.#log.warn({ event: 'chat-conversation-refused', site: site.id });

            throw new NotFoundException(refusalBody(ERefusal.ChatConversationNotFound));
        }

        this.#hold(`chat-message:${token}`, at);

        const text: string = field(fields, 'text');
        const fault: EChatTextFault | null = chatTextFault(text);

        if (fault === EChatTextFault.Empty) {
            throw new BadRequestException(refusalBody(ERefusal.ChatTextEmpty));
        }

        if (fault === EChatTextFault.TooLong) {
            throw new BadRequestException(refusalBody(ERefusal.ChatTextTooLong, { limit: CHAT_TEXT_LIMIT }));
        }

        const message: IChatMessageRow = await appendVisitorMessage(this.#prisma, conversation.id, text, at);

        return { messageId: message.id, takenAt: message.takenAt.toISOString() };
    }

    /** Живой сайт по ключу и позволенный адрес страницы. Не сошлось — отказ, один на две причины. */
    async #site(fields: Record<string, unknown>, request: IChatRequest): Promise<IChatSiteRow> {
        const key: string = field(fields, 'site');

        if (!key) {
            throw new BadRequestException(refusalBody(ERefusal.ChatSiteKeyEmpty));
        }

        const site: IChatSiteRow | null = await findLiveSiteByKey(this.#prisma, key);

        if (!site) {
            this.#log.warn({ event: 'chat-site-refused' });

            throw new UnauthorizedException(refusalBody(ERefusal.ChatSiteRejected));
        }

        if (!originAllowed(site.origins, header(request, 'origin'))) {
            this.#log.warn({ event: 'chat-origin-refused', site: site.id });

            throw new ForbiddenException(refusalBody(ERefusal.ChatOriginRejected));
        }

        return site;
    }

    /** Предел частоты на один ключ. Отбито — отказ с тем, через сколько повторять. */
    #hold(key: string, at: Date): void {
        if (this.#rate.allow(key, at, CHAT_RATE_LIMIT, CHAT_RATE_WINDOW_MS)) {
            return;
        }

        this.#log.warn({ event: 'chat-throttled', key });

        throw new HttpException(
            refusalBody(ERefusal.ChatThrottled, { limit: CHAT_RATE_LIMIT, after: RETRY_AFTER_SECONDS }),
            HttpStatus.TOO_MANY_REQUESTS
        );
    }

    /**
     * Чем зовётся клиент до того, как у него появился признак посетителя.
     *
     * Первый шаг цепочки проксировщика, затем адрес обращения: приёмник стоит за проксировщиком,
     * и без первого все обращения приходили бы с одного адреса. Неопознанный клиент тоже получает
     * ключ — иначе такие обращения обходили бы предел все разом.
     */
    #clientKey(request: IChatRequest): string {
        const forwarded: string = header(request, 'x-forwarded-for');
        const hop: string = forwarded.split(',')[0]?.trim() ?? '';

        return hop || request.ip || 'неизвестен';
    }
}
