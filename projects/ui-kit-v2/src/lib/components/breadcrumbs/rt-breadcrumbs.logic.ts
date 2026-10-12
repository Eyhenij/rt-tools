import { IRtBreadcrumbs } from './rt-breadcrumbs.model';

/** С какого числа предков середина пути сворачивается на узком экране. */
export const RT_BREADCRUMBS_FOLD_FROM: number = 3;

/**
 * Помещаются ли предки рядом с текущим звеном, урезанным до порога или до своей полной подписи,
 * если она короче. Тогда звено сжимается с многоточием и строка не едет; иначе строка встаёт в
 * конец, и предки уезжают влево.
 */
export function rtBreadcrumbsFits(room: number, ancestors: number, current: number, floor: number): boolean {
    return room - ancestors >= Math.min(current, floor);
}

/**
 * Раскладка предков. На узком экране длинный путь оставляет первого и последнего предка ссылками,
 * а середину отдаёт в меню; на широком и при коротком пути свёртки нет.
 */
export function rtBreadcrumbsFold(ancestors: readonly IRtBreadcrumbs.Crumb[], narrow: boolean): IRtBreadcrumbs.Fold {
    if (!narrow || ancestors.length < RT_BREADCRUMBS_FOLD_FROM) {
        return { head: ancestors, hidden: [], tail: [] };
    }

    return {
        head: ancestors.slice(0, 1),
        hidden: ancestors.slice(1, -1),
        tail: ancestors.slice(-1),
    };
}
