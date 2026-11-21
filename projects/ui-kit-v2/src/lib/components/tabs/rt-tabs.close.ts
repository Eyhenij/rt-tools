import { afterNextRender, Injector } from '@angular/core';

import { RtTabDirective } from './rt-tab.directive';
import { IRtTabs } from './rt-tabs.model';

/** Что закрытию нужно от полосы: чтение состояния и три действия над ней. */
export interface IRtTabsCloseDeps {
    readonly injector: Injector;
    readonly selectedId: () => IRtTabs.Id | null;
    readonly closeOn: () => IRtTabs.CloseOn;
    /** Просьба закрыть вкладку: уходит владельцу набора. */
    readonly request: (id: IRtTabs.Id) => void;
    /** Выбор перешёл на другую вкладку после закрытия активной. */
    readonly adopt: (id: IRtTabs.Id) => void;
    readonly focus: (id: IRtTabs.Id) => void;
}

/** Закрытие вкладки: крестик, Delete и то, куда уходит выбор и фокус после перерисовки. */
export class RtTabsClose {
    readonly #deps: IRtTabsCloseDeps;

    constructor(deps: IRtTabsCloseDeps) {
        this.#deps = deps;
    }

    /**
     * Delete на вкладке с видимым крестиком: при `closeOn="selected"` — только на выбранной. Фокус после
     * перерисовки встаёт на активную вкладку: закрытая пропадёт из шапки, и фокус иначе упал бы на страницу.
     */
    public byKey(event: KeyboardEvent, tab: RtTabDirective): void {
        if (!tab.showClose() || (this.#deps.closeOn() === 'selected' && tab.id() !== this.#deps.selectedId())) {
            return;
        }

        event.preventDefault();
        this.close(tab, true);
    }

    /**
     * Просьба закрыть вкладку. Владелец убирает её из набора; если она была активной, выбор после
     * перерисовки переходит на первую доступную, и об этом сообщает `activeIdChange` — иначе владелец,
     * держащий `activeId`, хранил бы id закрытой вкладки и показывал её содержимое снаружи.
     */
    public close(tab: RtTabDirective, focus: boolean): void {
        const closedId: IRtTabs.Id = tab.id();
        const wasActive: boolean = this.#deps.selectedId() === closedId;
        this.#deps.request(closedId);

        afterNextRender(
            (): void => {
                const id: IRtTabs.Id | null = this.#deps.selectedId();
                if (id === null) {
                    return;
                }
                if (wasActive && id !== closedId) {
                    this.#deps.adopt(id);
                }
                if (focus) {
                    this.#deps.focus(id);
                }
            },
            { injector: this.#deps.injector }
        );
    }
}
