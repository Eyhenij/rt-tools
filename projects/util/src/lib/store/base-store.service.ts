import { computed, Signal, signal, WritableSignal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MessageBus } from '../services';
import { Nullable } from '../interfaces';
import { IAction } from './interfaces';


export abstract class BaseStoreService<
    STATE_TYPE extends object,
    MSG_TYPE extends string,
    ACTION_TYPE extends IAction<MSG_TYPE>,
> {
    readonly #store: WritableSignal<STATE_TYPE> = signal({} as STATE_TYPE);
    protected readonly store: Signal<STATE_TYPE> = this.#store.asReadonly();

    readonly #msgBus: MessageBus<ACTION_TYPE, MSG_TYPE> = new MessageBus<ACTION_TYPE, MSG_TYPE>();
    readonly #subscriptions: Set<Subscription> = new Set<Subscription>();

    protected patchState(callbackFn: (state: STATE_TYPE) => STATE_TYPE): void {
        this.#store.update((currState: STATE_TYPE) => callbackFn(currState));
    }

    protected select<K extends keyof STATE_TYPE>(key: K): Signal<Nullable<STATE_TYPE[K]>> {
        let selector: Signal<Nullable<STATE_TYPE[K]>> = signal(null);

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
