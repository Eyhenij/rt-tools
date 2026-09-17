/**
 * Груз наблюдений: строки файлов дня за отрезок отправки — как лежат, по дням, плюс род скила у
 * каждой загрузки.
 *
 * Сводка отвечает «как дела сейчас» и теряет сессию и время при сведении; приёмнику, который
 * считает использование за период и по сессиям, нужны сами строки. Они читаются здесь отдельно от
 * сводки: та разбирает строку в свою форму без времени, а грузу время нужно.
 *
 * Род скила считает отправитель: только дерево знает свою раскладку, приём пакета не знает.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { IAsset } from './assets.js';
import { IObservationDay, IObservationLine, IObservationsCargo, OBSERVATION_EVENTS, TSkillKind } from './cargo.js';
import { dayBefore, OBSERVATIONS_DIR } from './observations.js';

/** Имя файла дня: `2026-08-12.jsonl`. Чужое имя в каталоге не наблюдение. */
const DAY_FILE: RegExp = /^(\d{4}-\d{2}-\d{2})\.jsonl$/;

/** Род скила по роду ресурса раскладки. Имя, которого раскладка не знает, — своё у дерева. */
const KIND_BY_ASSET: Readonly<Record<string, TSkillKind>> = { rules: 'rule', patterns: 'pattern', skills: 'skill' };

/**
 * Чем замещается имя ресурса, которого пакет не везёт.
 *
 * Своё правило дерево нередко зовёт своим же именем — `rt-tools-storybook` в дереве `rt-tools`, — и
 * тогда имя ресурса выдаёт адрес дерева. Проверка груза на утечку находила его и останавливала
 * отправку целиком: дерево с такими именами не отправляло ничего и никогда.
 *
 * Пакету имя чужого правила не пригодится: он его не везёт и статьи о нём не пишет. Что загрузка
 * была своей, приём и так читает полем рода рядом, а у отказа проверки рода нет — замещение идёт
 * у обоих, иначе имя уезжало бы второй записью.
 */
export const OWN_RESOURCE: string = 'own';

/** Везёт ли пакет ресурс с таким именем. Судятся все роды, а не одни скилы: имя хука тоже пакетное. */
function packaged(name: string, assets: readonly IAsset[]): boolean {
    return assets.some((asset: IAsset): boolean => asset.name === name);
}

/** Строка файла дня в строку груза. Битая или чужого рода — `null`: наблюдение не роняет груз. */
export function parseObservationLine(line: string): Omit<IObservationLine, 'skill'> | null {
    if (!line.trim()) {
        return null;
    }
    try {
        const found: Record<string, unknown> = JSON.parse(line) as Record<string, unknown>;
        const text: (key: string) => string = (key: string): string => {
            const value: unknown = found[key];

            return typeof value === 'string' ? value : '';
        };
        const ev: string = text('ev');

        if (!OBSERVATION_EVENTS.includes(ev) || !text('sid')) {
            return null;
        }
        const kind: string = text('kind');

        return { t: text('t'), ev, res: text('res'), ...(kind ? { kind } : {}), sid: text('sid'), v: text('v') };
    } catch {
        return null;
    }
}

/** Род загруженного скила по раскладке. */
export function skillKindOf(name: string, assets: readonly IAsset[]): TSkillKind {
    const laid: IAsset | undefined = assets.find((asset: IAsset): boolean => asset.name === name && asset.kind in KIND_BY_ASSET);

    return laid ? KIND_BY_ASSET[laid.kind] : 'own';
}

/** Строки одного файла дня, с родом скила у загрузок. */
export function linesOfDay(text: string, assets: readonly IAsset[]): readonly IObservationLine[] {
    const lines: IObservationLine[] = [];

    for (const raw of text.split('\n')) {
        const parsed: Omit<IObservationLine, 'skill'> | null = parseObservationLine(raw);

        if (parsed) {
            const named: Omit<IObservationLine, 'skill'> = packaged(parsed.res, assets) ? parsed : { ...parsed, res: OWN_RESOURCE };

            lines.push(named.ev === 'skill-load' ? { ...named, skill: skillKindOf(parsed.res, assets) } : named);
        }
    }

    return lines;
}

/**
 * Дни отрезка отправки: последние `days` дней по названному дню, включая его. Дни идут по
 * возрастанию; день без файла не входит — приёму нечего замещать.
 */
export function readObservationDays(root: string, today: string, days: number, assets: readonly IAsset[]): readonly IObservationDay[] {
    const dir: string = join(root, OBSERVATIONS_DIR);

    if (!existsSync(dir)) {
        return [];
    }
    const since: string = dayBefore(today, days - 1);
    // Дни записаны `ГГГГ-ММ-ДД`: порядок строк у них хронологический, и сравнение идёт строками.
    const inWindow: (day: string) => boolean = (day: string): boolean => day.localeCompare(since) >= 0 && day.localeCompare(today) <= 0;

    return readdirSync(dir)
        .map((name: string): string | null => DAY_FILE.exec(name)?.[1] ?? null)
        .filter((day: string | null): day is string => day !== null && inWindow(day))
        .sort((left: string, right: string): number => left.localeCompare(right))
        .map((day: string): IObservationDay => ({ day, lines: linesOfDay(readFileSync(join(dir, `${day}.jsonl`), 'utf8'), assets) }));
}

/** Признак рабочей копии: контрольная сумма её корня. Сам путь наружу не уезжает. */
export function originOf(root: string): string {
    return createHash('sha1').update(root).digest('hex').slice(0, 12);
}

/** Груз из дней. */
export function observationsCargo(tree: string, schema: string, root: string, days: readonly IObservationDay[]): IObservationsCargo {
    return { tree, schema, days, origin: originOf(root) };
}

/** Сколько строк в грузе. */
export function linesTotal(cargo: IObservationsCargo): number {
    return cargo.days.reduce((sum: number, day: IObservationDay): number => sum + day.lines.length, 0);
}
