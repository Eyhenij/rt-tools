import { DestroyRef, inject, Injectable, Signal } from '@angular/core';

import { isNil, PlatformService, WINDOW } from '@rt-tools/core';

import { IDevToolsConnection, IDevToolsMessage } from '../interfaces/devtools.interface';
import { IDevToolsGlobalConfig, STORE_DEVTOOLS_CONFIG } from '../tokens/devtools.token';

interface IRegisteredStore {
    name: string;
    getState: () => unknown;
    setState: (state: unknown) => void;
}

/**
 * @description Global DevTools manager that aggregates all stores into a single DevTools connection.
 * This allows viewing all store states in Redux DevTools simultaneously.
 */
@Injectable({ providedIn: 'root' })
export class DevToolsManagerService {
    readonly #windowRef: Window = inject(WINDOW);
    readonly #platformService: PlatformService = inject(PlatformService);
    readonly #globalConfig: IDevToolsGlobalConfig | null = inject(STORE_DEVTOOLS_CONFIG, { optional: true });

    readonly #stores: Map<string, IRegisteredStore> = new Map();
    #devTools: IDevToolsConnection | null = null;
    #isInitialized: boolean = false;

    constructor() {
        inject(DestroyRef).onDestroy(() => this.#cleanup());
    }

    public get isEnabled(): boolean {
        if (!this.#globalConfig?.enabled) {
            return false;
        }
        return this.#platformService.isPlatformBrowser && !isNil(this.#windowRef) && !!this.#windowRef.__REDUX_DEVTOOLS_EXTENSION__;
    }

    /**
     * @description Register a store with the DevTools manager.
     * @param name - Unique name for the store
     * @param store - Signal containing the store state
     * @param setState - Function to update store state (for time-travel)
     * @returns Unregister function
     */
    public register<T>(name: string, store: Signal<T>, setState: (state: T) => void): () => void {
        if (!this.isEnabled) {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            return (): void => {};
        }

        this.#stores.set(name, {
            name,
            getState: (): T => store(),
            setState: (state: unknown): void => setState(state as T),
        });

        if (!this.#isInitialized) {
            this.#initDevTools();
        } else {
            this.#sendState(`[${name}] registered`);
        }

        return (): void => {
            this.#stores.delete(name);
            this.#sendState(`[${name}] unregistered`);
        };
    }

    /**
     * @description Send an action to DevTools with current aggregated state.
     * @param storeName - Name of the store dispatching the action
     * @param actionName - Name of the action
     * @param payload - Optional action payload
     */
    public send(storeName: string, actionName: string, payload?: unknown): void {
        if (!this.#devTools) return;

        const action: { type: string; payload?: unknown } = {
            type: `[${storeName}] ${actionName}`,
        };

        if (payload !== undefined) {
            action.payload = payload;
        }

        this.#sendState(action.type);
    }

    #initDevTools(): void {
        if (!this.#windowRef.__REDUX_DEVTOOLS_EXTENSION__ || this.#isInitialized) {
            return;
        }

        this.#devTools = this.#windowRef.__REDUX_DEVTOOLS_EXTENSION__.connect({
            name: this.#globalConfig?.name ?? 'RT Store',
            maxAge: this.#globalConfig?.maxAge ?? 50,
            trace: this.#globalConfig?.trace ?? false,
            ...this.#globalConfig,
        });

        this.#devTools.init(this.#getAggregatedState());
        this.#isInitialized = true;

        this.#devTools.subscribe((message: IDevToolsMessage) => {
            if (message.type === 'DISPATCH') {
                switch (message.payload?.type) {
                    case 'JUMP_TO_STATE':
                    case 'JUMP_TO_ACTION':
                        if (message.state) {
                            const aggregatedState: Record<string, unknown> = JSON.parse(message.state) as Record<string, unknown>;
                            this.#applyAggregatedState(aggregatedState);
                        }
                        break;
                    case 'RESET':
                        // Reset is not supported for aggregated stores
                        break;
                }
            }
        });
    }

    #getAggregatedState(): Record<string, unknown> {
        const state: Record<string, unknown> = {};
        this.#stores.forEach((store: IRegisteredStore, name: string) => {
            state[name] = store.getState();
        });
        return state;
    }

    #applyAggregatedState(aggregatedState: Record<string, unknown>): void {
        Object.entries(aggregatedState).forEach(([name, state]: [string, unknown]) => {
            const store: IRegisteredStore | undefined = this.#stores.get(name);
            if (store) {
                store.setState(state);
            }
        });
    }

    #sendState(actionType: string): void {
        if (!this.#devTools) return;
        this.#devTools.send({ type: actionType }, this.#getAggregatedState());
    }

    #cleanup(): void {
        this.#devTools?.unsubscribe();
        this.#stores.clear();
    }
}
