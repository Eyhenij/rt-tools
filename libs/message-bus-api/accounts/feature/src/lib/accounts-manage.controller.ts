/**
 * `POST /api/accounts`, `POST /api/accounts/:name/password` и `POST /api/accounts/:name/disable` —
 * правки над учётными записями из раздела людей.
 *
 * Закрыты правом на правку людей, а не правом чтения: список говорит, кто дотягивается до груза,
 * а менять, кто дотягивается, — право своё. Отдельным контроллером от чтения: тот отвечает
 * страницей и закрыт другим правом, и решать про доступ дважды в одном файле незачем.
 *
 * Каждая операция отвечает строкой списка после правки: экран показывает то, что лежит в
 * хранилище, а не то, что он послал. Отказы говорят словами про действие человека — занятое имя,
 * пустой пароль, своя запись, — и слово уходит в панель как есть.
 *
 * Те же правки умеют команды строки запуска; их снятие — задача следом. Пока обе стороны стоят
 * рядом, сами правки лежат в слое доступа к данным, и обе зовут их оттуда.
 */
import { BadRequestException, Body, ConflictException, Controller, Logger, NotFoundException, Param, Post, Req } from '@nestjs/common';

import { RequiresRight } from '@rt/message-bus-api/access/util';
import {
    createAccount,
    disableAccount,
    findAccountByNameKey,
    findPersonByNameKey,
    IAccountForLogin,
    replaceAccountPassword,
} from '@rt/message-bus-api/accounts/data-access';
import {
    accountNameKey,
    accountOf,
    IAccountBearingRequest,
    INewPersonParse,
    IPasswordParse,
    newPersonOf,
    passwordHash,
    passwordOf,
} from '@rt/message-bus-api/accounts/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { ERefusal, IPersonView, refusalBody, TRight } from '@rt/message-bus-common';

/** Право, которым закрыты все три правки: одно на контроллер, чтобы три объявления не разошлись. */
const MANAGE_RIGHT: TRight = 'accounts:manage';

@Controller('accounts')
export class AccountsManageController {
    readonly #prisma: PrismaService;
    readonly #log: Logger = new Logger(AccountsManageController.name);

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    /**
     * Заведение записи по имени и первому паролю.
     *
     * Занятое имя отбивается целиком, и прежняя запись остаётся какая была: иначе повторное
     * заведение молча меняло бы вход соседу. Имя сравнивается так же, как его сравнивает вход, —
     * приведённым видом, а не буквами.
     */
    @Post()
    @RequiresRight(MANAGE_RIGHT)
    public async create(@Body() body: unknown): Promise<IPersonView> {
        const parsed: INewPersonParse = newPersonOf(body);

        if (parsed.fault !== null || parsed.input === null) {
            throw new BadRequestException(refusalBody(parsed.fault ?? ERefusal.PersonNameEmpty));
        }

        const nameKey: string = accountNameKey(parsed.input.name);
        const taken: IAccountForLogin | null = await findAccountByNameKey(this.#prisma, nameKey);

        if (taken) {
            throw new ConflictException(refusalBody(ERefusal.AccountNameTaken, { name: taken.name }));
        }

        await createAccount(this.#prisma, { nameKey, name: parsed.input.name, passwordHash: passwordHash(parsed.input.password) });

        // В журнал уходит имя и только оно: ни пароля, ни его хеша — строка лога переживает и
        // выкатку, и снятый дамп
        this.#log.log({ event: 'account-created', name: parsed.input.name });

        return this.#rowOf(nameKey);
    }

    /**
     * Новый пароль записи.
     *
     * Живые входы записи не обрываются: пароль сменил тот, кто заведует записями, а человек
     * посреди работы от этого не вылетает. Пустой пароль отбивается словами о пароле.
     */
    @Post(':name/password')
    @RequiresRight(MANAGE_RIGHT)
    public async replacePassword(@Param('name') name: string, @Body() body: unknown): Promise<IPersonView> {
        const parsed: IPasswordParse = passwordOf(body);

        if (parsed.fault !== null) {
            throw new BadRequestException(refusalBody(parsed.fault));
        }

        const account: IAccountForLogin = await this.#accountNamed(name);

        await replaceAccountPassword(this.#prisma, account.id, passwordHash(parsed.password));
        this.#log.log({ event: 'account-password-replaced', name: account.name });

        return this.#rowOf(accountNameKey(name));
    }

    /**
     * Отключение записи вместе с обрывом её живых входов.
     *
     * Своя запись не отключается: обрыв касается и того входа, которым пришли, и человек выбил
     * бы себя же той же секундой. Уже отключённая не отключается второй раз — второе отключение
     * переписало бы время первого.
     *
     * Момент приходит последним доводом, а не читается часами внутри: им ставится время
     * отключения, и спека проверяет его вызовом. Каркас отдачи этот довод не заполняет — у него
     * нет метки, — и в бою работает умолчание.
     */
    @Post(':name/disable')
    @RequiresRight(MANAGE_RIGHT)
    public async disable(@Param('name') name: string, @Req() request: IAccountBearingRequest, at: Date = new Date()): Promise<IPersonView> {
        const account: IAccountForLogin = await this.#accountNamed(name);

        if (account.id === accountOf(request).id) {
            throw new ConflictException(refusalBody(ERefusal.AccountSelfDisable));
        }

        if (account.disabledAt) {
            throw new ConflictException(refusalBody(ERefusal.AccountAlreadyOff, { name: account.name }));
        }

        const broken: number = await disableAccount(this.#prisma, account.id, at);

        this.#log.log({ event: 'account-disabled', name: account.name, sessionsRevoked: broken });

        return this.#rowOf(accountNameKey(name));
    }

    /** Запись по названному имени. Нет такой — «не найдено»: править нечего. */
    async #accountNamed(name: string): Promise<IAccountForLogin> {
        const account: IAccountForLogin | null = await findAccountByNameKey(this.#prisma, accountNameKey(name));

        if (!account) {
            throw new NotFoundException(refusalBody(ERefusal.AccountNotFound, { name }));
        }

        return account;
    }

    /**
     * Строка списка после правки. Пустота здесь — дефект, а не отказ: запись только что нашли
     * или завели, и её пропажа между двумя запросами означает чужую правку в ту же секунду.
     */
    async #rowOf(nameKey: string): Promise<IPersonView> {
        const row: IPersonView | null = await findPersonByNameKey(this.#prisma, nameKey);

        if (!row) {
            throw new NotFoundException(refusalBody(ERefusal.AccountGone));
        }

        return row;
    }
}
