import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

/**
 * Подменю держится открытым, пока человек работает внутри него не указателем: фокус на звезде,
 * строка избранного в руке.
 *
 * Отдельно от удержания полем поиска: то ещё и расширяет панель под набор запроса, а звезда и
 * перетаскивание ширины не просят — панель прыгала бы под рукой. Снимается вместе с закрытием
 * подменю, как и удержание полем: уход фокуса со звезды — переход к пунктам того же подменю.
 *
 * Ставится меню в свои провайдеры: у каждого меню своё подменю и своё удержание.
 */
@Injectable()
export class RtuiSubMenuHoldService {
    readonly #held: WritableSignal<boolean> = signal(false);

    public readonly held: Signal<boolean> = this.#held.asReadonly();

    public hold(): void {
        this.#held.set(true);
    }

    public release(): void {
        this.#held.set(false);
    }
}
