/**
 * Команды учётных записей: разбор доводов строки запуска.
 *
 * Записи заводятся, меняют пароль и отключаются только отсюда — заведение из веба потребовало бы
 * экрана, права на него и ответа на вопрос, кем заводится первая запись. Доводы поэтому разбирает
 * не каркас отдачи, а чистая функция: у неё нет ни запроса, ни хранилища, и проверяется она
 * вызовом.
 *
 * Пароль доводом не приходит вовсе: строка запуска остаётся в истории оболочки и в списке
 * процессов машины. Его спрашивает тот, кто команду исполняет.
 */

/** Что команда делает. Набор закрыт: доводом, которого здесь нет, приёмник не управляется. */
export type TAccountCommandKind = 'add' | 'passwd' | 'disable' | 'list';

/** Команда, которой довод — имя записи: заведение, смена пароля, отключение. */
export interface IAccountNamedCommand {
    readonly kind: 'add' | 'passwd' | 'disable';
    readonly name: string;
}

/** Список записей: доводов у него нет вовсе. */
export interface IAccountListCommand {
    readonly kind: 'list';
}

/** Разобранная команда учётных записей. */
export type TAccountCommand = IAccountNamedCommand | IAccountListCommand;

/** Что вышло из разбора доводов. Одно из двух полей пусто всегда. */
export interface IAccountCommandParse {
    /** Разобранная команда. Пусто — доводы не сошлись, и причина названа в `fault`. */
    readonly command: TAccountCommand | null;
    /** Причина отказа. Её печатает вызывающий; пусто — команда разобрана. */
    readonly fault: string | null;
}

/** Перечень команд. Печатается на незнакомом доводе — иначе о нём остаётся только гадать. */
export const ACCOUNT_COMMANDS_USAGE: readonly string[] = [
    'команды учётных записей:',
    '  account:add <имя>      — завести запись; пароль спрашивается, а не пишется доводом',
    '  account:passwd <имя>   — сменить пароль записи',
    '  account:disable <имя>  — отключить запись и оборвать её входы',
    '  account:list           — перечислить записи',
];

/** Довод без окружающих пробелов. Пустой довод считается неназванным. */
function argument(argv: readonly string[], at: number): string {
    return (argv[at] ?? '').trim();
}

/** Знает ли разбор такой довод. По нему точка входа выбирает, чьи это команды. */
export function isAccountCommand(verb: string): boolean {
    return verb.startsWith('account:');
}

/**
 * Команда учётных записей из доводов строки запуска.
 *
 * Ждёт доводы без имени самой программы: `['account:add', 'Владелец']`.
 */
export function parseAccountCommand(argv: readonly string[]): IAccountCommandParse {
    const verb: string = argument(argv, 0);
    const name: string = argument(argv, 1);

    switch (verb) {
        case 'account:add':
        case 'account:passwd':
        case 'account:disable': {
            if (!name) {
                return { command: null, fault: `${verb} требует имя учётной записи` };
            }

            const kind: 'add' | 'passwd' | 'disable' = verb === 'account:add' ? 'add' : verb === 'account:passwd' ? 'passwd' : 'disable';

            return { command: { kind, name }, fault: null };
        }

        case 'account:list':
            return { command: { kind: 'list' }, fault: null };

        default:
            return {
                command: null,
                fault: [`незнакомая команда: ${verb || '(не названа)'}`, ...ACCOUNT_COMMANDS_USAGE].join('\n'),
            };
    }
}
