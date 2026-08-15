/**
 * Вход человека: заведение, обрыв и ответ о том, кто вошёл.
 *
 * Значение входа уезжает в куку, недоступную скриптам и не посылаемую по чужому переходу: то,
 * что лежит там, куда дотягивается скрипт страницы, утекает вместе с любой чужой строкой на ней.
 * В хранилище при этом ложится только хеш — по нему вход не подделывается.
 *
 * Отказ входа не называет, что именно не сошлось, и отвечает за то же время: разные ответы и
 * разная длительность одинаково перебирают имена учётных записей за того, кто их подбирает.
 */
import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post, Req, Res, UnauthorizedException } from '@nestjs/common';

import { PublicOperation, SessionOperation } from '@rt/message-bus-api/access/util';
import { createSession, findAccountByNameKey, IAccountForLogin, revokeSession } from '@rt/message-bus-api/accounts/data-access';
import {
    accountNameKey,
    accountOf,
    burnAbsentAccountTime,
    IAccountBearingRequest,
    IRequestAccount,
    issueSessionToken,
    passwordMatches,
    SESSION_COOKIE,
    sessionExpiry,
    sessionTokenHash,
    sessionTtlMs,
} from '@rt/message-bus-api/accounts/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

/** Ответ о том, кто вошёл. Ни пароля, ни значения входа в нём нет и быть не может. */
export interface ISessionAnswer {
    readonly name: string;
}

/** Куда каркас кладёт куку. Тип свой, а не привезённый: контроллеру нужны две операции из него. */
interface ICookieBearingResponse {
    cookie(name: string, value: string, options: Record<string, unknown>): unknown;
    clearCookie(name: string, options: Record<string, unknown>): unknown;
}

/**
 * Как выдаётся кука входа.
 *
 * `httpOnly` — скрипт страницы её не читает. `sameSite: 'strict'` — браузер не посылает её по
 * переходу с чужой страницы, и подделывать запрос оттуда нечем. `secure` — она не уходит по
 * открытому HTTP; на своей машине приёмник поднимается без сертификата, поэтому признак
 * читается из окружения, а не зашит.
 */
function cookieOptions(maxAgeMs: number): Record<string, unknown> {
    return {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env['SESSION_COOKIE_SECURE'] !== 'false',
        path: '/',
        maxAge: maxAgeMs,
    };
}

@Controller('auth')
export class AuthController {
    /**
     * Куда пишется неудачная попытка входа.
     *
     * Без неё подбор пароля неотличим от тишины, а первым признаком становится чужое чтение
     * груза. В строке стоит только имя, названное запросом: пароль не попадает ни в журнал, ни в
     * ответ, ни в адрес.
     */
    readonly #log: Logger = new Logger(AuthController.name);
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    /**
     * Вход по имени и паролю.
     *
     * Операция открыта без входа по устройству: закрытая входом, она требовала бы того, что ею и
     * заводится. Груза она при этом не отдаёт вовсе.
     */
    @Post('login')
    @PublicOperation()
    @HttpCode(HttpStatus.OK)
    public async login(@Body() body: unknown, @Res({ passthrough: true }) response: ICookieBearingResponse): Promise<ISessionAnswer> {
        const named: { name: string; password: string } = this.#credentials(body);
        const account: IAccountForLogin = await this.#accountOfPair(named.name, named.password);
        const at: Date = new Date();
        const ttl: number = sessionTtlMs(process.env['SESSION_TTL_MS']);
        const token: string = issueSessionToken();

        await createSession(this.#prisma, {
            accountId: account.id,
            hash: sessionTokenHash(token),
            expiresAt: sessionExpiry(at, ttl),
            at,
        });

        response.cookie(SESSION_COOKIE, token, cookieOptions(ttl));

        return { name: account.name };
    }

    /**
     * Выход обрывает тот вход, которым пришли, и только его: два браузера — два входа, и выход в
     * одном не выбивает человека там, где он ничего не делал.
     */
    @Post('logout')
    @SessionOperation()
    @HttpCode(HttpStatus.NO_CONTENT)
    public async logout(
        @Req() request: IAccountBearingRequest,
        @Res({ passthrough: true }) response: ICookieBearingResponse
    ): Promise<void> {
        const account: IRequestAccount = accountOf(request);

        await revokeSession(this.#prisma, account.sessionId, new Date());

        response.clearCookie(SESSION_COOKIE, cookieOptions(0));
    }

    /** Кто вошёл. Отвечает только живому входу: просроченный и оборванный сюда не доходят. */
    @Get('session')
    @SessionOperation()
    public session(@Req() request: IAccountBearingRequest): ISessionAnswer {
        return { name: accountOf(request).name };
    }

    /**
     * Имя и пароль из тела запроса.
     *
     * Отсутствие поля — отказ формы, а не пары: сказать про пустое тело «пара не принята» значит
     * ответить на ошибку вызывающего так же, как на подбор.
     */
    #credentials(body: unknown): { name: string; password: string } {
        const fields: Record<string, unknown> = typeof body === 'object' && body !== null ? { ...body } : {};
        const name: unknown = fields['name'];
        const password: unknown = fields['password'];

        if (typeof name !== 'string' || typeof password !== 'string' || !name.trim() || !password) {
            throw new UnauthorizedException('в запросе нет имени или пароля');
        }

        return { name, password };
    }

    /**
     * Запись, которой пара годится.
     *
     * Неизвестное имя сверяется с заглушкой хеша, а не отвергается сразу: иначе время ответа
     * отвечает на вопрос, заведена ли такая запись, — ровно то, что запрещает правило об отказе
     * входа. Отключённая запись отвечает тем же отказом по той же причине.
     */
    async #accountOfPair(name: string, password: string): Promise<IAccountForLogin> {
        const account: IAccountForLogin | null = await findAccountByNameKey(this.#prisma, accountNameKey(name));

        if (!account) {
            burnAbsentAccountTime(password);
            this.#refused(name);

            throw new UnauthorizedException('пара не принята');
        }

        if (!passwordMatches(password, account.passwordHash) || account.disabledAt !== null) {
            this.#refused(name);

            throw new UnauthorizedException('пара не принята');
        }

        return account;
    }

    /** Строка о неудачной попытке. Отказ по вводу и правам пишется без стека: проверка сработала. */
    #refused(name: string): void {
        this.#log.warn({ event: 'login-refused', name: accountNameKey(name) });
    }
}
