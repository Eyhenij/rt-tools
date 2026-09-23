/**
 * Встраиваемая страница переписок: вход в неё со стороны потребителя.
 *
 * Люди потребителя работают в своей админке, и учётной записи приёмника у них нет — у чата своё
 * пространство и свои операторы. Поэтому пускает их сам потребитель: его сервер подписывает ключ
 * площадки и минуту тайной площадки, а сервис проверяет подпись и выдаёт признак страницы на время.
 *
 * Операция стоит отдельным контроллером, а не рядом с чтением оператора: то закрыто входом
 * человека, эта — подписью потребителя, и две двери в одном файле читались бы как одна поверхность.
 *
 * Отказ не называет, что именно не сошлось: неизвестный ключ, выключенная площадка и подпись
 * чужой тайной отвечают одинаково. Разница сказала бы тому, кто перебирает, какие ключи заведены.
 *
 * Адрес страницы спрашивается тем же списком, которым сторожится виджет, и только когда он назван:
 * заголовок адреса ставит браузер, и страница его не подделает, а обращение без заголовка пришло не
 * из браузера — с сервера потребителя, который тайну и так держит у себя.
 *
 * Минута обращения приезжает последним доводом, а не читается часами внутри: допуск подписи и конец
 * признака решаются ею, и спека проверяет их вызовом.
 */
import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    Get,
    Logger,
    Param,
    Post,
    Query,
    Req,
    UnauthorizedException,
} from '@nestjs/common';

import { PublicOperation } from '@rt/message-bus-api/access/util';
import { IChatEntryOpened } from '@rt/message-bus-api/chat/api';
import {
    conversationsPage,
    findLiveSiteByKey,
    findSiteById,
    IChatConversationListRow,
    IChatMessageListRow,
    IChatSiteRow,
    messagesPage,
} from '@rt/message-bus-api/chat/data-access';
import {
    CHAT_ENTRY_SIGN_LIFETIME_MS,
    chatEntryMinuteFits,
    chatEntrySignatureFits,
    chatEntrySignExpired,
    chatEntrySignFits,
    chatEntrySignMake,
    chatEntrySignRead,
    IChatEntrySign,
    missedSince,
    originAllowed,
    pageOrigin,
} from '@rt/message-bus-api/chat/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { EChatTalkState, ERefusal, IPage, pageAsked, pageFault, refusalBody } from '@rt/message-bus-common';

import { chatStateAsked, ChatTalkService, IChatStateChanged } from './chat-talk.service';

/** Запрос, каким его видит операция: тело каркас уже разобрал, адрес страницы берётся здесь. */
export interface IChatEmbeddedRequest {
    readonly headers?: Record<string, string | string[] | undefined>;
}

/** Строка тела без окружающих пробелов. Пустая строка считается неназванной. */
function field(body: Record<string, unknown>, key: string): string {
    const raw: unknown = body[key];

    return typeof raw === 'string' ? raw.trim() : '';
}

/** Первое значение заголовка: каркас отдаёт то строку, то список. */
function header(request: IChatEmbeddedRequest, name: string): string {
    const raw: string | string[] | undefined = request.headers?.[name];

    if (Array.isArray(raw)) {
        return raw[0] ?? '';
    }

    return raw ?? '';
}

/** Поля порядка списка переписок: те же, что у панели — второй порядок разошёлся бы с первым. */
const CONVERSATION_SORTABLE: readonly string[] = ['lastMessageAt'];

/** Поля порядка списка сообщений: разговор читается с начала. */
const MESSAGE_SORTABLE: readonly string[] = ['takenAt'];

/** Минута из тела: приезжает то числом, то строкой. Не число — ноль, и подпись под ним не сойдётся. */
function minuteOf(raw: unknown): number {
    const asked: number = typeof raw === 'number' ? raw : Number(String(raw ?? ''));

    return Number.isSafeInteger(asked) ? asked : 0;
}

@Controller('chat/embedded')
export class ChatEmbeddedController {
    readonly #prisma: PrismaService;
    readonly #talks: ChatTalkService;
    readonly #log: Logger = new Logger(ChatEmbeddedController.name);

    constructor(prisma: PrismaService, talks: ChatTalkService) {
        this.#prisma = prisma;
        this.#talks = talks;
    }

