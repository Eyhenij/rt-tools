/** Запас сверх длительности перехода, после которого ожидание `transitionend` снимается. */
const TRANSITION_BUFFER_MS: number = 80;

/** Максимальная длительность transition'а элемента в мс; `0` если анимации нет. */
export function transitionDurationMs(win: Window | null, element: HTMLElement): number {
    const durationCss: string | undefined = win?.getComputedStyle(element).transitionDuration;
    if (durationCss === undefined || durationCss === '') {
        return 0;
    }
    const maxSeconds: number = durationCss.split(',').reduce((max: number, part: string): number => {
        const trimmed: string = part.trim();
        const seconds: number = trimmed.endsWith('ms') ? Number.parseFloat(trimmed) / 1000 : Number.parseFloat(trimmed);
        return Number.isNaN(seconds) ? max : Math.max(max, seconds);
    }, 0);
    return maxSeconds * 1000;
}

/**
 * Зовёт `callback` по окончании перехода одного свойства узла.
 *
 * Слушаем окончание одного свойства: на узле могут анимироваться и другие (opacity
 * backdrop'а, например) — это даст ложные срабатывания.
 */
export function listenTransitionEnd(win: Window | null, element: HTMLElement, property: string, callback: () => void): void {
    // Нет анимации (reduced-motion / `transition: none`) → `transitionend` не
    // придёт; teardown-callback (навигация `ro:null`) отрабатываем синхронно.
    const durationMs: number = transitionDurationMs(win, element);
    if (durationMs === 0) {
        callback();
        return;
    }

    // settled-гард делает transitionend и fallback-таймаут взаимно
    // идемпотентными — сработает и снимет listener только то, что раньше.
    let settled: boolean = false;

    const handler: (event: TransitionEvent) => void = (event: TransitionEvent): void => {
        if (event.propertyName !== property || event.target !== element || settled) {
            return;
        }
        settled = true;
        element.removeEventListener('transitionend', handler);
        callback();
    };
    element.addEventListener('transitionend', handler);

    // Страховка на случай пропущенного `transitionend` (лаг рендера).
    setTimeout((): void => {
        if (settled) {
            return;
        }
        settled = true;
        element.removeEventListener('transitionend', handler);
        callback();
    }, durationMs + TRANSITION_BUFFER_MS);
}
