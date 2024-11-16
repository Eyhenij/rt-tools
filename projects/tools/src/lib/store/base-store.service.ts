import { Signal, WritableSignal, signal } from '@angular/core';

import { Observable, Subscription } from 'rxjs';

import { MessageBus } from '../util/services/message-bus';
import { IAction } from './interfaces/action.interface';

export abstract class BaseStoreService<STATE_TYPE extends object, MSG_TYPE extends string> {
    readonly #store: WritableSignal<STATE_TYPE> = signal({} as STATE_TYPE);
    protected readonly store: Signal<STATE_TYPE> = this.#store.asReadonly();

    readonly #msgBus: MessageBus<MSG_TYPE> = new MessageBus<MSG_TYPE>();
    readonly #subscriptions: Set<Subscription> = new Set<Subscription>();

    public dispatch(event: IAction<MSG_TYPE>): void {
        this.#msgBus.emit(event);
    }

    protected onDispatch(msg: MSG_TYPE): Observable<IAction<MSG_TYPE>> {
        return this.#msgBus.ofType(msg);
    }

    protected patchState(callbackFn: (state: STATE_TYPE) => STATE_TYPE): void {
        this.#store.update((currState: STATE_TYPE) => callbackFn(currState));
    }

    protected unsubscribe(): void {
        this.#subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
        this.#subscriptions.clear();
    }
}
