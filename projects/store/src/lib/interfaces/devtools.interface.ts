import { InjectionToken } from '@angular/core';

export interface IDevToolsGlobalConfig extends IDevToolsConfig {
    /** Enable DevTools globally (default: false) */
    enabled: boolean;
}

export const STORE_DEVTOOLS_CONFIG: InjectionToken<IDevToolsGlobalConfig> = new InjectionToken<IDevToolsGlobalConfig>(
    'Global configuration for store DevTools integration'
);

export interface IDevToolsExtension {
    connect(options?: IDevToolsConfig): IDevToolsConnection;
}

export interface IDevToolsConfig {
    /** Name shown in DevTools */
    name?: string;
    /** Maximum number of actions to keep in history */
    maxAge?: number;
    /** Serialize state and actions */
    serialize?: boolean;
    /** Actions to hide from DevTools */
    actionsDenylist?: string[];
    /** Only show these actions in DevTools */
    actionsAllowlist?: string[];
    /** Enable trace to see action call stack */
    trace?: boolean;
    /** Maximum stack frames to show */
    traceLimit?: number;
}

export interface IDevToolsConnection {
    /** Initialize DevTools with state */
    init(state: unknown): void;
    /** Send action and new state to DevTools */
    send(action: string | { type: string; payload?: unknown }, state: unknown): void;
    /** Subscribe to DevTools messages (for time-travel) */
    subscribe(listener: (message: IDevToolsMessage) => void): () => void;
    /** Unsubscribe all listeners */
    unsubscribe(): void;
    /** Send error message to DevTools */
    error(message: string): void;
}

export interface IDevToolsMessage {
    type: string;
    payload?: {
        type: string;
        actionId?: number;
    };
    state?: string;
}

export interface IStoreConfig {
    /** Store name shown in DevTools */
    name?: string;
    /** Enable DevTools integration (default: true in dev mode) */
    devTools?: boolean | IDevToolsConfig;
}

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION__?: IDevToolsExtension;
    }
}
