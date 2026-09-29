import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtStepperComponent } from '../../rt-stepper.component';
import { IRtStepper } from '../../rt-stepper.model';

/** Пояснение шага — одно на все ячейки матрицы. */
const STEP_DESCRIPTION: string = 'Готовим договор и согласуем условия.';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TStepperMatrixPart = 'position' | 'length' | 'description' | 'edges' | 'presets' | 'themes';

/** Случай набора шагов: имя для подписи ячейки, сам набор и номер текущего шага. */
interface IStepperCase {
    readonly name: string;
    readonly steps: readonly IRtStepper.Step[];
    readonly currentIndex: number;
}

const STEPS_THREE: readonly IRtStepper.Step[] = [
    { label: 'Заявка', description: 'Проверяем данные организации.' },
    { label: 'Договор', description: STEP_DESCRIPTION },
    { label: 'Подключение', description: 'Открываем доступ и передаём ключи.' },
];

const STEPS_FIVE: readonly IRtStepper.Step[] = [
    { label: 'Заявка', description: 'Проверяем данные организации.' },
    { label: 'Проверка', description: 'Сверяем реквизиты с реестром.' },
    { label: 'Договор', description: STEP_DESCRIPTION },
    { label: 'Оплата', description: 'Ждём поступления по счёту.' },
    { label: 'Подключение', description: 'Открываем доступ и передаём ключи.' },
];

/**
 * Матрицы состояний `rt-stepper` для витрины.
 *
 * Своих значений у компонента два — набор шагов и номер текущего, — и осью значений это не
 * назовёшь: показывать надо не перечисление, а положение шага в наборе. Поэтому ряды сложены
 * из случаев: начало, середина и конец полосы; наборы разной длины; описание в один абзац и в
 * несколько; края, на которых компонент уже ломался.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-stepper-matrix',
    template: `
        @switch (part) {
            @case ('position') {
                <app-story-presets caption="Положение шага в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="26rem" [items]="positions" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <rt-stepper [steps]="item.steps" [currentIndex]="item.currentIndex" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('length') {
                <app-story-presets caption="Длина набора в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="26rem" [items]="lengths" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <rt-stepper [steps]="item.steps" [currentIndex]="item.currentIndex" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('description') {
                <app-story-presets caption="Описание шага в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="26rem" [items]="descriptions" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <rt-stepper [steps]="item.steps" [currentIndex]="item.currentIndex" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('edges') {
                <app-story-presets caption="Края в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="26rem" [items]="edges" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <rt-stepper [steps]="item.steps" [currentIndex]="item.currentIndex" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Полоса в обоих наборах">
                    <ng-template>
                        <div style="width: 26rem">
                            <rt-stepper [steps]="stepsThree" [currentIndex]="1" />
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Полоса в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <div style="width: 26rem">
                                    <rt-stepper [steps]="stepsThree" [currentIndex]="1" />
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
        RtStepperComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtStepperMatrixComponent {
    public part: TStepperMatrixPart = 'position';

    public readonly stepsThree: readonly IRtStepper.Step[] = STEPS_THREE;

    /** Заполнение считается по промежуткам: первый шаг — 0 %, последний — 100 %. */
    public readonly positions: readonly IStepperCase[] = [
        { name: 'начало — 0 %', steps: STEPS_THREE, currentIndex: 0 },
        { name: 'середина — 50 %', steps: STEPS_THREE, currentIndex: 1 },
        { name: 'конец — 100 %', steps: STEPS_THREE, currentIndex: 2 },
    ];

    public readonly lengths: readonly IStepperCase[] = [
        { name: 'два шага', steps: STEPS_THREE.slice(0, 2), currentIndex: 0 },
        { name: 'три шага', steps: STEPS_THREE, currentIndex: 1 },
        { name: 'пять шагов', steps: STEPS_FIVE, currentIndex: 2 },
    ];

    /** Описание разбивается на абзацы по пустой строке; пустое абзаца не создаёт. */
    public readonly descriptions: readonly IStepperCase[] = [
        {
            name: 'один абзац',
            steps: [{ label: 'Договор', description: STEP_DESCRIPTION }],
            currentIndex: 0,
        },
        {
            name: 'два абзаца',
            steps: [
                {
                    label: 'Договор',
                    description: 'Готовим договор и согласуем условия.\n\nПодписанный экземпляр придёт на почту в течение дня.',
                },
            ],
            currentIndex: 0,
        },
        {
            name: 'без описания',
            steps: [{ label: 'Договор', description: '' }],
            currentIndex: 0,
        },
    ];

    /**
     * Края, на которых компонент уже ломался: номер за пределами набора зажимается, единственный
     * шаг всегда даёт 0 % — делить не на что, — а пустой набор объявляется нулём.
     */
    public readonly edges: readonly IStepperCase[] = [
        { name: 'один шаг — всегда 0 %', steps: STEPS_THREE.slice(0, 1), currentIndex: 0 },
        { name: 'номер за пределами набора', steps: STEPS_THREE, currentIndex: 99 },
        { name: 'отрицательный номер', steps: STEPS_THREE, currentIndex: -3 },
        { name: 'пустой набор', steps: [], currentIndex: 0 },
    ];

    public readonly caseLabel: (value: IStepperCase) => string = (value: IStepperCase): string => value.name;
}
