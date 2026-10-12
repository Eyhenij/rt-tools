import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    InputSignal,
    model,
    ModelSignal,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { IRtIcon, rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtSpinnerComponent } from '@rt-tools/ui-kit-v2/spinner';
import { IRtTimeline, RtTimelineComponent } from '@rt-tools/ui-kit-v2/timeline';
import { RtTooltipDirective } from '@rt-tools/ui-kit-v2/tooltip';

import { IRtAiRunStatus } from './rt-ai-run-status.model';

const BEM_BLOCK: string = 'rt-ai-run-status';

/** Значок и его цвет по состоянию; у `running` значка нет — на его месте крутилка. */
const MARKS: Readonly<Record<Exclude<IRtAiRunStatus.State, 'running'>, { name: IRtIcon.Name; color: IRtIcon.Color }>> = {
    done: { name: 'check-circle', color: 'success' },
    stopped: { name: 'times-circle', color: 'muted' },
    failed: { name: 'exclamation-circle', color: 'danger' },
};

let runStatusIdSeed: number = 0;

function nextRunStatusId(): number {
    runStatusIdSeed += 1;
    return runStatusIdSeed;
}

/**
 * Строка хода работы ИИ-ассистента: значок состояния, подпись текущего шага или итога, мета
 * (время, число шагов) и раскрытие списка пройденных шагов. Пока модель работает, по подписи
 * бежит блик; при `prefers-reduced-motion` подпись стоит ровным цветом.
 *
 * Компонент презентационный: состояние, подпись и шаги приходят готовыми, разбор потока
 * событий модели остаётся в приложении.
 */
@Component({
    selector: 'rt-ai-run-status',
    templateUrl: './rt-ai-run-status.component.html',
    styleUrl: './rt-ai-run-status.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // angular
        NgTemplateOutlet,

        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtIconComponent,
        RtSpinnerComponent,
        RtTimelineComponent,
        RtTooltipDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtAiRunStatusComponent {
    readonly #t_aiShowSteps: Signal<string> = rtKitLabel('aiShowSteps');
    readonly #t_aiHideSteps: Signal<string> = rtKitLabel('aiHideSteps');

    protected readonly stepsId: string = `rt-ai-run-status-steps-${nextRunStatusId()}`;

    protected readonly hasSteps: Signal<boolean> = computed((): boolean => this.steps().length > 0);

    protected readonly isOpen: Signal<boolean> = computed((): boolean => this.hasSteps() && this.expanded());

    protected readonly mark: Signal<{ name: IRtIcon.Name; color: IRtIcon.Color } | null> = computed(
        (): { name: IRtIcon.Name; color: IRtIcon.Color } | null => {
            const state: IRtAiRunStatus.State = this.state();
            return state === 'running' ? null : MARKS[state];
        }
    );

    protected readonly toggleLabel: Signal<string> = computed((): string =>
        this.isOpen() ? this.#t_aiHideSteps() : this.#t_aiShowSteps()
    );

    public readonly state: InputSignal<IRtAiRunStatus.State> = input.required<IRtAiRunStatus.State>();

    /** Подпись: текущий шаг, пока модель работает, или итог — «Worked for 31s». */
    public readonly label: InputSignal<string> = input.required<string>();

    /** Вторичная строка справа от подписи: время шага или число шагов. Пусто — не рисуется. */
    public readonly meta: InputSignal<string> = input<string>('');

    /** Пройденные шаги. Пустой список — строку нельзя раскрыть. */
    public readonly steps: InputSignal<readonly IRtTimeline.Step[]> = input<readonly IRtTimeline.Step[]>([]);

    /** Раскрыт ли список шагов. */
    public readonly expanded: ModelSignal<boolean> = model<boolean>(false);

    protected onToggle(): void {
        this.expanded.set(!this.expanded());
    }
}
