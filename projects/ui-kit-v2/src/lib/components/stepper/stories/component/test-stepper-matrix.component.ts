import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtStepLabelDirective } from '../../rt-step-label.directive';
import { RtStepperComponent } from '../../rt-stepper.component';
import { IRtStepper } from '../../rt-stepper.model';

/** Пояснение шага — одно на все ячейки матрицы. */
const STEP_DESCRIPTION: string = 'Готовим договор и согласуем условия.';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TStepperMatrixPart = 'position' | 'length' | 'description' | 'edges' | 'widths' | 'colors' | 'vertical' | 'presets' | 'themes';

/** Описание шага на кадре ширин — то же, что на макете. */
const BOOKING_DESCRIPTION: string = 'Оплатите бронь в течение суток, иначе она будет отменена.';

/** Имена шагов мастера с макета; последний шаг всегда «Готово». */
const BOOKING_NAMES: readonly string[] = ['Даты', 'Оплата', 'Гости', 'Документы', 'Проверка', 'Договор'];

/** Имена шагов мастера заведения объекта с макета: экран на шаг, всего шестнадцать. */
const WIZARD_NAMES: readonly string[] = [
    'Тип',
    'Адрес',
    'Комнаты',
    'Удобства',
    'Фото',
    'Описание',
    'Цены',
    'Календарь',
    'Правила',
    'Гости',
    'Оплата',
    'Документы',
    'Контакты',
    'Проверка',
    'Публикация',
];

/** Отступ точек от краёв у мастера на шестнадцать шагов, как на макете. */
const WIZARD_INSET: number = 8;

/** Случай кадра ширин: подпись, ширина места и набор с текущим шагом. */
interface IStepperWidthCase extends IStepperCase {
    readonly width: number;
    /** Отступ точек от краёв; у таких случаев место обрезает содержимое, и ореол виден целиком. */
    readonly inset: number | null;
}

/** Набор из `total` шагов, как на макете: «Шаг N из M · имя»; подпись текущего можно заменить. */
function bookingSteps(total: number, current: number, label?: string): readonly IRtStepper.Step[] {
    const names: readonly string[] = total > BOOKING_NAMES.length + 1 ? WIZARD_NAMES : BOOKING_NAMES;

    return Array.from({ length: total }, (_value: unknown, index: number): IRtStepper.Step => {
        const name: string = index === total - 1 ? 'Готово' : names[index];
        const text: string = index === current && label ? label : `Шаг ${index + 1} из ${total} · ${name}`;

        return { label: text, description: BOOKING_DESCRIPTION };
    });
}

/** Случай кадра ширин; номер текущего — с нуля, как во входе компонента. */
function widthCase(name: string, width: number, total: number, current: number, label?: string): IStepperWidthCase {
    return { width, inset: null, name: `${name} · ширина ${width}`, steps: bookingSteps(total, current, label), currentIndex: current };
}

/** Случай мастера на шестнадцать шагов с отступом точек 8; номер текущего — с нуля. */
function wizardCase(name: string, width: number, current: number): IStepperWidthCase {
    return {
        width,
        inset: WIZARD_INSET,
        name: `16 шагов, ${name}, отступ точек ${WIZARD_INSET} · ширина ${width}`,
        steps: bookingSteps(16, current),
        currentIndex: current,
    };
}

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

