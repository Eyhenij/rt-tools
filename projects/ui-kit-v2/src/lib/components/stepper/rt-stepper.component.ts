import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    InputSignal,
    InputSignalWithTransform,
    numberAttribute,
    Signal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { IRtStepper } from './rt-stepper.model';

const BEM_BLOCK: string = 'rt-stepper';

/**
 * Линейный прогресс-степпер: тонкая полоса, набор точек и подпись
 * текущего шага. Шаги задаются через input `steps` (массив `IRtStepper.Step`
 * со связкой label + description), активный шаг — через `currentIndex`.
 *
 * Активная точка увеличена и подсвечивается янтарным; над ней висит подпись
 * текущего шага (тоже янтарная, выравнивается по краю на крайних шагах).
 * Пройденные точки и заполненная часть полосы — progress-цвет; будущие точки
 * и трек — приглушённый цвет (в dark-теме оба ухода от яркого синего). Под
 * полосой — описание текущего шага, многоабзацное (`\n\n`). Сам список названий
 * шагов на ui не выводится — публичен только текущий, остальные читаются
 * скринридером через aria.
 */
@Component({
    selector: 'rt-stepper',
    templateUrl: './rt-stepper.component.html',
    styleUrl: './rt-stepper.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtStepperComponent {
    /**
     * Номер шага, зажатый в набор. Индекс приходит снаружи и может выйти за
     * границы; полоса и якорь подписи это уже переживали, а вот объявление для
     * скринридера — нет: при `currentIndex: 99` на трёх шагах на прогрессбаре
     * оказывалось `aria-valuenow="100"` при `aria-valuemax="3"`, а подпись шага
     * пропадала вовсе. Зажимаем один раз здесь, чтобы показ и объявление не
     * могли разойтись.
     */
    readonly #safeIndex: Signal<number> = computed((): number => {
        const total: number = this.steps().length;
        return Math.max(0, Math.min(this.currentIndex(), total - 1));
    });

    protected readonly currentStep: Signal<IRtStepper.Step | null> = computed(
        (): IRtStepper.Step | null => this.steps()[this.#safeIndex()] ?? null
    );

    /** Номер текущего шага для скринридера: `0`, когда шагов нет вовсе. */
    protected readonly currentStepNumber: Signal<number> = computed((): number => (this.steps().length === 0 ? 0 : this.#safeIndex() + 1));

    /**
     * Доля заполненной полосы от 0 до 100. На один шаг и меньше — 0%, иначе
     * `idx / (total - 1)`. Без clamp в шаблоне получаем переполнение если
     * передадут `currentIndex > total`.
     */
    protected readonly progressPercent: Signal<number> = computed((): number => {
        const total: number = this.steps().length;
        if (total <= 1) {
            return 0;
        }
        return (this.#safeIndex() / (total - 1)) * 100;
    });

    protected readonly totalSteps: Signal<number> = computed((): number => this.steps().length);

    /**
     * Якорь подписи текущего шага: подпись висит над активной точкой и не должна
     * вылезать за края рельсы. Первый шаг — выравнивание по левому краю точки,
     * последний — по правому, остальные центрируются над точкой.
     */
    protected readonly labelAnchor: Signal<'start' | 'center' | 'end'> = computed((): 'start' | 'center' | 'end' => {
        const total: number = this.steps().length;
        const idx: number = this.#safeIndex();
        if (idx <= 0) {
            return 'start';
        }
        if (idx >= total - 1) {
            return 'end';
        }
        return 'center';
    });

    /** Абзацы описания текущего шага: бэк отдаёт плоскую строку, делим по `\n\n`. */
    protected readonly descriptionParagraphs: Signal<readonly string[]> = computed((): readonly string[] => {
        const text: string = this.currentStep()?.description ?? '';
        if (text.length === 0) {
            return [];
        }
        return text.split('\n\n');
    });

    public readonly steps: InputSignal<readonly IRtStepper.Step[]> = input<readonly IRtStepper.Step[]>([]);

    public readonly currentIndex: InputSignalWithTransform<number, number | string> = input<number, number | string>(0, {
        transform: numberAttribute,
    });
}
