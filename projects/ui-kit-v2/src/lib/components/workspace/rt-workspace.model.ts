import { Signal, TemplateRef } from '@angular/core';

export namespace IRtWorkspace {
    export type PanelKind = 'list' | 'aside';

    export interface PanelApi {
        asideCollapsed: Signal<boolean>;
        asideOpen: Signal<boolean>;
        /** Панель сведений открывается поверх окна боковой панелью с затемнением */
        asideOverlay: Signal<boolean>;
        toggleAsideCollapsed(): void;
        openAside(): void;
        closeAside(): void;
        toggleAside(): void;
    }

    export interface SlotContext {
        $implicit: PanelApi;
    }

    /** Что получает панель сведений, открытая поверх окна */
    export interface AsideOverlayData {
        template: TemplateRef<SlotContext>;
        context: SlotContext;
        width: number;
    }

    export interface PersistedState {
        listWidth: number;
        asideWidth: number;
        asideCollapsed: boolean;
    }
}
