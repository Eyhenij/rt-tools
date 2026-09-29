import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtTimelineComponent } from '../../rt-timeline.component';
import { IRtTimeline } from '../../rt-timeline.model';

/** Первый шаг ленты. */
const FIRST_STEP: string = 'Заявка принята';

/** Время первого шага. */
const FIRST_TIME: string = '12 марта, 09:14';

/** Второй шаг ленты. */
const SECOND_STEP: string = 'Договор подписан';

/** Время второго шага. */
const SECOND_TIME: string = '14 марта, 16:02';

/** Кто сделал второй шаг. */
const LEGAL_ACTOR: string = 'Юридический отдел';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TTimelineMatrixPart = 'status' | 'fields' | 'length' | 'edges' | 'presets' | 'themes';

/** Случай ленты: имя для подписи ячейки и сам набор шагов. */
interface ITimelineCase {
    readonly name: string;
    readonly steps: readonly IRtTimeline.Step[];
}

const STEPS_MIXED: readonly IRtTimeline.Step[] = [
    { label: FIRST_STEP, meta: FIRST_TIME, actor: 'Отдел продаж', status: 'complete' },
    { label: SECOND_STEP, meta: SECOND_TIME, actor: LEGAL_ACTOR, status: 'complete' },
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
                <app-story-presets caption="Состояние шага в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="20rem" [items]="statuses" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <rt-timeline [steps]="item.steps" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('fields') {
                <app-story-presets caption="Необязательные поля в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="20rem" [items]="fields" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <rt-timeline [steps]="item.steps" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('length') {
                <app-story-presets caption="Длина ленты в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="20rem" [items]="lengths" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <rt-timeline [steps]="item.steps" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('edges') {
                <app-story-presets caption="Края в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="20rem" [items]="edges" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <rt-timeline [steps]="item.steps" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Лента в обоих наборах">
                    <ng-template>
                        <div style="width: 20rem">
                            <rt-timeline [steps]="stepsMixed" />
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Лента в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <div style="width: 20rem">
                                    <rt-timeline [steps]="stepsMixed" />
                                </div>
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTimelineComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtTimelineMatrixComponent {
    public part: TTimelineMatrixPart = 'status';

    public readonly stepsMixed: readonly IRtTimeline.Step[] = STEPS_MIXED;

    /** Три состояния стоят в одной ленте: порознь не видно, чем полая точка отличается от заполненной. */
    public readonly statuses: readonly ITimelineCase[] = [
        { name: 'все три состояния', steps: STEPS_MIXED },
        {
            name: 'только пройденные',
            steps: [
                { label: FIRST_STEP, meta: FIRST_TIME, status: 'complete' },
                { label: SECOND_STEP, meta: SECOND_TIME, status: 'complete' },
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
            steps: [{ label: SECOND_STEP, meta: SECOND_TIME, actor: LEGAL_ACTOR, status: 'complete' }],
        },
        { name: 'только время', steps: [{ label: SECOND_STEP, meta: SECOND_TIME, status: 'complete' }] },
        { name: 'только исполнитель', steps: [{ label: SECOND_STEP, actor: LEGAL_ACTOR, status: 'complete' }] },
        { name: 'одна подпись', steps: [{ label: SECOND_STEP, status: 'complete' }] },
    ];

    /** Соединительная линия рисуется между пунктами и не рисуется после последнего. */
    public readonly lengths: readonly ITimelineCase[] = [
        { name: 'один шаг — линии нет', steps: [{ label: FIRST_STEP, meta: FIRST_TIME, status: 'current' }] },
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
                    meta: FIRST_TIME,
                    actor: 'Отдел продаж',
                    status: 'current',
                },
            ],
        },
    ];

    public readonly caseLabel: (value: ITimelineCase) => string = (value: ITimelineCase): string => value.name;
}
