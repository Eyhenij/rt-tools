import { CdkConnectedOverlay } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import { signal, ChangeDetectionStrategy, Component, TemplateRef, ViewEncapsulation, WritableSignal } from '@angular/core';

import { BlockDirective } from '@rt-tools/core';

import { RtTabDirective } from './rt-tab.directive';
import { RtTabsMenuKeysDirective } from './rt-tabs-menu-keys.directive';
import { IRtTabs } from './rt-tabs.model';

const BEM_BLOCK: string = 'rt-tabs-context-menu';

/** Открытое меню: точка нажатия, разметка приложения и вкладка. */
interface IRtTabsContextMenuState {
    readonly point: { readonly x: number; readonly y: number };
    readonly template: TemplateRef<IRtTabs.ContextMenuContext>;
    readonly context: IRtTabs.ContextMenuContext;
}

/**
 * Меню вкладки по правой кнопке. Набор вкладок держит приложение, поэтому и пункты объявляет оно:
 * здесь только место у точки нажатия, панель и закрытие. Нажатие на любой пункт закрывает меню.
 * Вкладка без шаблона оставляет меню браузера.
 */
@Component({
    selector: 'rt-tabs-context-menu',
    templateUrl: './rt-tabs-context-menu.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [CdkConnectedOverlay, NgTemplateOutlet, RtTabsMenuKeysDirective, BlockDirective],
    host: { class: BEM_BLOCK },
})
export class RtTabsContextMenuComponent {
    protected readonly state: WritableSignal<IRtTabsContextMenuState | null> = signal<IRtTabsContextMenuState | null>(null);

    public open(event: MouseEvent, tab: RtTabDirective): void {
        const template: TemplateRef<IRtTabs.ContextMenuContext> | null = tab.contextMenu();
        if (template === null) {
            return;
        }
        event.preventDefault();
        this.state.set({ template, point: RtTabsContextMenuComponent.pointOf(event), context: { $implicit: tab.id() } });
    }

    /** Клавиша меню и Shift+F10 шлют событие без точки: меню встаёт под вкладкой. */
    public static pointOf(event: MouseEvent): { readonly x: number; readonly y: number } {
        if (event.clientX === 0 && event.clientY === 0 && event.target instanceof Element) {
            const box: DOMRect = event.target.getBoundingClientRect();
            return { x: box.left, y: box.bottom };
        }
        return { x: event.clientX, y: event.clientY };
    }

    protected close(): void {
        this.state.set(null);
    }

    protected onKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.close();
        }
    }
}
