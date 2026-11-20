import { computed, Injectable, signal, Signal, WritableSignal } from '@angular/core';

/**
 * Порядок открытых шторок кита. Шторка, открытая из другой шторки, подменяет её: видна только
 * верхняя, а закрытие верхней снова показывает предыдущую.
 */
@Injectable({ providedIn: 'root' })
export class RtBottomSheetStackService {
    readonly #open: WritableSignal<ReadonlyArray<object>> = signal<ReadonlyArray<object>>([]);

    /** Шторка, которая видна сейчас; `null` — открытых нет. */
    public readonly top: Signal<object | null> = computed((): object | null => this.#open().at(-1) ?? null);

    public push(sheet: object): void {
        this.#open.update((open: ReadonlyArray<object>): ReadonlyArray<object> => (open.includes(sheet) ? open : [...open, sheet]));
    }

    public remove(sheet: object): void {
        this.#open.update((open: ReadonlyArray<object>): ReadonlyArray<object> =>
            open.includes(sheet) ? open.filter((item: object): boolean => item !== sheet) : open
        );
    }
}
