import { computed, linkedSignal, Signal, WritableSignal } from '@angular/core';

import { IRtSheetMoreContext, RtSheetMoreDirective } from './rt-sheet-more.directive';

/**
 * Второй экран «Ещё» одной шторки: есть ли он, открыт ли, просьбы открыть и вернуться к первому.
 * Экран закрыт с каждой сменой открытости самой шторки; без шаблона `rtSheetMore` просьба открыть
 * ничего не делает.
 */
export class RtSheetMoreScreen {
    readonly #back: () => void = (): void => this.opened.set(false);

    /** У шторки есть шаблон второго экрана. */
    public readonly has: Signal<boolean>;

    /** Второй экран открыт. */
    public readonly opened: WritableSignal<boolean>;

    /** Шаблон второго экрана получает просьбу вернуться к первому. */
    public readonly context: IRtSheetMoreContext = { $implicit: this.#back, back: this.#back };

    constructor(template: Signal<RtSheetMoreDirective | undefined>, sheetOpen: () => boolean) {
        this.has = computed((): boolean => template() !== undefined);
        this.opened = linkedSignal<boolean>((): boolean => {
            sheetOpen();

            return false;
        });
    }

    /** Открыть второй экран — с «⋮» шапки шторки или своей шапки. */
    public readonly open: () => void = (): void => this.opened.set(this.has());
}
