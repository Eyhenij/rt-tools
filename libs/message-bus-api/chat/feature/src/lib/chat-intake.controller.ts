/**
 * Обращения посетителя сайта: площадка, его переписка, заведение и приём реплики.
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
    Get,
    HttpException,
    HttpStatus,
    Logger,
    NotFoundException,
    Post,
    Query,
    Req,
    Sse,
    UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { PublicOperation } from '@rt/message-bus-api/access/util';
import { RateLimitService } from '@rt/message-bus-api/access/feature';
import { IChatConversationStarted, IChatMessageEvent, IChatMessageTaken } from '@rt/message-bus-api/chat/api';
import {
    appendVisitorMessage,
    findConversationByVisitorToken,
    findLiveSiteByKey,
    IChatConversationRow,
    IChatMessageListRow,
    IChatSiteRow,
    IChatStartedRow,
    IChatTakenRow,
    messagesPage,
    startConversation,
} from '@rt/message-bus-api/chat/data-access';
import {
    chatAnswersAt,
    CHAT_RATE_LIMIT,
    CHAT_RATE_WINDOW_MS,
    CHAT_TEXT_LIMIT,
    chatTextFault,
    EChatTextFault,
    issueVisitorToken,
    originAllowed,
} from '@rt/message-bus-api/chat/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { CHAT_SIDE_VISITOR, ERefusal, IChatSiteLookRow, IPage, pageAsked, refusalBody } from '@rt/message-bus-common';

import { ChatSubscribersService, IChatFrame } from './chat-subscribers.service';

/** Поля порядка ленты: он один — минута приёма, и ею же лента стоит от старых к свежим. */
const MESSAGE_SORTABLE: readonly string[] = ['takenAt'];

/** Запрос, каким его видит операция: тело уже разобрано каркасом, адрес страницы берётся здесь. */
interface IChatRequest {
    readonly ip?: string;
    readonly headers?: Record<string, string | string[] | undefined>;
}

/** Сторона разговора у реплики посетителя: событие называет её тем же словом, что и хранилище. */
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
    readonly #subscribers: ChatSubscribersService;
    readonly #log: Logger = new Logger(ChatIntakeController.name);

    constructor(prisma: PrismaService, rate: RateLimitService, subscribers: ChatSubscribersService) {
        this.#prisma = prisma;
        this.#rate = rate;
        this.#subscribers = subscribers;
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

    /**
     * Площадка глазами виджета: чем поздороваться и отвечает ли оператор сейчас.
     *
     * Отвечает ли — решает сервис: часы названы в поясе площадки, а часы браузера посетителя
     * показывают его собственный пояс. Неизвестный и выключенный ключ отвечают одинаково, как и
     * в остальных операциях приёма.
     */
    @Get('site')
    @PublicOperation()
    public async look(
        @Query() query: Record<string, unknown>,
        @Req() request: IChatRequest,
        at: Date = new Date()
    ): Promise<IChatSiteLookRow> {
        const site: IChatSiteRow = await this.#site(query, request);

        return {
            greeting: site.greeting,
            answering: chatAnswersAt({ from: site.answerFrom, to: site.answerTo, timeZone: site.timeZone }, at),
            answerFrom: site.answerFrom,
            answerTo: site.answerTo,
        };
    }

    /**
     * Своя переписка посетителя страницами, старые реплики первыми.
     *
     * Закрыта признаком посетителя: чтение оператора закрыто входом человека и отвечает за его
     * сайты, а у посетителя нет ни того, ни другого. Само чтение — то же самое, которым читает
     * панель: второе разошлось бы с ним молча.
     */
    @Get('messages')
    @PublicOperation()
    public async mine(@Query() query: Record<string, unknown>, @Req() request: IChatRequest): Promise<IPage<IChatMessageListRow>> {
        const site: IChatSiteRow = await this.#site(query, request);
        const conversation: IChatConversationRow = await this.#own(site, query);

        return messagesPage(this.#prisma, conversation.id, pageAsked(query, MESSAGE_SORTABLE));
    }

    /** Приём реплики посетителя в его переписку. */
    @Post('messages')
    @PublicOperation()
    public async take(@Body() body: unknown, @Req() request: IChatRequest, at: Date = new Date()): Promise<IChatMessageTaken> {
        const fields: Record<string, unknown> = (body ?? {}) as Record<string, unknown>;
        const site: IChatSiteRow = await this.#site(fields, request);
        const conversation: IChatConversationRow = await this.#own(site, fields);

        this.#hold(`chat-message:${field(fields, 'visitor')}`, at);

        const text: string = field(fields, 'text');
        const fault: EChatTextFault | null = chatTextFault(text);

        if (fault === EChatTextFault.Empty) {
            throw new BadRequestException(refusalBody(ERefusal.ChatTextEmpty));
        }

        if (fault === EChatTextFault.TooLong) {
            throw new BadRequestException(refusalBody(ERefusal.ChatTextTooLong, { limit: CHAT_TEXT_LIMIT }));
        }

        const message: IChatTakenRow = await appendVisitorMessage(this.#prisma, conversation.id, text, at);
        const event: IChatMessageEvent = {
            text,
            conversationId: conversation.id,
            messageId: message.id,
            side: CHAT_SIDE_VISITOR,
            takenAt: message.takenAt.toISOString(),
        };

        this.#subscribers.send({ conversationId: conversation.id, siteId: site.id }, event);

        return { messageId: message.id, takenAt: message.takenAt.toISOString() };
    }

    /**
     * Поток событий одной переписки: его читает виджет посетителя.
     *
     * Закрыт признаком посетителя — тем самым, который сервис выдал при заведении переписки:
     * чужой и никому не выданный отвечают одинаково, как ненайденная переписка. Открытый поток
     * ничего не пишет сам, пока в переписке не появилась реплика: пока событий нет, идёт
     * сердцебиение, иначе простаивающее соединение закрыл бы проксировщик.
     */
    @Get('stream')
    @PublicOperation()
    @Sse()
    public async stream(@Query() query: Record<string, unknown>, @Req() request: IChatRequest): Promise<Observable<IChatFrame>> {
        const site: IChatSiteRow = await this.#site(query, request);
        const token: string = field(query, 'visitor');
        const conversation: IChatConversationRow | null = token ? await findConversationByVisitorToken(this.#prisma, site.id, token) : null;

        if (!conversation) {
            this.#log.warn({ event: 'chat-stream-refused', site: site.id });

            throw new NotFoundException(refusalBody(ERefusal.ChatConversationNotFound));
        }

        return this.#subscribers.stream({ conversationId: conversation.id, siteIds: [] });
    }

    /** Переписка посетителя по его признаку. Чужая и несуществующая отвечают одинаково. */
    async #own(site: IChatSiteRow, fields: Record<string, unknown>): Promise<IChatConversationRow> {
        const token: string = field(fields, 'visitor');
        const asked: string = field(fields, 'conversation');
        const conversation: IChatConversationRow | null = token ? await findConversationByVisitorToken(this.#prisma, site.id, token) : null;

        if (!conversation || (asked && conversation.id !== asked)) {
            this.#log.warn({ event: 'chat-conversation-refused', site: site.id });

            throw new NotFoundException(refusalBody(ERefusal.ChatConversationNotFound));
        }

        return conversation;
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
