import { computed, Signal, signal, WritableSignal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MessageBus } from '../services';
import { Nullable } from '../interfaces';
import { IAction } from './interfaces';


export abstract class BaseStoreService<
    STORE_TYPE extends object,
    MSG_TYPE extends string,
    ACTION_TYPE extends IAction<MSG_TYPE>,
> {
    readonly #store: WritableSignal<STORE_TYPE> = signal({} as STORE_TYPE);
    protected readonly store: Signal<STORE_TYPE> = this.#store.asReadonly();

    readonly #msgBus: MessageBus<ACTION_TYPE, MSG_TYPE> = new MessageBus<ACTION_TYPE, MSG_TYPE>();
    readonly #subscriptions: Set<Subscription> = new Set<Subscription>();

    protected patchState(callbackFn: (state: STORE_TYPE) => STORE_TYPE): void {
        this.#store.update((currState: STORE_TYPE) => callbackFn(currState));
    }

    protected select<K extends keyof STORE_TYPE>(key: K): Signal<Nullable<STORE_TYPE[K]>> {
        let selector: Signal<Nullable<STORE_TYPE[K]>> = signal(null);

        if (this.store() && Object.prototype.hasOwnProperty.call(this.store(), key)) {
            selector = computed(() => this.store()![key]);
        }

        return selector;
    }

    protected dispatch(event: ACTION_TYPE): void {
        this.#msgBus.emit(event);
    }

    protected onDispatch(msg: MSG_TYPE): Observable<ACTION_TYPE> {
        return this.#msgBus.ofType(msg);
    }

    protected unsubscribe(): void {
        this.#subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
        this.#subscriptions.clear();
    }
}
