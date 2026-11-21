/**
 * Польза проверок набора перед пушем: по каждой проверке — запуски и секунды, отказы, ложные отказы,
 * лишние запуски и цена найденного дефекта.
 *
 * Источник — отметки дня `runs-<день>`, а не наблюдения. Они хранят подпись содержимого и сумму
 * команды по каждому запуску, а наблюдение уходит наружу и команды нести не может. Строка запуска
 * пишется хуком `metric-marks.sh`: подпись, сумма проверки, исход, секунды, момент, сумма базы,
 * отметка предмета. Строка, записанная до этой работы, несёт первые четыре поля.
 *
 * Ложный отказ — красный запуск, после которого та же проверка на той же подписи прошла зелёной:
 * это слова просьбы «повтор на том же дереве прошёл зелёным». Настоящий — красный без такого
 * повтора.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { marksDir } from './metric-send-mark.js';
import { dayBefore } from './observations.js';
import { callProfile, shellPath } from './push-gate.js';

/** Отметка предмета в строке запуска. */
export enum ESubjectMark {
    Touched = 'touched',
    Idle = 'idle',
    Unknown = 'unknown',
    NotRun = 'not-run',
}

/** Одна строка отметки дня. */
export interface IRunLine {
    readonly sign: string;
    readonly id: string;
    readonly outcome: string;
    readonly seconds: number;
    /** Нет поля: строка записана до этой работы. */
    readonly subject: ESubjectMark | null;
}

/** Польза одной проверки за отрезок. */
export interface ICheckUsefulness {
    readonly id: string;
    /** Команда из текущего набора; `null` — команды в наборе уже нет, печатается сумма. */
    readonly name: string | null;
    readonly runs: number;
    readonly seconds: number;
    readonly refusals: number;
    readonly falseRefusals: number;
    readonly realRefusals: number;
    /** `null`: предмет проверки не записан ни в одной строке отрезка. */
    readonly idle: number | null;
    readonly notRun: number;
    /** Секунды на один настоящий отказ; `null` — настоящих отказов нет. */
    readonly secondsPerDefect: number | null;
}

export interface IPushSetUsefulness {
    readonly checks: readonly ICheckUsefulness[];
    /** Ни разу не отказали по делу, по секундам. */
    readonly neverUseful: readonly ICheckUsefulness[];
    /** Ложных отказов больше настоящих, по секундам. */
    readonly falseOverReal: readonly ICheckUsefulness[];
}

const SUBJECTS: ReadonlyMap<string, ESubjectMark> = new Map(
    Object.values(ESubjectMark).map((mark: ESubjectMark): [string, ESubjectMark] => [mark, mark])
);
const BASE_MARK: string = '<base>';
const RED: string = 'red';
const GREEN: string = 'green';
/** Суммы нескольких десятков строк: одна оболочка, по два вызова `cksum` на строку. */
const SUMS_TIMEOUT_MS: number = 20_000;

/** Строки одной отметки дня; строка короче четырёх полей пропускается. */
export function parseRunLines(text: string): readonly IRunLine[] {
    return text
        .split('\n')
        .map((line: string): string[] => line.trim().split(/\s+/))
        .filter((fields: string[]): boolean => fields.length >= 4 && /^\d+$/.test(fields[3]))
        .map((fields: string[]): IRunLine => ({
            sign: fields[0],
            id: fields[1],
            outcome: fields[2],
            seconds: Number(fields[3]),
            subject: (fields.length >= 7 && SUBJECTS.get(fields[6])) || null,
        }));
}

/** Красные запуски строк одной проверки, разделённые на ложные и настоящие. */
function refusalsOf(lines: readonly IRunLine[]): { readonly falseRefusals: number; readonly realRefusals: number } {
    let falseRefusals: number = 0;
    let realRefusals: number = 0;
    lines.forEach((line: IRunLine, at: number): void => {
        if (line.outcome !== RED) {
            return;
        }
        const repaired: boolean = lines.slice(at + 1).some((next: IRunLine): boolean => next.sign === line.sign && next.outcome === GREEN);
        if (repaired) {
            falseRefusals += 1;
        } else {
            realRefusals += 1;
        }
    });

    return { falseRefusals, realRefusals };
}

function bySeconds(left: ICheckUsefulness, right: ICheckUsefulness): number {
    return right.seconds - left.seconds || left.id.localeCompare(right.id);
}

