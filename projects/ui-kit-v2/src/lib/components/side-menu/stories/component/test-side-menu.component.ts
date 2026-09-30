import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IRtSideMenu } from '../../rt-side-menu.model';
import { TestRtSideMenuCellComponent } from './test-side-menu-cell.component';
import { SIDE_MENU_ITEMS } from './test-side-menu-matrix.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое Storybook вешает
 * контролы. Входы кита сигнальные и извне не пишутся — поэтому история целится сюда. В пакет
 * обёртка не уезжает.
 */
@Component({
    selector: 'app-side-menu',
    templateUrl: './test-side-menu.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TestRtSideMenuCellComponent],
})
export class TestRtSideMenuComponent {
    public items: readonly IRtSideMenu.Item[] = SIDE_MENU_ITEMS;
    public activeIds: Array<string | number> = ['reports', 'sales'];
    public mode: IRtSideMenu.SubMenuMode = 'pinned';
    public width: number | null = null;
}
