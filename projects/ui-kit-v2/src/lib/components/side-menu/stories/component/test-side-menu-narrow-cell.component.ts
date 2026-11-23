import { booleanAttribute, ChangeDetectionStrategy, Component, input, InputSignal, InputSignalWithTransform, signal } from '@angular/core';

import { BreakpointsService } from '../../../../platform';
import { IRtSideMenu } from '../../rt-side-menu.model';
import { TestRtSideMenuCellComponent } from './test-side-menu-cell.component';

/**
 * Та же ячейка, но меню видит узкий экран. Признак узкого экрана кит берёт у своего сервиса по
 * ширине окна, а кадр витрины широкий: обёртка подменяет сервис для ячейки внутри себя, и узкая
 * раскладка встаёт рядом с широкой в одном кадре.
 */
@Component({
    selector: 'app-side-menu-narrow-cell',
    templateUrl: './test-side-menu-narrow-cell.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: BreakpointsService,
            useValue: { narrow: signal<boolean>(true), viewportNarrow: signal<boolean>(true), phone: signal<boolean>(true) },
        },
    ],
    imports: [TestRtSideMenuCellComponent],
})
export class TestRtSideMenuNarrowCellComponent {
    public readonly items: InputSignal<readonly IRtSideMenu.Item[]> = input.required<readonly IRtSideMenu.Item[]>();
    public readonly activeIds: InputSignal<ReadonlyArray<string | number>> = input<ReadonlyArray<string | number>>([]);
    /** Пункт полосы, чей раздел открыть нажатием. */
    public readonly openId: InputSignal<string | number | null> = input<string | number | null>(null);
    /** Шапка и подвал полосы. */
    public readonly slots: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, { transform: booleanAttribute });
}
