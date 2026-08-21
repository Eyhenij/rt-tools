/**
 * Отметка состояния груза: команда, которой исполнитель двигает свои записи в приёме.
 *
 * Разбор доводов и сборка пакета отделены от самого запроса нарочно — тем же приёмом, что и
 * отправка груза: спека подставляет двойник вызова и никуда не стучится, а всё, что можно
 * отбить до сети, отбивается до сети. Незнакомое состояние и вызов без записей — промахи
 * исполнителя, и запрос по ним не уходит вовсе.
 */
import { CARGO_SCHEMA_VERSION, CARGO_STATES, ICargoStateAccepted, ICargoStateBody, ICargoStateItem, TCargoStateKind } from './cargo.js';
import { IOutcomeOfCommand } from './commands.js';

/** Код возврата у всего, что не легло: отбитая строка кончает команду ненулевым кодом. */
const REFUSED: number = 1;

/** Довод, которым называется разбор происшествия. */
export const POSTMORTEM_FLAG: string = '--postmortem';

/** Довод, которым называется предложение. */
export const PROPOSAL_FLAG: string = '--proposal';

/** Довод текста починки: чем недочёт исправлен. */
export const FIX_FLAG: string = '--fix';

/** Что приём ответил на правку состояния. Отказ — такой же ответ, как принятое. */
export interface IMarked {
    readonly ok: boolean;
    /** Код ответа. Ноль — приём не ответил вовсе: не дозвонились, оборвалось, вышло время. */
    readonly status: number;
    readonly said: string;
    /** Ответ приёма. Пусто у отказа: два числа и отбитые строки он называет только у принятого. */
    readonly accepted: ICargoStateAccepted | null;
}

/** Чем отметка ходит в приём. Двойник в спеке — того же вида. */
export type TMarkCall = (intake: string, token: string, body: ICargoStateBody) => Promise<IMarked>;

/** Всё, что отметке нужно знать: куда, чем представиться и что отмечать. */
export interface IMarkOptions {
    readonly intake: string;
    readonly tree: string;
    readonly token: string;
    readonly state: string;
    readonly items: readonly ICargoStateItem[];
    readonly dryRun: boolean;
    readonly call: TMarkCall;
}

/** Род записи по доводу, которым её назвали. Не наш довод — пусто. */
function kindOfFlag(flag: string): TCargoStateKind | null {
    if (flag === POSTMORTEM_FLAG) {
        return 'postmortem';
    }

    return flag === PROPOSAL_FLAG ? 'proposal' : null;
}

/** Записи, названные доводами строки запуска: род у каждой свой, порядок — как их назвали. */
export function itemsOf(argv: readonly string[], state: string, fixNote: string = ''): readonly ICargoStateItem[] {
    const items: ICargoStateItem[] = [];

    for (let at: number = 0; at < argv.length; at += 1) {
        const kind: TCargoStateKind | null = kindOfFlag(argv[at]);
        const key: string = argv[at + 1] ?? '';

        if (kind && key && !key.startsWith('--')) {
            // Текст едет полем строки, а не своим вызовом: отметка о починке одна, и все её
            // записи чинились одним разбором — второй текст на тот же вызов не задаётся
            items.push(fixNote ? { kind, key, state, fixNote } : { kind, key, state });
        }
    }

    return items;
}

/** Отказ строками. */
function refusal(...lines: readonly string[]): IOutcomeOfCommand {
    return { code: REFUSED, lines: [...lines] };
}

/** Пакет одной строкой: её читает человек перед тем, как отправить. */
function describe(items: readonly ICargoStateItem[], state: string): string {
    const postmortems: number = items.filter((one: ICargoStateItem): boolean => one.kind === 'postmortem').length;

    return `в «${state}»: разборов ${postmortems}, предложений ${items.length - postmortems}`;
}

/** Отбитая строка человеку: род, ключ и причина словами. */
function deniedLine(kind: string, key: string, denial: string): string {
    const why: string = denial === 'missing' ? 'такой записи у дерева нет' : 'переход не разрешён порядком';

    return `  ${kind === 'postmortem' ? 'разбор' : 'предложение'} ${key} — ${why}`;
}

/**
 * Отметить записи дерева названным состоянием.
 *
 * Порядок отказов не случаен: сперва то, что видно без сети, — незнакомое состояние, пустой
 * вызов, отсутствующий токен, — и только потом запрос. Холостой ход стоит последним из них:
 * он показывает собранный пакет, а собрать его можно лишь после того, как доводы сошлись.
 */
export async function mark(options: IMarkOptions): Promise<IOutcomeOfCommand> {
    if (!CARGO_STATES.includes(options.state)) {
        return refusal(`состояния «${options.state}» не бывает`, `бывают: ${CARGO_STATES.join(', ')}`);
    }

    if (options.items.length === 0) {
        return refusal(
            'отмечать нечего: ни одной записи в доводах',
            `разбор называется \`${POSTMORTEM_FLAG} <имя файла>\`, предложение — \`${PROPOSAL_FLAG} <признак текста>\``
        );
    }

    if (!options.token) {
        return refusal(
            'токена дерева нет: отметка осталась неотправленной',
            'дерево заводится командой `enroll` — по коду приглашения либо токеном из админки приёма'
        );
    }

    const body: ICargoStateBody = {
        schema: CARGO_SCHEMA_VERSION,
        tree: options.tree,
        items: options.items,
    };

    if (options.dryRun) {
        return {
            code: 0,
            lines: [`уехало бы в ${options.intake}, дерево ${options.tree}:`, `  ${describe(options.items, options.state)}`],
        };
    }

    const marked: IMarked = await options.call(options.intake, options.token, body);

    if (!marked.ok || !marked.accepted) {
        return refusal(`${options.intake} ответил ${marked.status || 'молчанием'} — ${marked.said}`);
    }

    const { changed, same, denied }: ICargoStateAccepted = marked.accepted;
    const counted: string = `переведено ${changed}, уже стояло ${same}, отбито ${denied.length}`;

    return {
        code: denied.length ? REFUSED : 0,
        lines: [
            `отмечено в ${options.intake}, дерево ${options.tree}: ${counted}`,
            ...denied.map((one: { kind: string; key: string; denial: string }): string => deniedLine(one.kind, one.key, one.denial)),
        ],
    };
}