/** Шаги инструкции: у последнего в подписи выделено слово, поэтому подпись рисует шаблон. */
const STEPS_INSTRUCTION: readonly IRtStepper.Step[] = [
    { label: 'Откройте письмо с приглашением', description: 'Оно приходит в течение минуты.' },
    { label: 'Перейдите по ссылке из письма' },
    { label: 'Задайте пароль' },
    { label: 'Войдите под логином' },
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

            @case ('widths') {
                <app-story-presets caption="Любой шаг на любой ширине в обоих наборах">
                    <ng-template>
                        <div style="display: flex; flex-direction: column; gap: 40px">
                            @for (item of widths; track item.name) {
                                <div style="display: flex; flex-direction: column; gap: 12px">
                                    <p style="margin: 0; font-size: 11px">{{ item.name }}</p>
                                    <div
                                        [style.width.px]="item.width"
                                        [style.overflow]="item.inset === null ? null : 'hidden'"
                                        [style.--rt-stepper-inset.px]="item.inset">
                                        <rt-stepper [steps]="item.steps" [currentIndex]="item.currentIndex" />
                                    </div>
                                </div>
                            }
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('colors') {
                <app-story-presets caption="Все семнадцать цветов, переопределённые приложением, в обоих наборах">
                    <ng-template>
                        <div [style]="colorOverrides">
                            <div style="width: 30rem">
                                <rt-stepper [steps]="colorSteps" [currentIndex]="1" />
                            </div>
                            <div style="width: 20rem; margin-block-start: 24px">
                                <rt-stepper orientation="vertical" [steps]="stepsThree" [currentIndex]="1" />
                            </div>
                            <div style="width: 20rem; margin-block-start: 24px">
                                <rt-stepper orientation="vertical" [steps]="stepsThree" [currentIndex]="-1" />
                            </div>
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('vertical') {
                <app-story-presets caption="Вертикальный список в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="20rem" [items]="verticals" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <rt-stepper orientation="vertical" [steps]="item.steps" [currentIndex]="item.currentIndex" />
                            </ng-template>
                        </app-story-row>
                        <p>
                            Инструкция без текущего шага, подпись рисует шаблон
                            <code>rtStepLabel</code>
                        </p>
                        <div style="width: 20rem">
                            <ng-container [ngTemplateOutlet]="instruction" />
                        </div>
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
                                <div style="width: 20rem; margin-block-start: 24px">
                                    <rt-stepper orientation="vertical" [steps]="stepsThree" [currentIndex]="1" />
                                </div>
                                <div style="width: 20rem; margin-block-start: 24px">
                                    <ng-container [ngTemplateOutlet]="instruction" />
                                </div>
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }

        <ng-template #instruction>
            <rt-stepper orientation="vertical" [steps]="stepsInstruction" [currentIndex]="-1">
                <ng-template rtStepLabel let-step let-index="index">
                    @if (index === stepsInstruction.length - 1) {
                        {{ step.label }}
                        <strong>LOGIN</strong>
                    } @else {
                        {{ step.label }}
                    }
                </ng-template>
            </rt-stepper>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtStepperComponent,
        RtStepLabelDirective,
        NgTemplateOutlet,

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

    /**
     * Кадр ширин — тот же набор случаев, что кадр «Ширины и состояния» в макете: третий из
     * четырёх, пять и семь шагов, узкая панель 327, наименьшая ширина 280, широкая 720 и длинные
     * подписи первого и последнего шага. Мастер на шестнадцать шагов снят на 560, 327 и 280; шаги
     * 5 и 12 — те, у которых отрезок подписи самый узкий.
     */
    public readonly widths: readonly IStepperWidthCase[] = [
        widthCase('По умолчанию: 4 шага, текущий второй', 480, 4, 1),
        widthCase('3 из 4', 480, 4, 2),
        widthCase('5 шагов, текущий четвёртый', 480, 5, 3),
        widthCase('Узкая панель: 4 шага, текущий второй', 327, 4, 1),
        widthCase('Узкая панель: 3 из 4', 327, 4, 2),
        widthCase('Узкая панель: 7 шагов, текущий второй', 327, 7, 1),
        widthCase('Узкая панель: первый шаг, длинная подпись', 327, 4, 0, 'Шаг 1 из 4 · Даты заезда и выезда для всей группы гостей'),
        widthCase('Узкая панель: последний шаг, длинная подпись', 327, 4, 3, 'Шаг 4 из 4 · Проверка данных и подтверждение бронирования'),
        widthCase('Наименьшая ширина: 5 шагов, текущий третий', 280, 5, 2),
        widthCase('Широкая панель: 4 шага, текущий второй', 720, 4, 1),
        wizardCase('первый', 560, 0),
        wizardCase('второй', 560, 1),
        wizardCase('девятый', 560, 8),
        wizardCase('последний', 560, 15),
        wizardCase('первый', 327, 0),
        wizardCase('второй', 327, 1),
        wizardCase('пятый', 327, 4),
        wizardCase('двенадцатый', 327, 11),
        wizardCase('пятнадцатый', 327, 14),
        wizardCase('последний', 327, 15),
        wizardCase('первый', 280, 0),
        wizardCase('пятый', 280, 4),
        wizardCase('двенадцатый', 280, 11),
        wizardCase('последний', 280, 15),
    ];

    public readonly colorSteps: readonly IRtStepper.Step[] = bookingSteps(4, 1);

    /**
     * Все семнадцать цветовых свойств степпера, каждое своим цветом: в кадре видно, что каждое
     * доходит до своего места. Полоса — шесть свойств, список — одиннадцать; нейтральные метки
     * рисует список без текущего шага.
     */
    public readonly colorOverrides: string = [
        '--rt-stepper-track-color: var(--rt-color-action-warning)',
        '--rt-stepper-progress-color: var(--rt-color-action-danger)',
        '--rt-stepper-current-color: var(--rt-color-action-success)',
        '--rt-stepper-label-color: var(--rt-color-action-info)',
        '--rt-stepper-description-color: var(--rt-color-action-primary)',
        '--rt-stepper-point-shadow: 0 0 0 4px var(--rt-color-action-warning-hover)',
        '--rt-stepper-line-color: var(--rt-color-action-info)',
        '--rt-stepper-step-label-color: var(--rt-color-action-danger)',
        '--rt-stepper-step-description-color: var(--rt-color-action-success)',
        '--rt-stepper-mark-complete-bg: var(--rt-color-action-primary)',
        '--rt-stepper-mark-complete-color: var(--rt-color-action-on-primary)',
        '--rt-stepper-mark-current-bg: var(--rt-color-action-warning)',
        '--rt-stepper-mark-current-color: var(--rt-color-action-on-warning)',
        '--rt-stepper-mark-upcoming-bg: var(--rt-color-action-info)',
        '--rt-stepper-mark-upcoming-color: var(--rt-color-action-on-info)',
        '--rt-stepper-mark-neutral-bg: var(--rt-color-action-danger)',
        '--rt-stepper-mark-neutral-color: var(--rt-color-action-on-danger)',
    ].join('; ');

    public readonly stepsInstruction: readonly IRtStepper.Step[] = STEPS_INSTRUCTION;

    /** Вертикальный список: текущий в начале, в середине, все пройдены — номер за последним. */
    public readonly verticals: readonly IStepperCase[] = [
        { name: 'текущий — первый', steps: STEPS_FIVE, currentIndex: 0 },
        { name: 'текущий — третий', steps: STEPS_FIVE, currentIndex: 2 },
        { name: 'все пройдены', steps: STEPS_FIVE, currentIndex: 5 },
    ];

    public readonly caseLabel: (value: IStepperCase) => string = (value: IStepperCase): string => value.name;
}
