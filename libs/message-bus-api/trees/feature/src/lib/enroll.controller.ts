/**
 * `POST /api/intake/enroll` — обращение дерева за токеном.
 *
 * Единственная операция приёмника, которая заводит запись и не спрашивает ни токена, ни входа:
 * дерево, у которого токена ещё нет, представиться иначе не может. Взамен её сторожат две вещи —
 * годное приглашение владельца и ограничитель частоты.
 *
 * Отказ не называет, что именно не сошлось: ненайденное приглашение, погашенное, просроченное и
 * отозванное отвечают одинаково. Разница в ответах сказала бы, какие коды заведены.
 *
 * Токен уходит дереву единственным этим ответом. Второго пути забрать его нет — у приёма его нет
 * тоже: в хранилище лежит только хеш.
 */
import { BadRequestException, Body, ConflictException, Controller, Logger, Post, Req, UnauthorizedException } from '@nestjs/common';

import { RateLimitService } from '@rt/message-bus-api/access/feature';
import { PublicOperation } from '@rt/message-bus-api/access/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { findTreeClash, IStoredInvite, ITreeClash, findInviteByHash, redeemInvite } from '@rt/message-bus-api/trees/data-access';
import { inviteCodeHash, inviteUsable, issueTreeToken, treeTokenHash } from '@rt/message-bus-api/trees/util';
import { IEnrollGranted } from '@rt-tools/agent-kit/cargo';

/** Один и тот же отказ на четыре негодных состояния приглашения и на ненайденный код. */
const REFUSAL: string = 'приглашение не принято';

/** Запрос, каким его видит операция: тело уже разобрано каркасом, а ключ клиента берётся здесь. */
interface IEnrollRequest {
    readonly ip?: string;
    readonly headers?: Record<string, string | string[] | undefined>;
}

/** Строка тела без окружающих пробелов. Пустая строка считается неназванной. */
function field(body: Record<string, unknown>, key: string): string {
    const raw: unknown = body[key];

    return typeof raw === 'string' ? raw.trim() : '';
}

@Controller('intake')
export class EnrollController {
    readonly #prisma: PrismaService;
    readonly #rate: RateLimitService;
    readonly #log: Logger = new Logger(EnrollController.name);

    constructor(prisma: PrismaService, rate: RateLimitService) {
        this.#prisma = prisma;
        this.#rate = rate;
    }

    /**
     * Момент обращения приезжает последним доводом, а не читается часами внутри: годность
     * приглашения и окно ограничителя решаются им, и спека проверяет их вызовом. Каркас отдачи
     * этот довод не заполняет — у него нет метки, — и в бою работает умолчание.
     */
    @Post('enroll')
    @PublicOperation()
    public async enroll(@Body() body: unknown, @Req() request: IEnrollRequest, at: Date = new Date()): Promise<IEnrollGranted> {
        const key: string = this.#clientKey(request);

        if (!this.#rate.allow(key, at)) {
            this.#log.warn({ event: 'enroll-throttled', key });

            throw new BadRequestException('обращений с одного клиента больше предела: подождите и повторите');
        }

        const fields: Record<string, unknown> = (body ?? {}) as Record<string, unknown>;
        const code: string = field(fields, 'code');
        const slug: string = field(fields, 'tree');

        if (!code || !slug) {
            throw new BadRequestException('обращение ожидает код приглашения и признак дерева');
        }

        return this.#grant(code, slug, at);
    }

    /**
     * Выдача токена по годному приглашению.
     *
     * Имя берётся из приглашения, а не из обращения: принятое из обращения, оно позволило бы
     * назваться чужим именем тому, кто добыл код.
     */
    async #grant(code: string, slug: string, at: Date): Promise<IEnrollGranted> {
        const invite: IStoredInvite | null = await findInviteByHash(this.#prisma, inviteCodeHash(code));

        if (!invite || !inviteUsable(invite, at)) {
            this.#log.warn({ event: 'enroll-refused', slug });

            throw new UnauthorizedException(REFUSAL);
        }

        const clash: ITreeClash | null = await findTreeClash(this.#prisma, invite.name, slug);

        if (clash) {
            this.#log.warn({ event: 'enroll-clash', slug });

            throw new ConflictException('дерево с таким признаком или именем уже заведено; приглашение осталось годным');
        }

        const token: string = issueTreeToken();
        const taken: boolean = await redeemInvite(
            this.#prisma,
            { inviteId: invite.id, name: invite.name, slug, hash: treeTokenHash(token) },
            at
        );

        if (!taken) {
            this.#log.warn({ event: 'enroll-taken', slug });

            throw new UnauthorizedException(REFUSAL);
        }

        this.#log.log({ event: 'enroll-granted', slug });

        return { tree: slug, name: invite.name, token };
    }

    /**
     * Чем зовётся клиент у ограничителя.
     *
     * Приём стоит за дорогой, и адрес клиента приходит заголовком: доверять ему можно ровно
     * потому, что дорога своя. Неопознанный клиент получает свой общий ключ, а не проходит мимо
     * предела: иначе обращения без адреса обходили бы его все разом.
     */
    #clientKey(request: IEnrollRequest): string {
        const forwarded: string | string[] | undefined = request.headers?.['x-forwarded-for'];
        const first: string = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '';

        return first || request.ip || 'неизвестен';
    }
}
