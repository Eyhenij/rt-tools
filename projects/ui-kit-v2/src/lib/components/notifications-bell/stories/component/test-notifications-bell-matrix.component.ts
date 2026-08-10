import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtNotificationsBellComponent } from '../../rt-notifications-bell.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type NotificationsBellMatrixPart = 'unread' | 'states' | 'themes';

/**
 * Матрицы состояний `rt-notifications-bell` для витрины.
 *
 * Ось у колокольчика одна и двоичная — есть непрочитанное или нет, — и весь компонент про то,
 * видно ли точку. Поэтому матриц три: сама ось, состояния указателя и пара тем. Больше здесь
 * показывать нечего, и объявлено это прямо, а не оставлено пустым местом.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-notifications-bell-matrix',
    template: `
        @switch (part) {
            @case ('unread') {
                <app-story-row caption="Непрочитанное" [items]="unreads" [itemLabel]="unreadLabel">
                    <ng-template let-value>
                        <rt-notifications-bell ariaLabel="Уведомления" unreadLabel="Есть непрочитанные" [unread]="value" />
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Взаимодействие" [items]="states" [itemLabel]="stateLabel">
                    <ng-template let-state>
                        <rt-notifications-bell unread ariaLabel="Уведомления" [attr.data-story-state]="state.state" />
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Колокольчик в обеих темах">
                    <ng-template>
                        <rt-notifications-bell ariaLabel="Уведомления" />
                        <rt-notifications-bell unread ariaLabel="Уведомления" />
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtNotificationsBellComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtNotificationsBellMatrixComponent {
    public part: NotificationsBellMatrixPart = 'unread';

    public readonly unreads: readonly boolean[] = [false, true];

    public readonly states: readonly IStoryState[] = STORY_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    public readonly unreadLabel: (value: boolean) => string = (value: boolean): string =>
        value ? 'есть непрочитанные — точка' : 'всё прочитано';
}
