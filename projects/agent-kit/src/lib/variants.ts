/**
 * Оси различия между деревьями и выбор проекта по ним.
 *
 * Есть приёмы, которые везде одни, и есть такие, у которых один и тот же закон исполняется
 * разными командами: заявка на слияние открывается `gh`, `glab` или `az repos` — в зависимости
 * от того, где лежит репозиторий. Обезличить их до общего текста нельзя: правило, из которого
 * убрали команду, перестаёт быть указанием и становится пожеланием.
 *
 * Поэтому такой ресурс лежит в пакете в нескольких видах — `git-workflow.github.md`,
 * `git-workflow.gitlab.md`, `git-workflow.azure.md`, — а проект выбирает вид один раз, при
 * заведении конфига. Разложен будет ровно один, под общим именем: агент читает `git-workflow`,
 * а какой это хостинг, ему знать незачем.
 *
 * Ось объявлена пакетом, а не выдумана на месте: значение из конфига, которому ни одна ось не
 * отвечает, — это опечатка, и молчать о ней нельзя.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface IOptionOfAxis {
    /** Значение, которое проект пишет в конфиг и которое стоит в имени файла: `github`. */
    readonly value: string;
    /** Чем этот вид отличается от соседнего — им человек и выбирает. */
    readonly title: string;
}

export interface IAxis {
    /** Имя оси, оно же ключ в `variants` конфига: `host`. */
    readonly name: string;
    /** Вопрос, которым ось спрашивают при заведении конфига. */
    readonly question: string;
    /** Чем ось названа в перечнях и отказах. */
    readonly title: string;
    readonly options: readonly IOptionOfAxis[];
}

/** Ось и вид, которым помечен ресурс. У ресурса без пометки его нет. */
export interface IVariant {
    readonly axis: string;
    readonly value: string;
}

export const VARIANTS_FILE: string = 'variants.json';

/** Оси, объявленные пакетом. Нет файла — осей нет, и все ресурсы считаются общими. */
export function readAxes(assetsDir: string): readonly IAxis[] {
    let raw: unknown;
    try {
        raw = JSON.parse(readFileSync(join(assetsDir, VARIANTS_FILE), 'utf8'));
    } catch {
        return [];
    }
    if (typeof raw !== 'object' || raw === null) {
        return [];
    }

    return Object.entries(raw as Record<string, IAxis>).map(([name, axis]: [string, IAxis]): IAxis => ({
        name,
        question: axis.question,
        title: axis.title,
        options: axis.options ?? [],
    }));
}

/**
 * Чем помечено имя файла: `git-workflow.github.md` — видом `github` оси `host`.
 *
 * Вид ищется среди объявленных значений, а не по одному лишь виду имени. Иначе `app.config.md`
 * прочитался бы как ресурс `app` вида `config`, и раскладка потеряла бы файл молча — по
 * причине, которую в имени не разглядеть.
 */
export function variantOf(file: string, axes: readonly IAxis[]): IVariant | null {
    const parts: readonly string[] = file.split('.');
    if (parts.length < 3) {
        return null;
    }
    const spoken: string = parts[parts.length - 2];

    for (const axis of axes) {
        if (axis.options.some((option: IOptionOfAxis): boolean => option.value === spoken)) {
            return { axis: axis.name, value: spoken };
        }
    }

    return null;
}

/** Имя файла без пометки вида: под ним ресурс и ложится в дерево проекта. */
export function withoutVariant(file: string, variant: IVariant | null): string {
    if (!variant) {
        return file;
    }
    const parts: string[] = file.split('.');
    parts.splice(parts.length - 2, 1);

    return parts.join('.');
}

/**
 * Взят ли ресурс при этом выборе видов.
 *
 * Ресурс без пометки берётся всегда. Помеченный — только когда проект назвал ровно этот вид:
 * невыбранная ось значит, что дерево о ней ничего не сказало, и класть ему наугад один из трёх
 * git-flow хуже, чем не класть ни одного.
 */
export function matchesVariant(variant: IVariant | null, chosen: Readonly<Record<string, string>>): boolean {
    return variant === null || chosen[variant.axis] === variant.value;
}

/** Оси, о которых проект молчит, хотя пакет их объявил, — по ним раскладка не полна. */
export function unansweredAxes(axes: readonly IAxis[], chosen: Readonly<Record<string, string>>): readonly IAxis[] {
    return axes.filter(
        (axis: IAxis): boolean => !axis.options.some((option: IOptionOfAxis): boolean => option.value === chosen[axis.name])
    );
}
