import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { RtCardComponent } from '../../../lib/components/card/rt-card.component';
import { RtEmptyStateComponent } from '../../../lib/components/empty-state/rt-empty-state.component';
import { RtFileCardComponent } from '../../../lib/components/file-card/rt-file-card.component';
import { RtMarkdownTextComponent } from '../../../lib/components/markdown-text/rt-markdown-text.component';
import { RtMessageComponent } from '../../../lib/components/message/rt-message.component';
import { RtMoneyListComponent } from '../../../lib/components/money-list/rt-money-list.component';
import { RtMoneyRowComponent } from '../../../lib/components/money-list/rt-money-row.component';
import { RtNoteComponent } from '../../../lib/components/note/rt-note.component';
import { RtSectionNavComponent } from '../../../lib/components/section-nav/rt-section-nav.component';
import { IRtSectionNav } from '../../../lib/components/section-nav/rt-section-nav.model';
import { RtStepperComponent } from '../../../lib/components/stepper/rt-stepper.component';
import { IRtStepper } from '../../../lib/components/stepper/rt-stepper.model';
import { StoryGridComponent } from '../../story-grid.component';
import { TestRtRadiusTableCardComponent } from './test-radius-table-card.component';
import { RT_RADIUS_COLUMNS, radiusColumnLabel, TRtRadiusColumn } from './test-radius-columns';

/** Поверхности сетки скруглений, по строке на компонент. */
const ROWS: readonly string[] = [
    'card',
    'message',
    'note',
    'file-card',
    'markdown-text',
    'money-list',
    'stepper',
    'section-nav',
    'empty-state',
    'table',
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
        RtCardComponent,
        RtEmptyStateComponent,
        RtFileCardComponent,

        RtMarkdownTextComponent,
        RtMessageComponent,
        RtMoneyListComponent,
        RtMoneyRowComponent,
        RtNoteComponent,

        RtSectionNavComponent,
        RtStepperComponent,
        TestRtRadiusTableCardComponent,
    ],
})
export class TestRtRadiusSurfacesComponent {
    protected readonly rows: readonly string[] = ROWS;

    protected readonly columns: readonly TRtRadiusColumn[] = RT_RADIUS_COLUMNS;

    protected readonly columnLabel: (col: TRtRadiusColumn) => string = radiusColumnLabel;

    protected readonly steps: readonly IRtStepper.Step[] = [
        { label: 'Данные', description: 'Имя и адрес' },
        { label: 'Оплата', description: 'Способ оплаты' },
    ];

    protected readonly tiles: readonly IRtSectionNav.Item[] = [{ id: 'orders', icon: 'calendar', label: 'Заказы', active: true }];

    protected readonly code: string = '```\npnpm run build\n```';
}
