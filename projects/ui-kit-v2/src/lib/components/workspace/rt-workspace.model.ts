import { Signal, TemplateRef } from '@angular/core';

import { TRtAsideContentLayout } from '@rt-tools/ui-kit-v2/aside';

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
        /** Заголовок шапки панели: `null` оставляет в шапке стрелку и надпись «Сведения» */
        title: Signal<string | null>;
        /** Раскладка содержимого асайда: `tabs`, когда шаблон сведений — вкладки */
        contentLayout: Signal<TRtAsideContentLayout>;
    }

    export interface PersistedState {
        listWidth: number;
        asideWidth: number;
        asideCollapsed: boolean;
    }
}