    /**
     * Обмен подписи потребителя на признак страницы.
     *
     * Подпись проверяется раньше минуты: отказ по устаревшей минуте получает только тот, чья
     * подпись сошлась, — иначе он говорил бы перебирающему, что ключ с тайной угаданы верно.
     */
    @Post('entry')
    @PublicOperation()
    public async entry(@Body() body: unknown, @Req() request: IChatEmbeddedRequest, at: Date = new Date()): Promise<IChatEntryOpened> {
        const fields: Record<string, unknown> = (body ?? {}) as Record<string, unknown>;
        const key: string = field(fields, 'site');

        if (!key) {
            throw new BadRequestException(refusalBody(ERefusal.ChatSiteKeyEmpty));
        }

        const site: IChatSiteRow | null = await findLiveSiteByKey(this.#prisma, key);
        const signature: string = field(fields, 'signature');
        const madeAt: number = minuteOf(fields['at']);

        if (!site || !site.hookSecret || !signature || !chatEntrySignatureFits(site.hookSecret, key, madeAt, signature)) {
            this.#log.warn({ event: 'chat-entry-refused' });

            throw new UnauthorizedException(refusalBody(ERefusal.ChatEntryRejected));
        }

        this.#address(site, request);

        if (!chatEntryMinuteFits(madeAt, at.getTime())) {
            this.#log.warn({ event: 'chat-entry-stale', site: site.id });

            throw new UnauthorizedException(refusalBody(ERefusal.ChatEntryStale));
        }

        return {
            sign: chatEntrySignMake(site.hookSecret, site.id, at.getTime()),
            expiresAt: new Date(at.getTime() + CHAT_ENTRY_SIGN_LIFETIME_MS).toISOString(),
        };
    }

    /**
     * Страница переписок своего сайта.
     *
     * Сайт не выбирается: он назван признаком, и выбора площадки у страницы нет вовсе. Читает то
     * же самое, чем читает панель, — второе чтение разошлось бы с первым молча.
     */
    @Get('conversations')
    @PublicOperation()
    public async page(@Query() query: Record<string, unknown>, at: Date = new Date()): Promise<IPage<IChatConversationListRow>> {
        const fault: string | null = pageFault(query, CONVERSATION_SORTABLE);

        if (fault) {
            throw new BadRequestException(fault);
        }

        const sites: string[] = [await this.#site(query['sign'], at)];
        const state: EChatTalkState | null = query['state'] === undefined ? null : chatStateAsked(query['state']);

        return conversationsPage(this.#prisma, sites, { siteId: null, state }, pageAsked(query, CONVERSATION_SORTABLE));
    }

    /** Страница сообщений одной переписки. Переписка соседнего сайта отвечает как ненайденная. */
    @Get('conversations/:id/messages')
    @PublicOperation()
    public async messages(
        @Param('id') id: string,
        @Query() query: Record<string, unknown>,
        at: Date = new Date()
    ): Promise<IPage<IChatMessageListRow>> {
        const fault: string | null = pageFault(query, MESSAGE_SORTABLE);

        if (fault) {
            throw new BadRequestException(fault);
        }

        await this.#talks.own([await this.#site(query['sign'], at)], id);

        return messagesPage(this.#prisma, id, pageAsked(query, MESSAGE_SORTABLE), missedSince(query['since']));
    }

    /**
     * Ответ человека потребителя посетителю.
     *
     * Для посетителя он неотличим от ответа из панели: разговор один, и пишется он одной дорогой —
     * вторая дала бы два порядка сообщений в одной переписке.
     */
    @Post('conversations/:id/messages')
    @PublicOperation()
    public async answer(@Param('id') id: string, @Body() body: unknown, at: Date = new Date()): Promise<IChatMessageListRow> {
        const fields: Record<string, unknown> = (body ?? {}) as Record<string, unknown>;
        const text: string = field(fields, 'text');

        return this.#talks.answer([await this.#site(fields['sign'], at)], id, text, at);
    }

    /** Смена состояния переписки со встраиваемой страницы: закрыть разговор или открыть снова. */
    @Post('conversations/:id/state')
    @PublicOperation()
    public async state(@Param('id') id: string, @Body() body: unknown, at: Date = new Date()): Promise<IChatStateChanged> {
        const fields: Record<string, unknown> = (body ?? {}) as Record<string, unknown>;
        const asked: EChatTalkState = chatStateAsked(fields['state']);

        return this.#talks.state([await this.#site(fields['sign'], at)], id, asked);
    }

    /**
     * Сайт признака страницы: под ним работают все операции, и видят они только его.
     *
     * Признак читается сначала без проверки подписи — в нём лежит сайт, а тайна лежит у сайта.
     * Испорченный признак и подпись чужой тайной отвечают одинаково; истёкший отвечает своим
     * отказом, по которому страница берёт признак заново, ни о чём не спрашивая человека.
     */
    async #site(raw: unknown, at: Date): Promise<string> {
        const sign: IChatEntrySign | null = typeof raw === 'string' && raw.trim() ? chatEntrySignRead(raw.trim()) : null;
        const site: IChatSiteRow | null = sign ? await findSiteById(this.#prisma, sign.siteId) : null;

        if (!sign || !site || !site.hookSecret || !chatEntrySignFits(site.hookSecret, String(raw).trim())) {
            this.#log.warn({ event: 'chat-sign-refused' });

            throw new UnauthorizedException(refusalBody(ERefusal.ChatEntryRejected));
        }

        if (chatEntrySignExpired(sign, at.getTime())) {
            throw new UnauthorizedException(refusalBody(ERefusal.ChatEntryExpired));
        }

        return site.id;
    }

    /**
     * Адрес страницы, с которой пришло обращение.
     *
     * Названный адрес сверяется со списком площадки — тем же, которым сторожится виджет. Не
     * названный не проверяется вовсе: заголовок ставит браузер, а обращение без него пришло с
     * сервера потребителя, и отвечает за него подпись.
     */
    #address(site: IChatSiteRow, request: IChatEmbeddedRequest): void {
        const origin: string = pageOrigin(header(request, 'origin'), header(request, 'referer'));

        if (!origin) {
            return;
        }

        if (!originAllowed(site.origins, origin)) {
            this.#log.warn({ event: 'chat-entry-origin-refused', site: site.id });

            throw new ForbiddenException(refusalBody(ERefusal.ChatOriginRejected));
        }
    }
}
