import { IRtTabs } from './rt-tabs.model';

/** Куда ведёт клавиша с вкладки `index` из `count`; `undefined` — клавиша не навигационная. */
export function rtTabsKeyTarget(key: string, direction: IRtTabs.Direction, index: number, count: number): number | undefined {
    const isVertical: boolean = direction === 'vertical';

    return new Map<string, number>([
        [isVertical ? 'ArrowDown' : 'ArrowRight', (index + 1) % count],
        [isVertical ? 'ArrowUp' : 'ArrowLeft', (index - 1 + count) % count],
        ['Home', 0],
        ['End', count - 1],
    ]).get(key);
}

/**
 * Куда ведёт клавиша с вкладки `currentId` среди доступных вкладок ряда; `undefined` — клавиша не
 * навигационная или вести некуда. Шаг считается от вкладки в фокусе, а не от выбранной.
 */
export function rtTabsKeyTargetId(
    enabled: readonly IRtTabs.Id[],
    currentId: IRtTabs.Id,
    key: string,
    direction: IRtTabs.Direction
): IRtTabs.Id | undefined {
    if (!enabled.length) {
        return undefined;
    }
    const index: number | undefined = rtTabsKeyTarget(key, direction, enabled.indexOf(currentId), enabled.length);
    return index === undefined ? undefined : enabled[index];
}

/** Выбранная вкладка: кандидат, если он среди доступных, иначе первая доступная. */
export function rtTabsSelectedId(enabled: readonly IRtTabs.Id[], candidate: IRtTabs.Id | null): IRtTabs.Id | null {
    return candidate !== null && enabled.includes(candidate) ? candidate : (enabled[0] ?? null);
}
