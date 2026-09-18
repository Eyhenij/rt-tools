import { Injectable, Signal, WritableSignal, signal } from '@angular/core';

import { IRtActionBar } from './rt-action-bar.model';

const EMPTY_CONFIG: IRtActionBar.Config = { selected: 0, total: 0, actions: [] };

/**
 * Настройка полосы массовых действий: держатель её читает, список — пишет.
 *
 * Служба без корня намеренно. Тот, кто отмечает строки, и тот, кто рисует полосу,
 * стоят на разной глубине одного экрана, и передавать настройку вниз через всё,
 * что между ними, значит рассказать о полосе каждому из них. Потребитель
 * объявляет службу на своём уровне — там, где у него живёт список.
 */
@Injectable()
export class RtActionBarService {
    readonly #config: WritableSignal<IRtActionBar.Config> = signal<IRtActionBar.Config>(EMPTY_CONFIG);

    public readonly config: Signal<IRtActionBar.Config> = this.#config.asReadonly();

    /** Список действий. Счёт не трогается: он приходит своим вызовом. */
    public setActions(actions: readonly IRtActionBar.Action[]): void {
        this.#config.update((config: IRtActionBar.Config): IRtActionBar.Config => ({ ...config, actions }));
    }

    /** Счёт выбранного. Полоса открывается именно им. */
    public setCounts(selected: number, total: number): void {
        this.#config.update((config: IRtActionBar.Config): IRtActionBar.Config => ({ ...config, selected, total }));
    }

    /** Отпустить выбранное: счёт обнуляется, список действий остаётся. */
    public clearSelection(): void {
        this.#config.update((config: IRtActionBar.Config): IRtActionBar.Config => ({ ...config, selected: 0, total: 0 }));
    }
}
