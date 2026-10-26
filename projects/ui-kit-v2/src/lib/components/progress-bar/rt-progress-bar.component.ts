import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    InputSignal,
    InputSignalWithTransform,
    numberAttribute,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { IRtProgressBar } from './rt-progress-bar.model';

const BEM_BLOCK: string = 'rt-progress-bar';

/** Доля, зажатая в 0–100: значение из потока может выйти за края, полоса и объявление — нет. */
export function clampProgress(value: number): number {
    if (Number.isNaN(value)) {
        return 0;
    }

    return Math.min(100, Math.max(0, value));
}

/**
 * Полоса прогресса: дорожка во всю ширину и заполнение поверх. В режиме `determinate` заполнение
 * равно `value` процентов и плавно идёт за ним — так полоса показывает живой прогресс задачи из
 * потока. В режиме `indeterminate` по дорожке бежит отрезок: доля неизвестна, известно, что
 * работа идёт.
 *
 * Для чтения с экрана полоса — `progressbar` с долей; без доли значение не объявляется.
 */
@Component({
    selector: 'rt-progress-bar',
    templateUrl: './rt-progress-bar.component.html',
    styleUrl: './rt-progress-bar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // directives
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
        role: 'progressbar',
        'qa-dataid': 'progress-bar',
        'aria-valuemin': '0',
        'aria-valuemax': '100',
        '[attr.aria-valuenow]': 'determinate() ? percent() : null',
        '[attr.aria-label]': 'ariaLabel()',
        '[class.rt-progress-bar--indeterminate]': '!determinate()',
        '[class]': '"rt-progress-bar--color--" + color()',
    },
})
export class RtProgressBarComponent {
    protected readonly determinate: Signal<boolean> = computed((): boolean => this.mode() === 'determinate');

    protected readonly percent: Signal<number> = computed((): number => Math.round(clampProgress(this.value())));

    /** Ширина заполнения: в режиме без доли её задаёт движение, а не вход. */
    protected readonly fillWidth: Signal<number | null> = computed((): number | null =>
        this.determinate() ? clampProgress(this.value()) : null
    );

    public readonly mode: InputSignal<IRtProgressBar.Mode> = input<IRtProgressBar.Mode>('determinate');

    /** Доля в процентах, 0–100; что выходит за края, прижимается к ним. */
    public readonly value: InputSignalWithTransform<number, unknown> = input(0, { transform: numberAttribute });

    public readonly color: InputSignal<IRtProgressBar.Color> = input<IRtProgressBar.Color>('primary');

    /** Что за прогресс — для чтения с экрана, когда рядом нет видимой подписи. */
    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);
}
