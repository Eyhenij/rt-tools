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
    template: `
        <div class="app-drawer__frame">
            <rt-drawer-container class="app-drawer__area">
                <rt-drawer
                    ariaLabel="Фильтры"
                    [mode]="mode"
                    [position]="position"
                    [hasBackdrop]="hasBackdrop"
                    [disableClose]="disableClose"
                    [resizable]="resizable"
                    [(opened)]="opened"
                    [(width)]="width">
                    <div class="app-drawer__filters">
                        <strong>Фильтры</strong>
                        <label>
                            Город
                            <input qa-dataid="drawer-demo-city" />
                        </label>
                        <span>Ширина: {{ width() }}px</span>
                    </div>
                </rt-drawer>
                <section class="app-drawer__report">
                    <button rtButton type="button" qa-dataid="drawer-demo-toggle" (click)="opened.set(!opened())">
                        {{ opened() ? 'Скрыть фильтры' : 'Показать фильтры' }}
                    </button>
                    <p>
                        Отчёт по продажам за квартал. Содержимое сужается, когда панель стоит рядом, и остаётся на месте, когда она ложится
                        поверх.
                    </p>
                </section>
            </rt-drawer-container>
        </div>
    `,
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

    public readonly opened: WritableSignal<boolean> = signal(true);
    public readonly width: WritableSignal<number> = signal(240);
}
