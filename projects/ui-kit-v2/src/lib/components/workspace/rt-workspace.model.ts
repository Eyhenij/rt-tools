import { Signal } from '@angular/core';

export namespace IRtWorkspace {
    export type PanelKind = 'list' | 'aside';

    export interface PanelApi {
        asideCollapsed: Signal<boolean>;
        asideOpen: Signal<boolean>;
        toggleAsideCollapsed(): void;
        openAside(): void;
        closeAside(): void;
        toggleAside(): void;
    }

    export interface SlotContext {
        $implicit: PanelApi;
    }

    export interface PersistedState {
        listWidth: number;
        asideWidth: number;
        asideCollapsed: boolean;
    }
}