function checkOf(id: string, own: readonly IRunLine[], names: ReadonlyMap<string, string>): ICheckUsefulness {
    const ran: readonly IRunLine[] = own.filter((line: IRunLine): boolean => line.outcome !== String(ESubjectMark.NotRun));
    const { falseRefusals, realRefusals } = refusalsOf(ran);
    const seconds: number = ran.reduce((sum: number, line: IRunLine): number => sum + line.seconds, 0);
    const judged: readonly IRunLine[] = ran.filter(
        (line: IRunLine): boolean => line.subject === ESubjectMark.Touched || line.subject === ESubjectMark.Idle
    );

    return {
        id,
        seconds,
        falseRefusals,
        realRefusals,
        name: names.get(id) ?? null,
        runs: ran.length,
        refusals: falseRefusals + realRefusals,
        idle: judged.length ? judged.filter((line: IRunLine): boolean => line.subject === ESubjectMark.Idle).length : null,
        notRun: own.length - ran.length,
        secondsPerDefect: realRefusals ? Math.round(seconds / realRefusals) : null,
    };
}

/**
 * Польза каждой проверки по строкам отрезка в порядке записи. Сумма имени — та, под которой
 * проверка записана; старые суммы с базой внутри приводятся к общей картой `aliases`.
 */
export function usefulnessOf(
    lines: readonly IRunLine[],
    names: ReadonlyMap<string, string>,
    aliases: ReadonlyMap<string, string> = new Map()
): IPushSetUsefulness {
    const byCheck: Map<string, IRunLine[]> = new Map();
    for (const line of lines) {
        const id: string = aliases.get(line.id) ?? line.id;
        byCheck.set(id, [...(byCheck.get(id) ?? []), line]);
    }
    const sorted: ICheckUsefulness[] = [...byCheck.entries()]
        .map(([id, own]: [string, IRunLine[]]): ICheckUsefulness => checkOf(id, own, names))
        .sort(bySeconds);

    return {
        checks: sorted,
        neverUseful: sorted.filter((check: ICheckUsefulness): boolean => check.runs > 0 && check.realRefusals === 0),
        falseOverReal: sorted.filter((check: ICheckUsefulness): boolean => check.falseRefusals > check.realRefusals),
    };
}

/** Две суммы одной строки: под какой проверка пишется сейчас и под какой писалась до этой работы. */
export interface ICheckSums {
    /** Сумма команды без базы — `rt_check_id` хука. */
    readonly id: string;
    /** Сумма команды целиком, с базой внутри: так писала строка из четырёх полей. */
    readonly raw: string;
}

/** Суммы по строкам команд; строка, для которой суммы нет, в карту не попадает. */
export type TSumsOf = (texts: readonly string[]) => ReadonlyMap<string, ICheckSums>;

/**
 * Суммы считает хук, который их пишет. Своя копия расчёта расходится с ним молча: обе стороны
 * остаются зелёными, одна пишет под своей суммой, другая ищет под своей.
 */
export function hookSumsOf(root: string, hooks: string): TSumsOf {
    const marks: string = JSON.stringify(join(root, hooks, 'metric-marks.sh'));
    const script: string =
        `. ${marks} 2>/dev/null; command -v rt_check_id >/dev/null 2>&1 || exit 3; ` +
        `while IFS= read -r line; do printf '%s %s\\n' "$(rt_check_id "$line")" "$(printf '%s' "$line" | cksum | cut -d' ' -f1)"; done`;

    return (texts: readonly string[]): ReadonlyMap<string, ICheckSums> => {
        try {
            const out: readonly string[] = execFileSync(shellPath(), ['-c', script], {
                cwd: root,
                encoding: 'utf8',
                input: texts.map((text: string): string => `${text}\n`).join(''),
                stdio: ['pipe', 'pipe', 'ignore'],
                timeout: SUMS_TIMEOUT_MS,
            }).split('\n');

            return new Map(
                texts
                    .map((text: string, at: number): [string, ICheckSums] => {
                        const fields: readonly string[] = (out[at] ?? '').split(' ');

                        return [text, { id: fields[0] ?? '', raw: fields[1] ?? '' }];
                    })
                    .filter(([, sums]: [string, ICheckSums]): boolean => /^\d+$/.test(sums.id) && /^\d+$/.test(sums.raw))
            );
        } catch {
            return new Map();
        }
    };
}

/** Команды набора и те же команды с каждой базой на месте метки: так их писали строки с базой. */
function textsOf(commands: readonly string[], bases: readonly string[]): readonly string[] {
    return commands.flatMap((command: string): string[] =>
        command.includes(BASE_MARK) ? [command, ...bases.map((base: string): string => command.split(BASE_MARK).join(base))] : [command]
    );
}

