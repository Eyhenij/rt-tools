import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    Signal,
    computed,
    input,
} from '@angular/core';

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
    protected readonly crumbs: Signal<readonly IRtBreadcrumbs.Crumb[]> = computed((): readonly IRtBreadcrumbs.Crumb[] =>
        STORY_BREADCRUMBS_PATH.slice(0, this.depth())
    );

    public readonly depth: InputSignal<number> = input<number>(3);
    public readonly look: InputSignal<IRtBreadcrumbs.Look> = input<IRtBreadcrumbs.Look>('inline');
    public readonly back: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, { transform: booleanAttribute });
    public readonly separator: InputSignal<string> = input<string>('/');
}
