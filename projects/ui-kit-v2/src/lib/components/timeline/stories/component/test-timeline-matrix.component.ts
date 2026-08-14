import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtTimelineComponent } from '../../rt-timeline.component';
import { IRtTimeline } from '../../rt-timeline.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TimelineMatrixPart = 'status' | 'fields' | 'length' | 'edges' | 'themes';

/** Случай ленты: имя для подписи ячейки и сам набор шагов. */
interface ITimelineCase {
    readonly name: string;
    readonly steps: readonly IRtTimeline.Step[];
}

const STEPS_MIXED: readonly IRtTimeline.Step[] = [
    { label: 'Заявка принята', meta: '12 марта, 09:14', actor: 'Отдел продаж', status: 'complete' },
    { label: 'Договор подписан', meta: '14 марта, 16:02', actor: 'Юридический отдел', status: 'complete' },
    { label: 'Ожидает оплаты', meta: '15 марта, 10:30', actor: 'Бухгалтерия', status: 'current' },
    { label: 'Подключение', status: 'pending' },
];

/**
 * Матрицы состояний `rt-timeline` для витрины.
 *
 * Ось значений здесь одна — состояние шага, — и она показывается лентой, где стоят все три
 * сразу: пройденный, текущий и предстоящий. Остальные ряды сложены из случаев: необязательные
 * поля по отдельности, длина ленты и края, на которых лента рисуется пустой.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-timeline-matrix',
    template: `
        @switch (part) {
            @case ('status') {
                <app-story-row caption="Состояние шага" slotWidth="20rem" [items]="statuses" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-timeline [steps]="item.steps" />
                    </ng-template>
                </app-story-row>
            }

            @case ('fields') {
                <app-story-row caption="Необязательные поля" slotWidth="20rem" [items]="fields" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-timeline [steps]="item.steps" />
                    </ng-template>
                </app-story-row>
            }

            @case ('length') {
                <app-story-row caption="Длина ленты" slotWidth="20rem" [items]="lengths" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-timeline [steps]="item.steps" />
                    </ng-template>
                </app-story-row>
            }

            @case ('edges') {
                <app-story-row caption="Края" slotWidth="20rem" [items]="edges" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-timeline [steps]="item.steps" />
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Лента в обеих темах">
                    <ng-template>
                        <div style="width: 20rem">
                            <rt-timeline [steps]="stepsMixed" />
                        </div>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTimelineComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtTimelineMatrixComponent {
    public part: TimelineMatrixPart = 'status';

    public readonly stepsMixed: readonly IRtTimeline.Step[] = STEPS_MIXED;

    /** Три состояния стоят в одной ленте: порознь не видно, чем полая точка отличается от заполненной. */
    public readonly statuses: readonly ITimelineCase[] = [
        { name: 'все три состояния', steps: STEPS_MIXED },
        {
            name: 'только пройденные',
            steps: [
                { label: 'Заявка принята', meta: '12 марта, 09:14', status: 'complete' },
                { label: 'Договор подписан', meta: '14 марта, 16:02', status: 'complete' },
            ],
        },
        {
            name: 'только предстоящие',
            steps: [
                { label: 'Оплата', status: 'pending' },
                { label: 'Подключение', status: 'pending' },
            ],
        },
    ];

    /** `meta` и `actor` необязательны и рисуются по отдельности: исполнитель без времени допустим. */
    public readonly fields: readonly ITimelineCase[] = [
        {
            name: 'время и исполнитель',
            steps: [{ label: 'Договор подписан', meta: '14 марта, 16:02', actor: 'Юридический отдел', status: 'complete' }],
        },
        { name: 'только время', steps: [{ label: 'Договор подписан', meta: '14 марта, 16:02', status: 'complete' }] },
        { name: 'только исполнитель', steps: [{ label: 'Договор подписан', actor: 'Юридический отдел', status: 'complete' }] },
        { name: 'одна подпись', steps: [{ label: 'Договор подписан', status: 'complete' }] },
    ];

    /** Соединительная линия рисуется между пунктами и не рисуется после последнего. */
    public readonly lengths: readonly ITimelineCase[] = [
        { name: 'один шаг — линии нет', steps: [{ label: 'Заявка принята', meta: '12 марта, 09:14', status: 'current' }] },
        { name: 'два шага', steps: STEPS_MIXED.slice(0, 2) },
        { name: 'четыре шага', steps: STEPS_MIXED },
    ];

    /** Пустой набор рисует пустой список, а не заглушку: текст «событий нет» подставляет потребитель. */
    public readonly edges: readonly ITimelineCase[] = [
        { name: 'пустой набор', steps: [] },
        {
            name: 'длинная подпись',
            steps: [
                {
                    label: 'Заявка на подключение дополнительного рабочего места принята к рассмотрению',
                    meta: '12 марта, 09:14',
                    actor: 'Отдел продаж',
                    status: 'current',
                },
            ],
        },
    ];

    public readonly caseLabel: (value: ITimelineCase) => string = (value: ITimelineCase): string => value.name;
}