/**
 * Имена проверок по суммам и карта старых сумм — с базой внутри — к общей. Имя — первая форма
 * команды, которую печатает профиль: форма без базы идёт первой.
 */
export function namesOf(
    commands: readonly string[],
    bases: readonly string[],
    sumsOf: TSumsOf
): { readonly names: ReadonlyMap<string, string>; readonly aliases: ReadonlyMap<string, string> } {
    const sums: ReadonlyMap<string, ICheckSums> = sumsOf(textsOf(commands, bases));
    const names: Map<string, string> = new Map();
    const aliases: Map<string, string> = new Map();
    for (const command of commands) {
        const own: ICheckSums | undefined = sums.get(command);
        if (!own) {
            continue;
        }
        if (!names.has(own.id)) {
            names.set(own.id, command);
        }
        for (const text of textsOf([command], bases)) {
            const raw: string | undefined = sums.get(text)?.raw;
            if (raw) {
                aliases.set(raw, own.id);
            }
        }
    }

    return { names, aliases };
}

function gitBases(root: string): readonly string[] {
    try {
        // eslint-disable-next-line sonarjs/no-os-command-from-path -- путь к git у каждой машины свой, и пакет его не знает
        return execFileSync('git', ['for-each-ref', '--format=%(refname:short)', 'refs/remotes', 'refs/heads'], {
            cwd: root,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        })
            .split('\n')
            .filter(Boolean);
    } catch {
        return [];
    }
}

/** Где у дерева лежат умолчания профиля и разложенные хуки. */
export interface IPushSetLayout {
    readonly defaults: string;
    readonly hooks: string;
}

/** Польза проверок набора за отрезок, по отметкам дерева. */
export function pushSetUsefulnessOf(root: string, layout: IPushSetLayout, until: string, days: number): IPushSetUsefulness {
    const lines: IRunLine[] = [];
    for (let back: number = days - 1; back >= 0; back -= 1) {
        const file: string = join(marksDir(root), `runs-${dayBefore(until, back)}`);
        if (existsSync(file)) {
            lines.push(...parseRunLines(readFileSync(file, 'utf8')));
        }
    }
    // Набор печатается и без базы, и с меткой базы: с меткой профиль называет шаги своей формой с
    // базой, без неё — те, что ветвятся по вкладу ветки.
    const commands: readonly string[] = [
        ...new Set([
            ...(callProfile(root, layout.defaults, 'rt_push_checks') ?? []),
            ...(callProfile(root, layout.defaults, 'rt_push_checks', BASE_MARK) ?? []),
        ]),
    ];
    const { names, aliases } = namesOf(commands, gitBases(root), hookSumsOf(root, layout.hooks));

    return usefulnessOf(lines, names, aliases);
}

function nameOf(check: ICheckUsefulness): string {
    return check.name ?? `сумма ${check.id}`;
}

function checkLine(check: ICheckUsefulness): string {
    const idle: string = check.idle === null ? 'предмет не записан' : `лишних ${check.idle}`;
    const notRun: string = check.notRun ? `, не запускалась ${check.notRun}` : '';
    const price: string = check.secondsPerDefect === null ? 'ни одного дефекта' : `секунд на дефект ${check.secondsPerDefect}`;

    return `  ${nameOf(check)}: запусков ${check.runs}, секунд ${check.seconds}, отказов ${check.refusals}, ложных ${check.falseRefusals}, ${idle}${notRun}, ${price}`;
}

/** Раздел отчёта; без строк запусков раздела нет. */
export function pushSetLines(usefulness: IPushSetUsefulness): readonly string[] {
    if (!usefulness.checks.length) {
        return [];
    }
    const unnamed: number = usefulness.checks.filter((check: ICheckUsefulness): boolean => check.name === null).length;
    const gone: string = unnamed ? `, из них нет в нынешнем наборе ${unnamed}` : '';

    return [
        '',
        `Проверки набора: ${usefulness.checks.length}${gone}`,
        ...usefulness.checks.map(checkLine),
        `ни разу не отказали по делу: ${usefulness.neverUseful.length}`,
        ...usefulness.neverUseful.map((check: ICheckUsefulness): string => `  ${nameOf(check)}: секунд ${check.seconds}`),
        `ложных больше настоящих: ${usefulness.falseOverReal.length}`,
        ...usefulness.falseOverReal.map(
            (check: ICheckUsefulness): string =>
                `  ${nameOf(check)}: ложных ${check.falseRefusals}, настоящих ${check.realRefusals}, секунд ${check.seconds}`
        ),
    ];
}
