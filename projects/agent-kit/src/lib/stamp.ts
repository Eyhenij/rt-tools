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
 * Шапка и тело разложенного файла. Ищется она в первых двух строках: у скрипта первой стоит
 * `#!`, и требовать шапку строго первой значило бы ломать запуск.
 */
export function readStamped(text: string): IStamped | null {
    const lines: string[] = text.split('\n');
    const index: number = lines.slice(0, 2).findIndex((line: string): boolean => STAMP_LINE.test(line));
    if (index < 0) {
        return null;
    }

    const found: RegExpMatchArray = lines[index].match(STAMP_LINE) as RegExpMatchArray;
    const [, version, asset, hash]: string[] = found;
    const body: string = [...lines.slice(0, index), ...lines.slice(index + 1)].join('\n');

    return { stamp: { version, asset, hash }, body };
}

/** Тело с шапкой: у скрипта она встаёт после строки запуска, у остальных — первой. */
export function applyStamp(body: string, stamp: IStamp, path: string): string {
    const line: string = formatStamp(stamp, path);
    if (body.startsWith('#!')) {
        const cut: number = body.indexOf('\n');

        return `${body.slice(0, cut + 1)}${line}\n${body.slice(cut + 1)}`;
    }

    return `${line}\n${body}`;
}
