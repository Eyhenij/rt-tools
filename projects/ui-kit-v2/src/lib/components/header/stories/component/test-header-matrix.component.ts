import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtNotificationsBellComponent } from '../../../notifications-bell/rt-notifications-bell.component';
import { StoryGridComponent } from '../../../../../showcase/story-grid.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtHeaderComponent } from '../../rt-header.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type THeaderMatrixPart = 'back' | 'invite' | 'bell' | 'presets' | 'themes';

/**
 * Матрицы состояний `rt-header` для витрины.
 *
 * Обе оси двоичные и перемножены между собой: кнопка приглашения появляется и исчезает из
 * разметки, а **кнопка «назад» не появляется — она проявляется**. Узел есть всегда, видимость
 * даёт модификатор, иначе соседние элементы шапки прыгали бы при каждом переходе. Рядом эти два
 * поведения и различаются: в сетке видно, что место под «назад» занято в обеих строках.
 *
 * Колокольчик приходит проекцией: шапка ничего не знает про уведомления, их состоянием владеет
 * приложение. Поэтому третий ряд показывает шапку с ним и без него.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-header-matrix',
    template: `
        @switch (part) {
            @case ('back') {
                <app-story-grid
                    caption="Кнопка «назад» × приглашение"
                    [rows]="backs"
                    [columns]="invites"
                    [rowLabel]="backLabel"
                    [columnLabel]="inviteLabel">
                    <ng-template let-back let-invite="col">
                        <rt-header [canGoBack]="back" [showInvite]="invite" />
                    </ng-template>
                </app-story-grid>
            }

            @case ('invite') {
                <app-story-row caption="Приглашение" [items]="invites" [itemLabel]="inviteLabel">
                    <ng-template let-value>
                        <rt-header canGoBack [showInvite]="value" />
                    </ng-template>
                </app-story-row>
            }

            @case ('bell') {
                <app-story-row caption="Колокольчик проекцией" [items]="bells">
                    <ng-template let-bell>
                        @switch (bell) {
                            @case ('без колокольчика') {
                                <rt-header canGoBack />
                            }
                            @case ('всё прочитано') {
                                <rt-header canGoBack>
                                    <rt-notifications-bell rtHeaderBell ariaLabel="Уведомления" />
                                </rt-header>
                            }
                            @case ('есть непрочитанные') {
                                <rt-header canGoBack>
                                    <rt-notifications-bell rtHeaderBell unread ariaLabel="Уведомления" />
                                </rt-header>
                            }
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('presets') {
                <app-story-presets caption="Шапка в обоих наборах">
                    <ng-template>
                        <rt-header canGoBack showInvite>
                            <rt-notifications-bell rtHeaderBell unread ariaLabel="Уведомления" />
                        </rt-header>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-themes caption="Шапка в обеих темах">
                    <ng-template>
                        <rt-header canGoBack showInvite>
                            <rt-notifications-bell rtHeaderBell unread ariaLabel="Уведомления" />
                        </rt-header>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtHeaderComponent,
        RtNotificationsBellComponent,

        // showcase
        StoryGridComponent,
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtHeaderMatrixComponent {
    public part: THeaderMatrixPart = 'back';

    public readonly backs: readonly boolean[] = [false, true];
    public readonly invites: readonly boolean[] = [false, true];
    public readonly bells: readonly string[] = ['без колокольчика', 'всё прочитано', 'есть непрочитанные'];

    public readonly backLabel: (value: boolean) => string = (value: boolean): string =>
        value ? '«назад» видна' : '«назад» скрыта — место занято';

    public readonly inviteLabel: (value: boolean) => string = (value: boolean): string =>
        value ? 'приглашение есть' : 'приглашения нет в разметке';
}
