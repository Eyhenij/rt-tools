/**
 * Шапка разложенного файла: чем он положен, какой версией и то ли у него тело, которое пакет
 * клал.
 *
 * Разложенное коммитится — иначе его не видно ни в разборе ветки, ни на машине без установки
 * пакета. А раз коммитится, его правят руками: файл лежит в дереве проекта и выглядит обычным.
 * Правка при этом теряется на следующем `sync` молча, и «правило перестало действовать»
 * замечают уже по последствиям.
 *
 * Отсюда сумма тела в шапке. Она отвечает сразу на два вопроса, и оба нужны:
 *
 * - сумма не сходится с **фактическим** телом — файл правили руками;
 * - сумма не сходится со **свежесобранным** телом — разложенное отстало от пакета или от
 *   надстройки, и его надо переложить.
 */
import { createHash } from 'node:crypto';

export interface IStamp {
    readonly version: string;
    /** Идентификатор ресурса в пакете, он же путь надстройки. */
    readonly asset: string;
    /** Сумма тела, каким его положил пакет. */
    readonly hash: string;
}

export interface IStamped {
    readonly stamp: IStamp;
    readonly body: string;
}

/** Двенадцати шестнадцатеричных знаков хватает: шапку читает человек, а не сверяет сеть. */
export const digestOf: (text: string) => string = (text: string): string =>
    createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 12);

/**
 * Комментарий, невидимый при показе разметки, и обычный комментарий для всего остального.
 * Незнакомое расширение получает решётку: она комментарий в оболочке, в конфигах и в тексте, и
 * ошибиться ею дешевле, чем промолчать.
 */
interface IComment {
    readonly open: string;
    readonly close: string;
}

const COMMENTS: ReadonlyMap<string, IComment> = new Map<string, IComment>([
    ['md', { open: '<!-- ', close: ' -->' }],
    ['sh', { open: '# ', close: '' }],
    ['mjs', { open: '// ', close: '' }],
    ['js', { open: '// ', close: '' }],
    ['ts', { open: '// ', close: '' }],
]);

const commentOf: (path: string) => IComment = (path: string): IComment =>
    COMMENTS.get(path.split('.').pop() ?? '') ?? { open: '# ', close: '' };

const STAMP_LINE: RegExp = /rt-kit\s+v(\S+)\s+·\s+(\S+)\s+·\s+([0-9a-f]{12})/;

export function formatStamp(stamp: IStamp, path: string): string {
    const comment: IComment = commentOf(path);
    const text: string = `rt-kit v${stamp.version} · ${stamp.asset} · ${stamp.hash} · правится надстройкой, не здесь`;

    return `${comment.open}${text}${comment.close}`;
}

/**
 * С какой строки начинается тело, поверх которого встаёт шапка.
 *
 * Первой строкой шапка встать может не всегда. У скрипта первой идёт `#!` — иначе он перестаёт
 * запускаться. У скила первым идёт вступление между `---`, и оно обязано начинаться со строки
 * ноль: строка перед ним превращает вступление в обычный текст, скил теряет имя и описание и
 * перестаёт находиться вовсе — молча, потому что файл при этом остаётся читаемым.
 */
function bodyStart(lines: readonly string[]): number {
    if (lines[0]?.startsWith('#!')) {
        return 1;
    }
    if (lines[0]?.trim() !== '---') {
        return 0;
    }
    const closing: number = lines.findIndex((line: string, index: number): boolean => index > 0 && line.trim() === '---');

    return closing < 0 ? 0 : closing + 1;
}

/** Шапка и тело разложенного файла. Ищется она в двух строках от начала тела. */
export function readStamped(text: string): IStamped | null {
    const lines: string[] = text.split('\n');
    const from: number = bodyStart(lines);
    const offset: number = lines.slice(from, from + 2).findIndex((line: string): boolean => STAMP_LINE.test(line));
    if (offset < 0) {
        return null;
    }

    const index: number = from + offset;
    const found: RegExpMatchArray = lines[index].match(STAMP_LINE) as RegExpMatchArray;
    const [, version, asset, hash]: string[] = found;
    const body: string = [...lines.slice(0, index), ...lines.slice(index + 1)].join('\n');

    return { stamp: { version, asset, hash }, body };
}

/** Тело с шапкой: она встаёт после строки запуска и после вступления скила, иначе — первой. */
export function applyStamp(body: string, stamp: IStamp, path: string): string {
    const line: string = formatStamp(stamp, path);
    const lines: string[] = body.split('\n');
    const from: number = bodyStart(lines);

    return [...lines.slice(0, from), line, ...lines.slice(from)].join('\n');
}
