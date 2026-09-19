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
import { findAccountByNameKey, IAccountForLogin, revokeSession } from '@rt/message-bus-api/accounts/data-access';
import {
    accountNameKey,
    accountOf,
    burnAbsentAccountTime,
    IAccountBearingRequest,
    IRequestAccount,
    loginDelayMs,
    passwordMatches,
    SESSION_COOKIE,
} from '@rt/message-bus-api/accounts/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

import { LoginAttemptsService } from './login-attempts.service';
import { cookieOptions, ICookieBearingResponse, ISessionAnswer, issueSignIn, rightsAnswerOf } from './sign-in-issue';
import { ERefusal, refusalBody } from '@rt/message-bus-common';

/** Подождать перед ответом. Ноль ждать не заставляет: обещание разрешается тем же тактом. */
async function hold(ms: number): Promise<void> {
    if (ms > 0) {
        await new Promise((done: (value: void) => void): unknown => setTimeout(done, ms));
    }
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
    readonly #attempts: LoginAttemptsService;

    constructor(prisma: PrismaService, attempts: LoginAttemptsService) {
        this.#prisma = prisma;
        this.#attempts = attempts;
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
        const at: Date = new Date();
        const account: IAccountForLogin = await this.#accountOfPair(named.name, named.password, at);

        this.#attempts.passed(accountNameKey(named.name));

        return issueSignIn(this.#prisma, response, account, at);
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
    public async session(@Req() request: IAccountBearingRequest): Promise<ISessionAnswer> {
        const account: IRequestAccount = accountOf(request);

        return { name: account.name, rights: await rightsAnswerOf(this.#prisma, account.id) };
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
            throw new UnauthorizedException(refusalBody(ERefusal.SignInEmpty));
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
    async #accountOfPair(name: string, password: string, at: Date): Promise<IAccountForLogin> {
        const account: IAccountForLogin | null = await findAccountByNameKey(this.#prisma, accountNameKey(name));

        if (!account) {
            burnAbsentAccountTime(password);

            throw await this.#refusal(name, at);
        }

        if (!passwordMatches(password, account.passwordHash) || account.disabledAt !== null) {
            throw await this.#refusal(name, at);
        }

        return account;
    }

    /**
     * Отказ паре: строка в журнал, удлинение ответа и сам отказ.
     *
     * Отказ по вводу и правам пишется без стека: проверка сработала. Ответ удлиняется тем
     * больше, чем длиннее череда неудач подряд, — перебор, отвечающий с той же скоростью,
     * ограничен только сетью. Считается это по имени, названному запросом, и одинаково для
     * известного имени и для незаведённого: разное ожидание отвечало бы на вопрос, заведена ли
     * запись, — ровно то, что запрещает правило об отказе входа.
     */
    async #refusal(name: string, at: Date): Promise<UnauthorizedException> {
        const nameKey: string = accountNameKey(name);

        this.#log.warn({ event: 'login-refused', name: nameKey });

        await hold(loginDelayMs(this.#attempts.failed(nameKey, at)));

        return new UnauthorizedException('пара не принята');
    }
}
