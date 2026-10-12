import { DestroyRef } from '@angular/core';

/**
 * Отложенное закрытие подменю, открытого наведением. Уход указателя ставит закрытие, возврат на
 * панель или наведение на пункт с подменю его снимают. Нулевая задержка закрывает сразу, как
 * раньше: без входа задержки меню ведёт себя прежним образом.
 */
export class RtSideMenuCloseTimer {
    #handle: ReturnType<typeof setTimeout> | null = null;

    constructor(destroyRef: DestroyRef) {
        destroyRef.onDestroy((): void => this.cancel());
    }

    /** Закрыть через `delay` миллисекунд; поставленное раньше закрытие заменяется новым. */
    public run(delay: number, close: () => void): void {
        this.cancel();
        if (delay <= 0) {
            close();

            return;
        }
        this.#handle = setTimeout((): void => {
            this.#handle = null;
            close();
        }, delay);
    }

    public cancel(): void {
        if (this.#handle !== null) {
            clearTimeout(this.#handle);
            this.#handle = null;
        }
    }
}
