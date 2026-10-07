import { DestroyRef } from '@angular/core';

import { ISideMenu } from '../side-menu.types';

/** Что отложенное закрытие спрашивает у меню. */
export interface ISubMenuCloseDelayHooks {
    /** Задержка в миллисекундах; ноль закрывает сразу. */
    delay: () => number;
    /** Подменю открыто наведением, а не закреплено, — только его и закрывает задержка. */
    isHovered: () => boolean;
    /** Прежняя реакция меню на указатель: открыть разделы пункта или закрыть по уходу. */
    toggle: (item?: ISideMenu.Item) => void;
}

/**
 * Отложенное закрытие подменю, открытого наведением.
 *
 * Уход указателя с панели и наведение на пункт полосы без разделов закрывают подменю не сразу, а
 * по истечении задержки: рука, на миг вышедшая за край панели или идущая с неё поперёк полосы, не
 * теряет подменю. Возврат на панель и наведение на пункт с разделами закрытие отменяют. Решение о
 * закрытии меню принимает в момент срабатывания — к нему подменю могли закрепить или взяться за
 * поле поиска.
 *
 * Лежит отдельно от меню, как тяга и ходьба с клавиатуры рядом: файл меню упёрся в предел длины.
 */
export class SubMenuCloseDelay {
    readonly #hooks: ISubMenuCloseDelayHooks;

    #timer: ReturnType<typeof setTimeout> | null = null;

    constructor(hooks: ISubMenuCloseDelayHooks, destroyRef: DestroyRef) {
        this.#hooks = hooks;
        destroyRef.onDestroy((): void => this.cancel());
    }

    public railItemEntered(item: ISideMenu.Item): void {
        if (item?.submenu || !this.#hooks.isHovered()) {
            this.cancel();
            this.#hooks.toggle(item);

            return;
        }

        this.schedule();
    }

    public panelEntered(): void {
        this.cancel();
    }

    public panelLeft(): void {
        this.schedule();
    }

    public schedule(): void {
        this.cancel();

        const delay: number = this.#hooks.delay();

        if (delay === 0) {
            this.#hooks.toggle();

            return;
        }

        this.#timer = setTimeout((): void => {
            this.#timer = null;
            this.#hooks.toggle();
        }, delay);
    }

    public cancel(): void {
        if (this.#timer !== null) {
            clearTimeout(this.#timer);
            this.#timer = null;
        }
    }
}
