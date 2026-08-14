/**
 * Команды деревьев: разбор доводов строки запуска.
 *
 * Заведение и отзыв токена операцией запроса не делаются — токен дерева зовёт только приём
 * груза. Поэтому доводы разбирает не каркас отдачи, а чистая функция: у неё нет ни запроса, ни
 * хранилища, и проверяется она вызовом.
 *
 * Отказ разбора — тоже её ответ, а не исключение: команду печатает вызывающий, и причина
 * отказа для него такой же вывод, как напечатанный токен.
 */

/** Что команда делает. Набор закрыт: доводом, которого здесь нет, приёмник не управляется. */
export type TTreeCommandKind = 'add' | 'token' | 'revoke' | 'list';

/** Заведение дерева: читаемое имя и признак, которым дерево называет себя в грузе. */
export interface ITreeAddCommand {
    readonly kind: 'add';
    readonly name: string;
    readonly slug: string;
}

/** Команда, которой довод — одно только имя дерева: выдача нового токена и отзыв прежнего. */
export interface ITreeNamedCommand {
    readonly kind: 'token' | 'revoke';
    readonly name: string;
}

/** Список деревьев: доводов у него нет вовсе. */
export interface ITreeListCommand {
    readonly kind: 'list';
}

/** Разобранная команда деревьев. */
export type TTreeCommand = ITreeAddCommand | ITreeNamedCommand | ITreeListCommand;

/** Что вышло из разбора доводов. Одно из двух полей пусто всегда. */
export interface ITreeCommandParse {
    /** Разобранная команда. Пусто — доводы не сошлись, и причина названа в `fault`. */
    readonly command: TTreeCommand | null;
    /** Причина отказа. Её печатает вызывающий; пусто — команда разобрана. */
    readonly fault: string | null;
}

/** Что команда напечатает и чем кончится. Строки печатает вызывающий, а не сама команда. */
export interface ITreeCommandReport {
    readonly lines: readonly string[];
    /** Кончилась ли команда отказом: по нему вызывающий выбирает код выхода. */
    readonly failed: boolean;
}

/** Перечень команд. Печатается на незнакомом доводе — иначе о нём остаётся только гадать. */
export const TREE_COMMANDS_USAGE: readonly string[] = [
    'команды деревьев:',
    '  tree:add <имя> <признак>  — завести дерево и напечатать его токен один раз',
    '  tree:token <имя>          — выдать новый токен, отозвав прежний',
    '  tree:revoke <имя>         — отозвать токен дерева',
    '  tree:list                 — перечислить деревья',
];

/** Довод без окружающих пробелов. Пустой довод считается неназванным. */
function argument(argv: readonly string[], at: number): string {
    return (argv[at] ?? '').trim();
}

/** Разобранная команда — ответ без отказа. */
function parsed(command: TTreeCommand): ITreeCommandParse {
    return { command, fault: null };
}

/** Отказ разбора — ответ без команды. */
function refused(fault: string): ITreeCommandParse {
    return { command: null, fault };
}

/**
 * Заведение дерева. Признак называется здесь, а не берётся из первого груза: приёмник, узнавший
 * признак из груза, принял бы за своё то, что прислали.
 */
function parseAdd(name: string, slug: string): ITreeCommandParse {
    if (!name) {
        return refused('tree:add требует имя дерева первым доводом');
    }

    if (!slug) {
        return refused('признак дерева обязателен: он называется при заведении, а не берётся из первого груза');
    }

    return parsed({ kind: 'add', name, slug });
}

/**
 * Команда деревьев из доводов строки запуска.
 *
 * Ждёт доводы без имени самой программы: `['tree:add', 'Моё дерево', 'my-tree']`.
 */
export function parseTreeCommand(argv: readonly string[]): ITreeCommandParse {
    const verb: string = argument(argv, 0);
    const name: string = argument(argv, 1);

    switch (verb) {
        case 'tree:add':
            return parseAdd(name, argument(argv, 2));

        case 'tree:token':
        case 'tree:revoke':
            return name ? parsed({ kind: verb === 'tree:token' ? 'token' : 'revoke', name }) : refused(`${verb} требует имя дерева`);

        case 'tree:list':
            return parsed({ kind: 'list' });

        default:
            return refused([`незнакомая команда: ${verb || '(не названа)'}`, ...TREE_COMMANDS_USAGE].join('\n'));
    }
}
