/**
 * Команды учётных записей: заведение, смена пароля, отключение и список.
 *
 * Операциями запроса они не делаются намеренно: заведение из веба — это ещё экран, право на него
 * и вопрос, кем заводится первая запись. Вход человека ни одной из этих команд не открывает —
 * такой операции у приёмника нет вовсе.
 *
 * Служба ничего не печатает и ничего не спрашивает: она отвечает строками, а печатает их и
 * спрашивает пароль вызывающий. Так решение проверяется вызовом, а пароль не уходит ни в
 * строку запуска, ни в журнал вместе с выводом.
 */
import { Injectable } from '@nestjs/common';

import {
    createAccount,
    disableAccount,
    findAccountByNameKey,
    IAccountForLogin,
    listAccounts,
    replaceAccountPassword,
} from '@rt/message-bus-api/accounts/data-access';
import {
    accountListLines,
    accountNameKey,
    accountNameOk,
    IAccountCommandParse,
    IAccountNamedCommand,
    parseAccountCommand,
    passwordHash,
    TAccountCommand,
} from '@rt/message-bus-api/accounts/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

/** Что команда напечатает и чем кончится. Строки печатает вызывающий, а не сама команда. */
export interface IAccountCommandReport {
    readonly lines: readonly string[];
    /** Кончилась ли команда отказом: по нему вызывающий выбирает код выхода. */
    readonly failed: boolean;
}

/** Чем команда спрашивает пароль. Возвращает пустое, если спросить не у кого. */
export type TPasswordPrompt = (question: string) => Promise<string>;

/** Отказ команды: одна строка причины и признак, по которому вызывающий выберет код выхода. */
function refusal(cause: string): IAccountCommandReport {
    return { lines: [cause], failed: true };
}

@Injectable()
export class AccountCommandsService {
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    /**
     * Разбор доводов и выполнение команды.
     *
     * Пароль приходит не доводом, а спрашивалкой: строка запуска остаётся в истории оболочки и в
     * списке процессов машины, и пароль, написанный доводом, виден там обоим.
     */
    public async run(argv: readonly string[], ask: TPasswordPrompt, at: Date = new Date()): Promise<IAccountCommandReport> {
        const parse: IAccountCommandParse = parseAccountCommand(argv);

        if (!parse.command) {
            return refusal(parse.fault ?? 'команда не разобрана');
        }

        const command: TAccountCommand = parse.command;

        switch (command.kind) {
            case 'add':
                return this.#add(command, ask);

            case 'passwd':
                return this.#passwd(command, ask);

            case 'disable':
                return this.#disable(command, at);

            default:
                return { lines: accountListLines(await listAccounts(this.#prisma)), failed: false };
        }
    }

    /**
     * Заведение записи.
     *
     * Занятое имя отбивает команду целиком: прежняя запись остаётся какая была, и её пароль цел —
     * иначе повторная команда молча меняла бы вход соседу.
     */
    async #add(command: IAccountNamedCommand, ask: TPasswordPrompt): Promise<IAccountCommandReport> {
        if (!accountNameOk(command.name)) {
            return refusal('имя учётной записи не может быть пустым');
        }

        const nameKey: string = accountNameKey(command.name);
        const taken: IAccountForLogin | null = await findAccountByNameKey(this.#prisma, nameKey);

        if (taken) {
            return refusal(`учётная запись «${taken.name}» уже заведена: имя занято, её пароль цел`);
        }

        const password: string = await ask(`пароль для «${command.name}»: `);

        if (!password) {
            return refusal('пароль не назван: запись не заведена');
        }

        await createAccount(this.#prisma, { nameKey, name: command.name.trim(), passwordHash: passwordHash(password) });

        return { lines: [`учётная запись заведена: «${command.name.trim()}»`], failed: false };
    }

    /** Смена пароля. Живые входы записи при этом не обрываются: пароль сменил их владелец. */
    async #passwd(command: IAccountNamedCommand, ask: TPasswordPrompt): Promise<IAccountCommandReport> {
        const account: IAccountForLogin | null = await findAccountByNameKey(this.#prisma, accountNameKey(command.name));

        if (!account) {
            return refusal(`учётной записи с именем «${command.name}» нет`);
        }

        const password: string = await ask(`новый пароль для «${account.name}»: `);

        if (!password) {
            return refusal('пароль не назван: прежний остался в силе');
        }

        await replaceAccountPassword(this.#prisma, account.id, passwordHash(password));

        return { lines: [`пароль записи «${account.name}» сменён; прежний больше не принимается`], failed: false };
    }

    /** Отключение записи вместе с обрывом её живых входов. */
    async #disable(command: IAccountNamedCommand, at: Date): Promise<IAccountCommandReport> {
        const account: IAccountForLogin | null = await findAccountByNameKey(this.#prisma, accountNameKey(command.name));

        if (!account) {
            return refusal(`учётной записи с именем «${command.name}» нет`);
        }

        if (account.disabledAt) {
            return refusal(`учётная запись «${account.name}» уже отключена`);
        }

        const broken: number = await disableAccount(this.#prisma, account.id, at);

        return {
            lines: [`учётная запись «${account.name}» отключена; оборвано входов: ${broken}`],
            failed: false,
        };
    }
}
