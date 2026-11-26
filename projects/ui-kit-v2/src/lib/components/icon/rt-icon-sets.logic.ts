import { IRtIcon } from '@rt-tools/ui-kit-v2/core';

import {
    RT_ICON_MATERIAL_FILL_SYMBOL_ID_PREFIX,
    RT_ICON_MATERIAL_SYMBOL_ID_PREFIX,
    RT_ICON_SET_SYMBOL_ID_PREFIX,
    RT_ICON_SYMBOL_ID_PREFIX,
} from './rt-icon.const';
import { IRtIconSet, rtIconBuiltInSets } from './rt-icon-sets';

/* Значение задаёт сборка приложения: в рабочей сборке оно `false`, и тексты предупреждений из неё
   выпадают. Поведение от него не зависит. */
declare const ngDevMode: boolean | undefined;

/** Набор самого кита: в нём есть рисунок каждого имени, на нём кончается цепочка запасных. */
export const RT_ICON_KIT_SET: string = 'kit';

/** Набор, который включает признак material в разметке. */
export const RT_ICON_MATERIAL_SET: string = 'material';

/* Имя набора идёт в `id` символа и в атрибут разметки. Двойного дефиса в нём нет: им `id`
   символа отделяет имя набора от имени значка. */
const SET_NAME_RE: RegExp = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Наборы приложения, разобранные вместе со встроенными. */
export interface IRtIconSetsConfig {
    readonly sets: ReadonlyMap<string, IRtIconSet>;
    /** Набор приложения, пока никто не выбрал другой. */
    readonly defaultSet: string;
    /** Что в объявлении приложения не принято и чем это заменено. В рабочей сборке пуст. */
    readonly warnings: ReadonlyArray<string>;
}

/** Что значок берёт из набора: символ спрайта и адреса рисунка по порядку запасных. */
export interface IRtIconRef {
    readonly id: string;
    readonly set: string;
    readonly name: IRtIcon.Name;
    readonly urls: ReadonlyArray<string>;
}

/**
 * Какой рисунок показать, когда значок просит другой. Пока новый символ не приехал, при смене
 * набора виден старый — если он сам нарисован. Новое имя значка старый рисунок не держит.
 */
export function rtIconDrawn(previous: IRtIconRef | null, target: IRtIconRef, ready: (id: string) => boolean): IRtIconRef {
    const hold: boolean = previous !== null && previous.name === target.name && !ready(target.id) && ready(previous.id);

    return hold && previous !== null ? previous : target;
}

/* У встроенных наборов свои приставки: по ним значки ждут и стили приложения, и снимки витрины. */
function symbolId(set: string, name: IRtIcon.Name, fill: boolean): string {
    if (set === RT_ICON_KIT_SET) {
        return `${RT_ICON_SYMBOL_ID_PREFIX}${name}`;
    }

    if (set === RT_ICON_MATERIAL_SET) {
        return `${fill ? RT_ICON_MATERIAL_FILL_SYMBOL_ID_PREFIX : RT_ICON_MATERIAL_SYMBOL_ID_PREFIX}${name}`;
    }

    return `${RT_ICON_SET_SYMBOL_ID_PREFIX}${set}--${fill ? 'fill--' : ''}${name}`;
}

/* Почему цепочка запасных набора не доходит до `kit`: ведёт в никуда или замкнута в круг. */
function brokenChain(sets: ReadonlyMap<string, IRtIconSet>, set: IRtIconSet): string | null {
    const walked: Set<string> = new Set<string>([set.name]);
    let next: string = set.fallback ?? RT_ICON_KIT_SET;

    while (next !== RT_ICON_KIT_SET) {
        const found: IRtIconSet | undefined = sets.get(next);

        if (found === undefined) {
            return typeof ngDevMode === 'undefined' || ngDevMode ? `ведёт на необъявленный набор «${next}»` : '';
        }

        if (walked.has(next)) {
            return typeof ngDevMode === 'undefined' || ngDevMode ? 'замкнута в круг' : '';
        }
        walked.add(next);
        next = found.fallback ?? RT_ICON_KIT_SET;
    }

    return null;
}

/* Пустой текст — это рабочая сборка: предупреждений в ней нет. */
function warn(warnings: string[], message: string): void {
    if (message) {
        warnings.push(message);
    }
}

/* Цепочка запасных обязана доходить до `kit`. Набор без названного запасного берёт `kit`; неизвестный
   запасной и круг рвутся там, где проверка их встретила. */
