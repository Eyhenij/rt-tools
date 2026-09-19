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
    /** Тело совпало с пакетным, а шапка с ним разошлась: правки в теле нет — переложить. */
    | 'stamp'
    /** Файл есть, шапки нет — положен не пакетом, трогать нельзя. */
    | 'foreign'
    /** Тело сходится, а права на запуск нет: хук лежит и не зовётся. */
    | 'permission'
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
    /**
     * Ресурс кладётся исполнимым: право берётся с файла пакета, а не раздаётся по каталогу.
     *
     * Умолчание — «нет»: право спрашивается у того, кто его несёт, и ресурс, которому оно не
     * нужно, о нём не думает вовсе.
     */
    readonly executable?: boolean;
    /** Право на запуск у файла в дереве. Значение имеет смысл только при `existing`. */
    readonly existingExecutable?: boolean;
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
        outcome,
        path: input.path,
        asset: input.asset,
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
    //
    // Прежде отделяется случай, где правки нет вовсе: тело совпадает с пакетным байт в байт, а
    // шапка разошлась с ним — так остаётся файл, у которого шапку переписали или не дописали.
    // Слово «правлен руками» отправляет искать правку, которой нет, а отказ по одному такому
    // файлу отменяет всю раскладку: она кладёт всё или ничего.
    if (digestOf(found.body) !== found.stamp.hash) {
        if (digestOf(found.body) === stamp.hash) {
            return planned('stamp', true);
        }

        return planned('drift', false);
    }

    if (found.stamp.hash !== stamp.hash || found.stamp.version !== input.version) {
        return planned('update', true);
    }

    // Тело сходится, а бит исполнения снят. Переписывать нечего — правки в теле нет, — но
    // молчать нельзя: зарегистрированный командой хук без этого бита не запускается вовсе, а
    // выглядит установленным. Раскладка вернёт право, сверка назовёт файл расхождением.
    if (input.executable === true && input.existingExecutable === false) {
        return planned('permission', false);
    }

    return planned('ok', false);
}

/** Раскладка не удалась, если хоть один файл её не принял. */
export const isRefusal: (outcome: TOutcome) => boolean = (outcome: TOutcome): boolean => outcome === 'drift' || outcome === 'foreign';

/** Что `sync --check` считает расхождением: и отказ, и всё, что осталось не переложенным. */
export const isPending: (outcome: TOutcome) => boolean = (outcome: TOutcome): boolean => outcome !== 'ok';
