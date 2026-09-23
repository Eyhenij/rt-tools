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
import { BadRequestException, Body, Controller, ForbiddenException, Logger, Post, Req, UnauthorizedException } from '@nestjs/common';

import { PublicOperation } from '@rt/message-bus-api/access/util';
import { IChatEntryOpened } from '@rt/message-bus-api/chat/api';
import { findLiveSiteByKey, IChatSiteRow } from '@rt/message-bus-api/chat/data-access';
import {
    CHAT_ENTRY_SIGN_LIFETIME_MS,
    chatEntryMinuteFits,
    chatEntrySignatureFits,
    chatEntrySignMake,
    originAllowed,
    pageOrigin,
} from '@rt/message-bus-api/chat/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { ERefusal, refusalBody } from '@rt/message-bus-common';

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

/** Минута из тела: приезжает то числом, то строкой. Не число — ноль, и подпись под ним не сойдётся. */
function minuteOf(raw: unknown): number {
    const asked: number = typeof raw === 'number' ? raw : Number(String(raw ?? ''));

    return Number.isSafeInteger(asked) ? asked : 0;
}

@Controller('chat/embedded')
export class ChatEmbeddedController {
    readonly #prisma: PrismaService;
    readonly #log: Logger = new Logger(ChatEmbeddedController.name);

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
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