function closeFallbacks(sets: Map<string, IRtIconSet>, set: IRtIconSet, warnings: string[]): void {
    if (set.name === RT_ICON_KIT_SET) {
        if (set.fallback !== undefined) {
            warn(
                warnings,
                typeof ngDevMode === 'undefined' || ngDevMode
                    ? `у набора «${RT_ICON_KIT_SET}» запасного набора нет, названный отброшен`
                    : ''
            );
            sets.set(set.name, { name: set.name, url: set.url, names: set.names, fill: set.fill });
        }
        return;
    }

    const why: string | null = brokenChain(sets, set);

    if (why !== null) {
        warn(
            warnings,
            typeof ngDevMode === 'undefined' || ngDevMode
                ? `набор «${set.name}»: цепочка запасных ${why}, запасным взят «${RT_ICON_KIT_SET}»`
                : ''
        );
    }

    sets.set(set.name, { ...set, fallback: why === null ? (set.fallback ?? RT_ICON_KIT_SET) : RT_ICON_KIT_SET });
}

/* Запись приложения поверх встроенных. Негодная запись не принимается. */
function addSet(sets: Map<string, IRtIconSet>, entry: IRtIconSet, warnings: string[]): void {
    const merged: IRtIconSet = { ...sets.get(entry.name), ...entry };
    const badName: boolean = !SET_NAME_RE.test(entry.name);

    if (!badName && merged.url?.trim()) {
        sets.set(entry.name, merged);
        return;
    }

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
        const why: string = badName ? 'имя пишется строчными латинскими буквами, цифрами и одиночным дефисом' : 'у него пустой адрес';

        warnings.push(`набор «${entry.name}» не принят: ${why}`);
    }
}

/**
 * Складывает встроенные наборы с наборами приложения. Запись с именем встроенного набора меняет
 * только названные поля. Негодное объявление не роняет приложение: оно даёт предупреждение, а
 * значки берутся из набора `kit`.
 */
export function rtIconSetsConfig(added: ReadonlyArray<IRtIconSet> = [], defaultSet: string = RT_ICON_KIT_SET): IRtIconSetsConfig {
    const sets: Map<string, IRtIconSet> = new Map<string, IRtIconSet>(
        rtIconBuiltInSets.map((set: IRtIconSet): [string, IRtIconSet] => [set.name, set])
    );
    const warnings: string[] = [];

    for (const entry of added) {
        addSet(sets, entry, warnings);
    }

    for (const name of [...sets.keys()]) {
        const set: IRtIconSet | undefined = sets.get(name);

        if (set !== undefined) {
            closeFallbacks(sets, set, warnings);
        }
    }

    if (!sets.has(defaultSet)) {
        warn(
            warnings,
            typeof ngDevMode === 'undefined' || ngDevMode
                ? `набора по умолчанию «${defaultSet}» среди объявленных нет, взят набор «${RT_ICON_KIT_SET}»`
                : ''
        );
    }

    return { sets, warnings, defaultSet: sets.has(defaultSet) ? defaultSet : RT_ICON_KIT_SET };
}

/* Что в файле SVG стоит перед корнем: объявление XML, комментарий, `DOCTYPE`. */
const SVG_PROLOG_RE: RegExp = /^(?:<\?[\s\S]*?\?>|<!--[\s\S]*?-->|<!DOCTYPE\s[^>[]*(?:\[[^\]]*\]\s*)?>)/i;
const SVG_ROOT_RE: RegExp = /^<svg[\s/>]/i;

/**
 * Пришёл ли файл рисунка. Сервер приложения на отсутствующий адрес часто отдаёт свою страницу с
 * кодом 200: такой ответ рисунком не является, и значок берётся из запасного набора.
 */
export function rtIconIsSvgFile(raw: string): boolean {
    let rest: string = raw.trimStart();
    let prolog: RegExpExecArray | null = SVG_PROLOG_RE.exec(rest);

    while (prolog !== null) {
        rest = rest.slice(prolog[0].length).trimStart();
        prolog = SVG_PROLOG_RE.exec(rest);
    }

    return SVG_ROOT_RE.test(rest);
}

/**
 * Рисунок имени в наборе. Набор с перечнем, где имени нет, пропускается без запроса: символ и
 * адреса берутся у первого набора цепочки, у которого рисунок есть. Незнакомый набор — это `kit`.
 */
export function rtIconRef(config: IRtIconSetsConfig, set: string, name: IRtIcon.Name, fill: boolean): IRtIconRef {
    const urls: string[] = [];
    let owner: IRtIconSet | null = null;
    let current: IRtIconSet | undefined = config.sets.get(set) ?? config.sets.get(RT_ICON_KIT_SET);

    while (current !== undefined) {
        if (current.names === undefined || current.names.includes(name)) {
            owner ??= current;

            if (fill && current.fill) {
                urls.push(`${current.url}/${name}.fill.svg`);
            }
            urls.push(`${current.url}/${name}.svg`);
        }
        current = current.fallback === undefined ? undefined : config.sets.get(current.fallback);
    }

    const ownerName: string = owner?.name ?? RT_ICON_KIT_SET;
    /* Залитый рисунок может дать и запасной набор: тогда у него свой символ, иначе залитый и
       контурный значок заняли бы один, и второй нарисовался бы рисунком первого. */
    const filled: boolean = urls.some((url: string): boolean => url.endsWith('.fill.svg'));

    return { id: symbolId(ownerName, name, filled), set: ownerName, name, urls };
}
