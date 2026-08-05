/**
 * Что случится с одним файлом на раскладке — решение без обращения к диску.
 *
 * Отделено от чтения и записи потому, что решений здесь пять, а различить их надо до того, как
 * что-нибудь записано: `sync --check` в гейте пуша ничего не пишет вовсе, а обычный `sync`
 * обязан отказаться от файла, который правили руками, а не молча его переписать.
 */
import { applyStamp, digestOf, IStamp, IStamped, readStamped } from './stamp.js';

export type TOutcome =
    /** Файла нет — положить. */
    | 'create'
    /** Разложенное отстало от пакета или от надстройки — переложить. */
    | 'update'
    /** Тело не сходится с шапкой: файл правили руками. */
    | 'drift'
    /** Файл есть, шапки нет — положен не пакетом, трогать нельзя. */
    | 'foreign'
    /** Сходится всё. */
    | 'ok';

export interface IPlanInput {
    readonly path: string;
    readonly asset: string;
    readonly version: string;
    /** Тело после подстановки значений и слияния с надстройкой. */
    readonly rendered: string;
    /** Что лежит на этом пути сейчас; `null` — файла нет. */
    readonly existing: string | null;
}

export interface IPlanned {
    readonly path: string;
    readonly asset: string;
    readonly outcome: TOutcome;
    /** Что записать. У `drift`, `foreign` и `ok` записывать нечего. */
    readonly content: string | null;
}

export function planFile(input: IPlanInput): IPlanned {
    const stamp: IStamp = { version: input.version, asset: input.asset, hash: digestOf(input.rendered) };
    const content: string = applyStamp(input.rendered, stamp, input.path);
    const planned: (outcome: TOutcome, write: boolean) => IPlanned = (outcome: TOutcome, write: boolean): IPlanned => ({
        path: input.path,
        asset: input.asset,
        outcome,
        content: write ? content : null,
    });

    if (input.existing === null) {
        return planned('create', true);
    }

    const found: IStamped | null = readStamped(input.existing);
    if (!found) {
        return planned('foreign', false);
    }

    // Порядок проверок решает: у файла, который и правили руками, и отставшего, надо назвать
    // правку. Переложить его — потерять её, а разбирать нечего: в дереве её уже нет.
    if (digestOf(found.body) !== found.stamp.hash) {
        return planned('drift', false);
    }

    return found.stamp.hash === stamp.hash && found.stamp.version === input.version ? planned('ok', false) : planned('update', true);
}

/** Раскладка не удалась, если хоть один файл её не принял. */
export const isRefusal: (outcome: TOutcome) => boolean = (outcome: TOutcome): boolean => outcome === 'drift' || outcome === 'foreign';

/** Что `sync --check` считает расхождением: и отказ, и всё, что осталось не переложенным. */
export const isPending: (outcome: TOutcome) => boolean = (outcome: TOutcome): boolean => outcome !== 'ok';
