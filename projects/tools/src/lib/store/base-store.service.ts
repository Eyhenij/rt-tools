import { Signal, signal, WritableSignal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { MessageBus } from '../util/services/message-bus';
import { IAction } from './interfaces/action.interface';
import { IBaseStoreService } from './interfaces/base-store-service.interface';

export abstract class BaseStoreService<STATE_TYPE extends object, MSG_TYPE extends string>
    implements IBaseStoreService<STATE_TYPE, MSG_TYPE>
{
    readonly #store: WritableSignal<STATE_TYPE> = signal({} as STATE_TYPE);
    public readonly store: Signal<STATE_TYPE> = this.#store.asReadonly();

    readonly #msgBus: MessageBus<MSG_TYPE> = new MessageBus<MSG_TYPE>();
    readonly #subscriptions: Set<Subscription> = new Set<Subscription>();

    public dispatch(event: IAction<MSG_TYPE>): void {
        this.#msgBus.emit(event);
    }

    public onDispatch(msg: MSG_TYPE): Observable<IAction<MSG_TYPE>> {
        return this.#msgBus.ofType(msg);
    }

    public patchState(callbackFn: (state: STATE_TYPE) => STATE_TYPE): void {
        this.#store.update((currState: STATE_TYPE) => callbackFn(currState));
    }

    protected unsubscribe(): void {
        this.#subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
        this.#subscriptions.clear();
    }
}
