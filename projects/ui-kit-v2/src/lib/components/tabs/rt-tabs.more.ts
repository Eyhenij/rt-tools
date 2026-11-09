import { IRtTabs } from './rt-tabs.model';

/** Запас на дробную ширину: 0.5 px не отправляет вкладку в меню. */
const FIT_TOLERANCE: number = 0.5;

function widthOf(tabs: ReadonlyArray<IRtTabs.MoreSlot>): number {
    return tabs.reduce((sum: number, tab: IRtTabs.MoreSlot): number => sum + tab.width, 0);
}

function idOf(tab: IRtTabs.MoreSlot): IRtTabs.Id {
    return tab.id;
}

/**
 * Раскладка вкладок в режиме «Ещё». Закреплённые стоят первыми и меню не знают. Остальные покидают
 * ряд с конца, порядок оставшихся не меняется. Выбранная всегда в ряду: не вставшая встаёт последней
 * и вытесняет соседа.
 */
export function rtTabsFitRow(input: IRtTabs.MoreFit): IRtTabs.MoreLayout {
    const { slots, selectedId, moreWidth, available } = input;
    const pinned: ReadonlyArray<IRtTabs.MoreSlot> = slots.filter((tab: IRtTabs.MoreSlot): boolean => tab.pinned);
    const free: ReadonlyArray<IRtTabs.MoreSlot> = slots.filter((tab: IRtTabs.MoreSlot): boolean => !tab.pinned);

    if (widthOf(slots) <= available + FIT_TOLERANCE) {
        return { row: [...pinned, ...free].map(idOf), more: [] };
    }

    const selected: IRtTabs.MoreSlot | undefined = free.find((tab: IRtTabs.MoreSlot): boolean => tab.id === selectedId);
    const budget: number = available - moreWidth - widthOf(pinned) + FIT_TOLERANCE;
    const prefix: IRtTabs.MoreSlot[] = [];
    let used: number = 0;
    for (const tab of free) {
        if (used + tab.width > budget) {
            break;
        }
        prefix.push(tab);
        used += tab.width;
    }

    if (selected !== undefined && !prefix.includes(selected)) {
        // Сосед уходит, пока выбранной не хватит места; шире всего бюджета она остаётся одна.
        while (prefix.length > 0 && widthOf(prefix) + selected.width > budget) {
            prefix.pop();
        }
        prefix.push(selected);
    }

    const inRow: ReadonlySet<IRtTabs.MoreSlot> = new Set<IRtTabs.MoreSlot>(prefix);
    return {
        row: [...pinned, ...prefix].map(idOf),
        more: free.filter((tab: IRtTabs.MoreSlot): boolean => !inRow.has(tab)).map(idOf),
    };
}
