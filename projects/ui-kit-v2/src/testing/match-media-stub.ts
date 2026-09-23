/**
 * Ответ браузера о настройках машины — в тестовом окружении.
 *
 * jsdom не умеет `matchMedia` вовсе: службе, которая спрашивает машину о тёмном
 * виде, там не с кем говорить. Это пробел окружения, а не кода, поэтому
 * заглушка ставится один раз на весь прогон, в `test-setup.ts`.
 *
 * Заглушка управляемая: тест меняет ответ и получает то же событие, что пришло
 * бы от браузера. Без этого «идти за машиной» проверялось бы только в том
 * положении, в котором окружение застало его при старте.
 */

type TQueryListener = (event: MediaQueryListEvent) => void;

/** Запросы, которые сейчас считаются совпавшими. */
const matching: Set<string> = new Set<string>();

/** Слушатели по запросу: их зовут, когда ответ меняется. */
const listeners: Map<string, Set<TQueryListener>> = new Map<string, Set<TQueryListener>>();

function listenersOf(query: string): Set<TQueryListener> {
    const existing: Set<TQueryListener> | undefined = listeners.get(query);

    if (existing !== undefined) {
        return existing;
    }

    const created: Set<TQueryListener> = new Set<TQueryListener>();
    listeners.set(query, created);

    return created;
}

/** Ставит заглушку на окно тестового окружения. Зовётся один раз за прогон. */
export function installMatchMediaStub(): void {
    window.matchMedia = (query: string): MediaQueryList => {
        const list: Partial<MediaQueryList> = {
            media: query,
            get matches(): boolean {
                return matching.has(query);
            },
            onchange: null,
            addEventListener: (_type: string, listener: EventListenerOrEventListenerObject): void => {
                listenersOf(query).add(listener as TQueryListener);
            },
            removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject): void => {
                listenersOf(query).delete(listener as TQueryListener);
            },
            // Устаревшая пара: ею до сих пор пользуется наблюдатель порогов из CDK, и без неё
            // он падает на первом же компоненте, который спрашивает ширину окна.
            addListener: (listener: TQueryListener): void => {
                listenersOf(query).add(listener);
            },
            removeListener: (listener: TQueryListener): void => {
                listenersOf(query).delete(listener);
            },
            dispatchEvent: (): boolean => true,
        };

        return list as MediaQueryList;
    };
}

/**
 * Меняет ответ машины и будит слушателей — ровно так, как это делает браузер,
 * когда человек переключает оформление системы при открытой странице.
 */
export function setMediaQueryMatches(query: string, matches: boolean): void {
    if (matches) {
        matching.add(query);
    } else {
        matching.delete(query);
    }

    for (const listener of listenersOf(query)) {
        listener({ matches, media: query } as MediaQueryListEvent);
    }
}

/** Возвращает окружение к исходному: ни один запрос не совпадает, слушателей нет. */
export function resetMediaQueries(): void {
    matching.clear();
    listeners.clear();
}
