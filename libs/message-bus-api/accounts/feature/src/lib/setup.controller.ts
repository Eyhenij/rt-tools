/**
 * Первая запись узла.
 *
 * Свежий узел без единой записи иначе не имеет входа: записи заводит раздел людей, а в него не
 * войти без записи. Две операции закрывают эту дыру: ответ, ждёт ли узел первой записи, и её
 * заведение. Обе открыты без входа по устройству — входить ещё некому — и обе отвечают отказом,
 * как только в хранилище есть хоть одна запись: экран первичной настройки закрыт навсегда, и
 * запрос мимо экрана отбивается так же.
 *
 * Первая запись получает роль владельца, которая приезжает с приёмником миграцией: первый человек
 * без права вошёл бы и не увидел ничего, а дать ему роль было бы некому. Вход выдаётся тем же
 * запросом: пару только что набрали, и просить её второй раз — второй экран ни для чего.
 */
import { BadRequestException, Body, ConflictException, Controller, Get, HttpCode, HttpStatus, Logger, Post, Res } from '@nestjs/common';

import { PublicOperation } from '@rt/message-bus-api/access/util';
import { countAccounts, createFirstAccount, findRoleRef, IRoleRef } from '@rt/message-bus-api/accounts/data-access';
import { accountNameKey, INewPersonParse, newPersonOf, passwordHash } from '@rt/message-bus-api/accounts/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

import { ICookieBearingResponse, ISessionAnswer, issueSignIn } from './sign-in-issue';
import { ERefusal, refusalBody } from '@rt/message-bus-common';

/** Ключ роли владельца: её заводит миграция, и по этому ключу её ищет заведение. */
export const OWNER_ROLE_KEY: string = 'owner';

/** Ждёт ли узел первой записи. Одно слово, и ничего больше: пустое хранилище — не тайна. */
export interface ISetupAnswer {
    readonly open: boolean;
}

@Controller('setup')
export class SetupController {
    readonly #log: Logger = new Logger(SetupController.name);
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    /** Открыта без входа по устройству: спрашивает её тот, кому входить ещё нечем. */
    @Get()
    @PublicOperation()
    public async open(): Promise<ISetupAnswer> {
        return { open: (await countAccounts(this.#prisma)) === 0 };
    }

    /**
     * Заведение первой записи и вход ею.
     *
     * Открыта без входа по устройству — по той же причине, что и ответ выше. Ограничителя частоты
     * у неё нет: с первой же записью она отвечает отказом на что угодно, и подбирать здесь нечего.
     */
    @Post()
    @PublicOperation()
    @HttpCode(HttpStatus.OK)
    public async create(@Body() body: unknown, @Res({ passthrough: true }) response: ICookieBearingResponse): Promise<ISessionAnswer> {
        if ((await countAccounts(this.#prisma)) > 0) {
            throw new ConflictException(refusalBody(ERefusal.SetupClosed));
        }

        const parsed: INewPersonParse = newPersonOf(body);

        if (parsed.fault !== null || parsed.input === null) {
            throw new BadRequestException(refusalBody(parsed.fault ?? ERefusal.PersonNameEmpty));
        }

        const owner: IRoleRef | null = await findRoleRef(this.#prisma, OWNER_ROLE_KEY);

        if (owner === null) {
            throw new ConflictException(refusalBody(ERefusal.OwnerRoleMissing, { key: OWNER_ROLE_KEY }));
        }

        const nameKey: string = accountNameKey(parsed.input.name);
        const id: string | null = await createFirstAccount(
            this.#prisma,
            { nameKey, name: parsed.input.name, passwordHash: passwordHash(parsed.input.password) },
            owner.id
        );

        // Второй первый запрос: счёт внутри сделки увидел запись первого, и записано ничего не было
        if (id === null) {
            throw new ConflictException(refusalBody(ERefusal.SetupClosed));
        }

        // В журнал уходит имя и только оно: ни пароля, ни его хеша
        this.#log.log({ event: 'first-account-created', name: parsed.input.name });

        return issueSignIn(this.#prisma, response, { id, name: parsed.input.name }, new Date());
    }
}
