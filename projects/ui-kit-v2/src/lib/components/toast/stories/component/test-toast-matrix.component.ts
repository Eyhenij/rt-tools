import { ChangeDetectionStrategy, Component } from '@angular/core';

import { INotification } from '../../../../platform/notification.model';
import { StoryGridComponent } from '../../../../../showcase/story-grid.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtToastComponent } from '../../rt-toast.component';
import { IRtToaster } from '../../rt-toaster.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type ToastMatrixPart = 'severity' | 'parts' | 'actions' | 'edges' | 'themes';

/** Ничего не делающее действие: в витрине важен вид кнопки, а не её последствие. */
const NOOP: () => void = (): void => undefined;

/**
 * Матрицы состояний `rt-toast` для витрины.
 *
 * **Тосты показываются не входом, а шиной**: стопка `rt-toaster` подписана на шину уведомлений,
 * и других способов показать тост нет. Поэтому матрицы целятся в саму плашку — у неё входы
 * есть, и её вид можно показать без шины, стопки и таймеров.
 *
 * Важность перемножена с заливкой: `filled` меняет читаемость каждой палитры по-своему, и
 * расхождение видно только на этой паре.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-toast-matrix',
    template: `
        @switch (part) {
            @case ('severity') {
                <app-story-grid
                    caption="Важность × заливка"
                    slotWidth="22rem"
                    [rows]="severities"
                    [columns]="fills"
                    [columnLabel]="fillLabel">
                    <ng-template let-severity let-filled="col">
                        <rt-toast [toast]="toastOf(severity, filled)" [index]="0" [totalToasts]="1" [visibleToasts]="3" [duration]="0" />
                    </ng-template>
                </app-story-grid>
            }

            @case ('parts') {
                <app-story-row caption="Из чего собран" slotWidth="22rem" [items]="partCases" [itemLabel]="partLabel">
                    <ng-template let-item>
                        <rt-toast [toast]="item.toast" [index]="0" [totalToasts]="1" [visibleToasts]="3" [duration]="0" />
                    </ng-template>
                </app-story-row>
            }

            @case ('actions') {
                <app-story-row caption="Кнопки действий" slotWidth="22rem" [items]="actionCases" [itemLabel]="partLabel">
                    <ng-template let-item>
                        <rt-toast [toast]="item.toast" [index]="0" [totalToasts]="1" [visibleToasts]="3" [duration]="0" />
                    </ng-template>
                </app-story-row>
            }

            @case ('edges') {
                <app-story-row caption="Края" slotWidth="22rem" [items]="edgeCases" [itemLabel]="partLabel">
                    <ng-template let-item>
                        <rt-toast [toast]="item.toast" [index]="0" [totalToasts]="1" [visibleToasts]="3" [duration]="0" />
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Плашки в обеих темах">
                    <ng-template>
                        <div style="display: grid; gap: 0.5rem; width: 20rem">
                            @for (severity of severities; track severity) {
                                <rt-toast
                                    [toast]="toastOf(severity, false)"
                                    [index]="0"
                                    [totalToasts]="1"
                                    [visibleToasts]="3"
                                    [duration]="0" />
                            }
                        </div>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtToastComponent,

        // showcase
        StoryGridComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtToastMatrixComponent {
    public part: ToastMatrixPart = 'severity';

    public readonly severities: readonly INotification.Severity[] = ['info', 'success', 'warning', 'danger'];
    public readonly fills: readonly boolean[] = [false, true];

    /** Из чего плашка собрана: всё, кроме сообщения, необязательно. */
    public readonly partCases: readonly { name: string; toast: IRtToaster.Toast }[] = [
        { name: 'только сообщение', toast: { id: 1, severity: 'info', message: 'Договор сохранён' } },
        {
            name: 'с описанием',
            toast: {
                id: 2,
                severity: 'info',
                message: 'Договор сохранён',
                description: 'Изменения увидят все участники после обновления страницы.',
            },
        },
        {
            name: 'с надстрочником',
            toast: { id: 3, severity: 'info', message: 'Договор сохранён', meta: 'Иванов И. И. · 14 марта, 16:02' },
        },
        {
            name: 'всё вместе',
            toast: {
                id: 4,
                severity: 'info',
                message: 'Договор сохранён',
                meta: 'Иванов И. И. · 14 марта, 16:02',
                description: 'Изменения увидят все участники после обновления страницы.',
            },
        },
    ];

    public readonly actionCases: readonly { name: string; toast: IRtToaster.Toast }[] = [
        { name: 'без действий', toast: { id: 5, severity: 'warning', message: 'Черновик не сохранён' } },
        {
            name: 'одно действие',
            toast: { id: 6, severity: 'warning', message: 'Черновик не сохранён', action: { label: 'Сохранить', handler: NOOP } },
        },
        {
            name: 'два действия',
            toast: {
                id: 7,
                severity: 'danger',
                message: 'Не удалось отправить',
                action: { label: 'Повторить', handler: NOOP },
                secondaryAction: { label: 'Отменить', handler: NOOP },
            },
        },
    ];

    public readonly edgeCases: readonly { name: string; toast: IRtToaster.Toast }[] = [
        {
            name: 'длинное сообщение',
            toast: {
                id: 8,
                severity: 'info',
                message: 'Дополнительное соглашение номер четыре к договору от 14 марта 2024 года сохранено',
            },
        },
        {
            name: 'длинное описание',
            toast: {
                id: 9,
                severity: 'info',
                message: 'Договор сохранён',
                description:
                    'Изменения увидят все участники после обновления страницы. Уведомления о правке уйдут на почту, указанную в карточке организации.',
            },
        },
        { name: 'пустое сообщение', toast: { id: 10, severity: 'info', message: '' } },
    ];

    public readonly fillLabel: (value: boolean) => string = (value: boolean): string => (value ? 'filled' : 'обычная');

    public readonly partLabel: (value: { name: string }) => string = (value: { name: string }): string => value.name;

    /** Плашка одной важности: заливка приходит признаком `filled` в самом тосте. */
    public toastOf(severity: INotification.Severity, filled: boolean): IRtToaster.Toast {
        return { id: 1, severity, message: `Сообщение «${severity}»`, filled };
    }
}
