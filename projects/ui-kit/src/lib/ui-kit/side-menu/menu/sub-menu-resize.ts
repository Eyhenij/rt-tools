import { signal, Signal, WritableSignal } from '@angular/core';

import { clampSubMenuWidth } from '../side-menu.logic';

/** Что тяга просит у меню: слушать документ и принять натянутую ширину. */
export interface ISubMenuResizeHooks {
    listen: (event: 'mousemove' | 'mouseup', handler: (event: MouseEvent) => void) => () => void;
    finish: (width: number) => void;
}

/**
 * Тяга правого края закреплённого подменю.
 *
 * Лежит отдельно от меню, как и ходьба клавиатурой: файл меню упёрся в предел длины. Слушатели
 * вешаются на документ — рука уходит с узкой полоски ручки в первое же движение, и слушатель на
 * ней самой терял бы тягу сразу. Ширина, пока край держат, живёт здесь; наружу она уходит одной
 * просьбой на отпускании: вход потребителя за каждым движением мыши не угнаться, а хранилище
 * незачем писать сотней раз.
 */
export class SubMenuResize {
    readonly #width: WritableSignal<number | null> = signal(null);
    readonly #hooks: ISubMenuResizeHooks;
    /** Снятие слушателей документа; пусто, пока край не держат. */
    #stop: (() => void) | null = null;

    /** Ширина под рукой; пусто, пока край не держат. */
    public readonly width: Signal<number | null> = this.#width.asReadonly();

    constructor(hooks: ISubMenuResizeHooks) {
        this.#hooks = hooks;
    }

    public isActive(): boolean {
        return this.#stop !== null;
    }

    /** Край взят в точке `startX`, а панель в этот миг шириной `startWidth`. */
    public start(startX: number, startWidth: number): void {
        if (this.isActive()) {
            return;
        }

        const stopMove: () => void = this.#hooks.listen('mousemove', (event: MouseEvent): void => {
            this.#width.set(clampSubMenuWidth(startWidth + event.clientX - startX));
        });
        const stopUp: () => void = this.#hooks.listen('mouseup', (): void => this.#finish());

        this.#stop = (): void => {
            stopMove();
            stopUp();
            this.#stop = null;
        };
    }

    /**
     * Конец тяги. Уходит натянутая ширина, а не нарисованная: нижний предел держит оформление, и
     * замерить применённое можно только после раскладки. Край отпустили, не сдвинув, — уходить нечему.
     */
    #finish(): void {
        const width: number | null = this.#width();

        this.#stop?.();
        this.#width.set(null);

        if (width !== null) {
            this.#hooks.finish(width);
        }
    }
}
