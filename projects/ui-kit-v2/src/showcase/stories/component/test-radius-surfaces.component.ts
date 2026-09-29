import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { RtActionBarComponent } from '../../../lib/components/action-bar/rt-action-bar.component';
import { IRtActionBar } from '../../../lib/components/action-bar/rt-action-bar.model';
import { RtCardComponent } from '../../../lib/components/card/rt-card.component';
import { RtEmptyStateComponent } from '../../../lib/components/empty-state/rt-empty-state.component';
import { RtFileCardComponent } from '../../../lib/components/file-card/rt-file-card.component';
import { RtFileDropComponent } from '../../../lib/components/file-drop/rt-file-drop.component';
import { RtMarkdownTextComponent } from '../../../lib/components/markdown-text/rt-markdown-text.component';
import { RtMenuItemComponent } from '../../../lib/components/menu/rt-menu-item.component';
import { RtMessageComponent } from '../../../lib/components/message/rt-message.component';
import { RtMoneyListComponent } from '../../../lib/components/money-list/rt-money-list.component';
import { RtMoneyRowComponent } from '../../../lib/components/money-list/rt-money-row.component';
import { RtNoteComponent } from '../../../lib/components/note/rt-note.component';
import { RtNotificationsBellComponent } from '../../../lib/components/notifications-bell/rt-notifications-bell.component';
import { RtPaginationComponent } from '../../../lib/components/pagination/rt-pagination.component';
import { RtSectionNavComponent } from '../../../lib/components/section-nav/rt-section-nav.component';
import { IRtSectionNav } from '../../../lib/components/section-nav/rt-section-nav.model';
import { RtStepperComponent } from '../../../lib/components/stepper/rt-stepper.component';
import { IRtStepper } from '../../../lib/components/stepper/rt-stepper.model';
import { StoryGridComponent } from '../../story-grid.component';
import { RT_RADIUS_COLUMNS, radiusColumnLabel, TRtRadiusColumn } from './test-radius-columns';

/** Поверхности сетки скруглений, по строке на компонент. */
const ROWS: readonly string[] = [
    'card',
    'message',
    'note',
    'menu-item',
    'file-card',
    'file-drop',
    'markdown-text',
    'money-list',
    'action-bar',
    'stepper',
    'pagination',
    'section-nav',
    'notifications-bell',
    'empty-state',
];

/**
 * Демонстрационная обёртка для витрины: каждая поверхность на каждом шаге входа `radius`.
 *
 * В пакет обёртка не уезжает: `tsconfig.lib.json` исключает `src/showcase/**`.
 */
@Component({
    selector: 'app-radius-surfaces',
    templateUrl: './test-radius-surfaces.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        StoryGridComponent,
        RtActionBarComponent,
        RtCardComponent,
        RtEmptyStateComponent,
        RtFileCardComponent,
        RtFileDropComponent,
        RtMarkdownTextComponent,
        RtMenuItemComponent,
        RtMessageComponent,
        RtMoneyListComponent,
        RtMoneyRowComponent,
        RtNoteComponent,
        RtNotificationsBellComponent,
        RtPaginationComponent,
        RtSectionNavComponent,
        RtStepperComponent,
    ],
})
export class TestRtRadiusSurfacesComponent {
    protected readonly rows: readonly string[] = ROWS;

    protected readonly columns: readonly TRtRadiusColumn[] = RT_RADIUS_COLUMNS;

    protected readonly columnLabel: (col: TRtRadiusColumn) => string = radiusColumnLabel;

    protected readonly bar: IRtActionBar.Config = { selected: 2, total: 12, actions: [{ label: 'Удалить', icon: 'trash' }] };

    protected readonly steps: readonly IRtStepper.Step[] = [
        { label: 'Данные', description: 'Имя и адрес' },
        { label: 'Оплата', description: 'Способ оплаты' },
    ];

    protected readonly tiles: readonly IRtSectionNav.Item[] = [{ id: 'orders', icon: 'calendar', label: 'Заказы', active: true }];

    protected readonly page: { pageNumber: number; pageSize: number; totalCount: number } = { pageNumber: 2, pageSize: 10, totalCount: 40 };

    protected readonly code: string = '```\npnpm run build\n```';
}
