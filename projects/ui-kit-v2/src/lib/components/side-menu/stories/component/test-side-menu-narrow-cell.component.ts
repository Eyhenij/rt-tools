import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { BreakpointsService } from '../../../../platform';
import { RtSideMenuFooterDirective, RtSideMenuHeaderDirective } from '../../rt-side-menu.directives';
import { RtSideMenuComponent } from '../../rt-side-menu.component';
import { TestRtSideMenuCellComponent } from './test-side-menu-cell.component';

/**
 * Та же ячейка, но меню видит узкий экран. Признак узкого экрана кит берёт у своего сервиса по
 * ширине окна, а кадр витрины широкий: ячейка подменяет сервис для своего меню, и узкая раскладка
 * встаёт рядом с широкой в одном кадре.
 */
@Component({
    selector: 'app-side-menu-narrow-cell',
    templateUrl: './test-side-menu-cell.component.html',
    styleUrls: ['./test-side-menu-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: BreakpointsService, useValue: { narrow: signal<boolean>(true) } }],
    imports: [RtSideMenuComponent, RtSideMenuHeaderDirective, RtSideMenuFooterDirective],
})
export class TestRtSideMenuNarrowCellComponent extends TestRtSideMenuCellComponent {}
