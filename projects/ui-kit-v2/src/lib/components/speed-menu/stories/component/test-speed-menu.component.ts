import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtSpeedMenuComponent } from '../../rt-speed-menu.component';
import { IRtSpeedMenu } from '../../rt-speed-menu.model';
import { SPEED_MENU_ZOOM } from './test-speed-menu.data';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое Storybook вешает
 * контролы, и играет роль приложения — пишет, какое действие выбрано. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-speed-menu',
    templateUrl: './test-speed-menu.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtSpeedMenuComponent],
})
export class TestRtSpeedMenuComponent {
    public direction: IRtSpeedMenu.Direction = 'up';
    public size: IRtSpeedMenu.Size = 'lg';
    public variant: IRtSpeedMenu.Variant = 'primary';
    public icon: string = 'zoom_in';
    public label: string = 'Масштаб';
    public closeOnSelect: boolean = false;
    public disabled: boolean = false;

    public readonly actions: readonly IRtSpeedMenu.Action[] = SPEED_MENU_ZOOM;

    public chosen: string = '—';

    public onSelect(value: string): void {
        this.chosen = value;
    }
}
