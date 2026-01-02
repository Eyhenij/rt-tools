import { DestroyRef, inject, Signal, signal, WritableSignal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { MessageBus } from '@rt-tools/core';

import { IAction } from './interfaces/action.interface';
import { IBaseStoreService } from './interfaces/base-store-service.interface';
import { IStoreConfig } from './interfaces/devtools.interface';
import { DevToolsManagerService } from './services/devtools-manager.service';

export abstract class BaseStoreService<STATE_TYPE extends object, MSG_TYPE extends string> implements IBaseStoreService<
    STATE_TYPE,
    MSG_TYPE
> {
    readonly #devToolsManager: DevToolsManagerService | null = inject(DevToolsManagerService, { optional: true });

    readonly #store: WritableSignal<STATE_TYPE>;
    public readonly store: Signal<STATE_TYPE>;

    readonly #msgBus: MessageBus<MSG_TYPE> = new MessageBus<MSG_TYPE>();
    readonly #subscriptions: Set<Subscription> = new Set<Subscription>();

    readonly #storeName: string;
    readonly #unregisterDevTools: (() => void) | null = null;

    protected constructor(initialState: STATE_TYPE, config?: IStoreConfig) {
        this.#store = signal(initialState);
        this.store = this.#store.asReadonly();
        this.#storeName = config?.name ?? this.constructor.name;

        // Register with DevTools manager if available
        if (this.#devToolsManager) {
            this.#unregisterDevTools = this.#devToolsManager.register(this.#storeName, this.store, (state: STATE_TYPE): void =>
                this.#store.set(state)
            );
        }

        inject(DestroyRef).onDestroy(() => this.#cleanup());
    }

    public dispatch(event: IAction<MSG_TYPE>): void {
        this.#msgBus.emit(event);
        this.#sendToDevTools(`dispatch:${event.type}`, event.payload);
    }

    public onDispatch(msg: MSG_TYPE): Observable<IAction<MSG_TYPE>> {
        return this.#msgBus.ofType(msg);
    }

    public patchState(callbackFn: (state: STATE_TYPE) => STATE_TYPE, actionName?: string): void {
        this.#store.update((currState: STATE_TYPE): STATE_TYPE => callbackFn(currState));
        this.#sendToDevTools(actionName ?? 'patchState');
    }

    protected addSubscription(subscription: Subscription): void {
        this.#subscriptions.add(subscription);
    }

    protected unsubscribe(): void {
        this.#subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
        this.#subscriptions.clear();
    }

    #sendToDevTools(actionName: string, payload?: unknown): void {
        this.#devToolsManager?.send(this.#storeName, actionName, payload);
    }

    #cleanup(): void {
        this.unsubscribe();
        this.#unregisterDevTools?.();
    }
}
