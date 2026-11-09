import { CdkConnectedOverlay } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import { signal, ChangeDetectionStrategy, Component, TemplateRef, ViewEncapsulation, WritableSignal } from '@angular/core';

import { BlockDirective } from '@rt-tools/core';

import { RtTabDirective } from './rt-tab.directive';
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
    imports: [CdkConnectedOverlay, NgTemplateOutlet, BlockDirective],
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
        this.state.set({ template, point: { x: event.clientX, y: event.clientY }, context: { $implicit: tab.id() } });
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
