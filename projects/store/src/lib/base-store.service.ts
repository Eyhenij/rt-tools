import { DestroyRef, inject, Signal, signal, WritableSignal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { isNil, MessageBus, PlatformService, WINDOW } from '@rt-tools/core';
import { IAction } from './interfaces/action.interface';
import { IBaseStoreService } from './interfaces/base-store-service.interface';
import { IDevToolsConfig, IDevToolsConnection, IDevToolsMessage, IStoreConfig } from './interfaces/devtools.interface';
import { IDevToolsGlobalConfig, STORE_DEVTOOLS_CONFIG } from './tokens/devtools.token';

export abstract class BaseStoreService<STATE_TYPE extends object, MSG_TYPE extends string> implements IBaseStoreService<
    STATE_TYPE,
    MSG_TYPE
> {
    readonly #windowRef: Window = inject(WINDOW);
    readonly #platformService: PlatformService = inject(PlatformService);
    readonly #globalDevToolsConfig: IDevToolsGlobalConfig | null = inject(STORE_DEVTOOLS_CONFIG, { optional: true });

    readonly #store: WritableSignal<STATE_TYPE>;
    public readonly store: Signal<STATE_TYPE>;

    readonly #msgBus: MessageBus<MSG_TYPE> = new MessageBus<MSG_TYPE>();
    readonly #subscriptions: Set<Subscription> = new Set<Subscription>();

    readonly #devTools: IDevToolsConnection | null = null;
    readonly #storeName: string;

    protected constructor(initialState: STATE_TYPE, config?: IStoreConfig) {
        this.#store = signal(initialState);
        this.store = this.#store.asReadonly();
        this.#storeName = config?.name ?? this.constructor.name;

        if (this.#shouldEnableDevTools(config)) {
            this.#devTools = this.#connectDevTools(initialState, this.#mergeDevToolsConfig(config?.devTools));
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

    #shouldEnableDevTools(config?: IStoreConfig): boolean {
        // Local config takes precedence over global config
        const localEnabled: boolean | undefined =
            config?.devTools !== undefined ? (typeof config.devTools === 'boolean' ? config.devTools : true) : undefined;

        const globalEnabled: boolean = this.#globalDevToolsConfig?.enabled ?? false;
        const isEnabled: boolean = localEnabled ?? globalEnabled;

        if (!isEnabled) {
            return false;
        }

        return this.#platformService.isPlatformBrowser && !isNil(this.#windowRef) && !!this.#windowRef.__REDUX_DEVTOOLS_EXTENSION__;
    }

    #mergeDevToolsConfig(localConfig?: boolean | IDevToolsConfig): IDevToolsConfig {
        const globalConfig: IDevToolsConfig = this.#globalDevToolsConfig ?? {};
        const local: IDevToolsConfig = typeof localConfig === 'object' ? localConfig : {};

        return {
            ...globalConfig,
            ...local,
        };
    }

    #connectDevTools(initialState: STATE_TYPE, devToolsConfig?: boolean | IDevToolsConfig): IDevToolsConnection | null {
        if (!this.#windowRef.__REDUX_DEVTOOLS_EXTENSION__) {
            return null;
        }

        const config: IDevToolsConfig = typeof devToolsConfig === 'object' ? devToolsConfig : {};

        const connection: IDevToolsConnection = this.#windowRef.__REDUX_DEVTOOLS_EXTENSION__.connect({
            name: this.#storeName,
            maxAge: 50,
            trace: false,
            ...config,
        });

        connection.init(initialState);

        connection.subscribe((message: IDevToolsMessage) => {
            if (message.type === 'DISPATCH') {
                switch (message.payload?.type) {
                    case 'JUMP_TO_STATE':
                    case 'JUMP_TO_ACTION':
                        if (message.state) {
                            const state: STATE_TYPE = JSON.parse(message.state) as STATE_TYPE;
                            this.#store.set(state);
                        }
                        break;
                    case 'RESET':
                        this.#store.set(initialState);
                        connection.init(initialState);
                        break;
                }
            }
        });

        return connection;
    }

    #sendToDevTools(actionName: string, payload?: unknown): void {
        if (this.#devTools) {
            const action: { type: string; payload?: unknown } = {
                type: `[${this.#storeName}] ${actionName}`,
            };

            if (payload !== undefined) {
                action.payload = payload;
            }

            this.#devTools.send(action, this.#store());
        }
    }

    #cleanup(): void {
        this.unsubscribe();
        this.#devTools?.unsubscribe();
    }
}
