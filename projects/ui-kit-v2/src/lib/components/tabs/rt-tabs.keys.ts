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

/** Выбранная вкладка: кандидат, если он среди доступных, иначе первая доступная. */
export function rtTabsSelectedId(enabled: readonly IRtTabs.Id[], candidate: IRtTabs.Id | null): IRtTabs.Id | null {
    return candidate !== null && enabled.includes(candidate) ? candidate : (enabled[0] ?? null);
}
