import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtBreadcrumbsComponent } from '../../rt-breadcrumbs.component';
import { IRtBreadcrumbs } from '../../rt-breadcrumbs.model';
import { STORY_BREADCRUMBS_PATH } from './story-breadcrumbs';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-breadcrumbs',
    templateUrl: './test-breadcrumbs.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtBreadcrumbsComponent,
    ],
})
export class TestRtBreadcrumbsComponent {
    public depth: number = 3;
    public look: IRtBreadcrumbs.Look = 'inline';
    public back: boolean = true;
    public separator: string = '/';

    public get crumbs(): readonly IRtBreadcrumbs.Crumb[] {
        return STORY_BREADCRUMBS_PATH.slice(0, this.depth);
    }
}
