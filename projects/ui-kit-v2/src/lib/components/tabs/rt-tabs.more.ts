import { IRtTabs } from './rt-tabs.model';

/** Запас на дробную ширину: 0.5 px не отправляет вкладку в меню. */
const FIT_TOLERANCE: number = 0.5;

function widthOf(tabs: ReadonlyArray<IRtTabs.MoreSlot>): number {
    return tabs.reduce((sum: number, tab: IRtTabs.MoreSlot): number => sum + tab.width, 0);
}

function idOf(tab: IRtTabs.MoreSlot): IRtTabs.Id {
    return tab.id;
}

/** Вкладки с начала, пока хватает ширины и счёта. */
function leadingFit(free: ReadonlyArray<IRtTabs.MoreSlot>, budget: number, limit: number): IRtTabs.MoreSlot[] {
    const prefix: IRtTabs.MoreSlot[] = [];
    let used: number = 0;
    for (const tab of free) {
        if (prefix.length >= limit || used + tab.width > budget) {
            break;
        }
        prefix.push(tab);
        used += tab.width;
    }
    return prefix;
}

/**
 * Выбранная встаёт последней: последняя в ряду уходит в меню, пока выбранной не хватит места и
 * счёта. Шире всего бюджета выбранная остаётся одна.
 */
function makeRoom(prefix: IRtTabs.MoreSlot[], selected: IRtTabs.MoreSlot, budget: number, limit: number): void {
    while (prefix.length > 0 && (widthOf(prefix) + selected.width > budget || prefix.length >= limit)) {
        prefix.pop();
    }
    prefix.push(selected);
}

/**
 * Раскладка вкладок в режиме «Ещё». Закреплённые стоят первыми и меню не знают. Остальные покидают
 * ряд с конца, порядок оставшихся не меняется. Выбранная всегда в ряду: не вставшая встаёт последней
 * и вытесняет соседа. В ряду не больше `limit` вкладок вместе с закреплёнными, даже если место есть:
 * лишние уходят в меню так же, как не вставшие по ширине.
 */
export function rtTabsFitRow(input: IRtTabs.MoreFit): IRtTabs.MoreLayout {
    const { slots, selectedId, moreWidth, available, limit = Infinity } = input;
    const pinned: ReadonlyArray<IRtTabs.MoreSlot> = slots.filter((tab: IRtTabs.MoreSlot): boolean => tab.pinned);
    const free: ReadonlyArray<IRtTabs.MoreSlot> = slots.filter((tab: IRtTabs.MoreSlot): boolean => !tab.pinned);
    const freeLimit: number = Math.max(0, limit - pinned.length);

    if (widthOf(slots) <= available + FIT_TOLERANCE && free.length <= freeLimit) {
        return { row: [...pinned, ...free].map(idOf), more: [] };
    }

    const selected: IRtTabs.MoreSlot | undefined = free.find((tab: IRtTabs.MoreSlot): boolean => tab.id === selectedId);
    const budget: number = available - moreWidth - widthOf(pinned) + FIT_TOLERANCE;
    const prefix: IRtTabs.MoreSlot[] = leadingFit(free, budget, freeLimit);

    if (selected !== undefined && !prefix.includes(selected)) {
        makeRoom(prefix, selected, budget, freeLimit);
    }

    const inRow: ReadonlySet<IRtTabs.MoreSlot> = new Set<IRtTabs.MoreSlot>(prefix);
    return {
        row: [...pinned, ...prefix].map(idOf),
        more: free.filter((tab: IRtTabs.MoreSlot): boolean => !inRow.has(tab)).map(idOf),
    };
}
