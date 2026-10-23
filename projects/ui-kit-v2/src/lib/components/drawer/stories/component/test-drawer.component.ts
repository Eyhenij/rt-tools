import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';

import { RtButtonDirective } from '../../../button/rt-button.directive';
import { RtDrawerContainerComponent } from '../../rt-drawer-container.component';
import { RtDrawerComponent } from '../../rt-drawer.component';
import { IRtDrawer } from '../../rt-drawer.model';

/**
 * Демонстрационная обёртка для витрины: участок страницы с панелью фильтров рядом с отчётом.
 * Контролы Storybook пишут место, край, подложку, запрет закрытия и ручку; открытие и ширина живут
 * здесь сигналами, потому что панель пишет их сама — подложкой, Escape и ручкой. В пакет не уезжает.
 */
@Component({
    selector: 'app-drawer',
    templateUrl: './test-drawer.component.html',
    // native-ok: рамка участка страницы и демонстрационное содержимое, в пакет не уезжает
    styles: `
        .app-drawer__frame {
            width: 44rem;
            max-width: 100%;
            height: 18rem;
            border: 1px solid var(--rt-color-border-subtle);
        }

        .app-drawer__area {
            height: 100%;
        }

        .app-drawer__filters,
        .app-drawer__report {
            display: flex;
            flex-direction: column;
            padding: var(--rt-space-4);
            font-size: var(--rt-text-sm);
            gap: var(--rt-space-3);
        }

        .app-drawer__report {
            align-items: flex-start;
        }

        .app-drawer__filters {
            position: relative;
            min-height: 100%;
            box-sizing: border-box;
        }

        .app-drawer__flyout {
            position: absolute;
            padding: var(--rt-space-2);
            border: 1px solid var(--rt-color-border-subtle);
            background: var(--rt-color-bg-surface);
            box-shadow: var(--rt-shadow-lg);
            inset-block-end: var(--rt-space-4);
            inset-inline-start: calc(100% + var(--rt-space-2));
            white-space: nowrap;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtButtonDirective,
        RtDrawerComponent,
        RtDrawerContainerComponent,
    ],
})
export class TestRtDrawerComponent {
    public mode: IRtDrawer.Mode = 'side';
    public position: IRtDrawer.Position = 'start';
    public hasBackdrop: boolean = true;
    public disableClose: boolean = false;
    public resizable: boolean = true;
    public overflow: IRtDrawer.Overflow = 'clip';
    public autoWidth: boolean = false;
    public autoFocus: IRtDrawer.AutoFocus = true;

    public readonly opened: WritableSignal<boolean> = signal(true);
    public readonly width: WritableSignal<number> = signal(240);
    public readonly events: WritableSignal<string[]> = signal<string[]>([]);

    public onWidth(width: number | null): void {
        if (width !== null) {
            this.width.set(width);
        }
    }

    public note(event: string): void {
        this.events.update((events: string[]): string[] => [...events.slice(-3), event]);
    }
}
