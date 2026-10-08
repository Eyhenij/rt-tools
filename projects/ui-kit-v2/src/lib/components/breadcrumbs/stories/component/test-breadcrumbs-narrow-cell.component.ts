import { ChangeDetectionStrategy, Component, input, InputSignal, signal } from '@angular/core';

import { BreakpointsService } from '../../../../platform';
import { RtBreadcrumbsComponent } from '../../rt-breadcrumbs.component';
import { IRtBreadcrumbs } from '../../rt-breadcrumbs.model';

/**
 * Ячейка, в которой путь видит узкий экран. Признак узкого экрана кит берёт у своего сервиса по
 * ширине окна, а кадр витрины широкий: ячейка подменяет сервис для своего пути, и свёрнутый путь
 * встаёт рядом с полным в одном кадре.
 */
@Component({
    selector: 'app-breadcrumbs-narrow-cell',
    templateUrl: './test-breadcrumbs-narrow-cell.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: BreakpointsService, useValue: { narrow: signal<boolean>(true) } }],
    imports: [
        // components
        RtBreadcrumbsComponent,
    ],
})
export class TestRtBreadcrumbsNarrowCellComponent {
    public readonly crumbs: InputSignal<readonly IRtBreadcrumbs.Crumb[]> = input.required<readonly IRtBreadcrumbs.Crumb[]>();
}
