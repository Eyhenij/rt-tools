import { computed, linkedSignal, Signal, WritableSignal } from '@angular/core';

import { IRtSheetMoreContext, RtSheetMoreDirective } from './rt-sheet-more.directive';

/**
 * Второй экран «Ещё» одной шторки: его шаблон, открыт ли он, просьбы открыть и вернуться к первому.
 * Шаблон, переданный входом, сильнее шаблона в содержимом шторки. Экран закрыт с каждой сменой
 * открытости самой шторки и с каждой сменой шаблона; без шаблона просьба открыть ничего не делает.
 */
export class RtSheetMoreScreen {
    readonly #back: () => void = (): void => this.opened.set(false);

    /** Шаблон второго экрана: из входа шторки, без него — из её содержимого. */
    public readonly directive: Signal<RtSheetMoreDirective | null>;

    /** У шторки есть шаблон второго экрана. */
    public readonly has: Signal<boolean>;

    /** Второй экран открыт. */
    public readonly opened: WritableSignal<boolean>;

    /** Шаблон второго экрана получает просьбу вернуться к первому. */
    public readonly context: IRtSheetMoreContext = { $implicit: this.#back, back: this.#back };

    constructor(own: Signal<RtSheetMoreDirective | undefined>, given: () => RtSheetMoreDirective | null, sheetOpen: () => boolean) {
        this.directive = computed((): RtSheetMoreDirective | null => given() ?? own() ?? null);
        this.has = computed((): boolean => this.directive() !== null);
        this.opened = linkedSignal<boolean>((): boolean => {
            sheetOpen();
            this.directive();

            return false;
        });
    }

    /** Открыть второй экран — с «⋮» шапки шторки или своей шапки. */
    public readonly open: () => void = (): void => this.opened.set(this.has());
}
