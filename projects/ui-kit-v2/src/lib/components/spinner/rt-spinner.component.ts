import { NumberInput } from '@angular/cdk/coercion';
import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    input,
    InputSignal,
    InputSignalWithTransform,
    numberAttribute,
    ViewEncapsulation,
} from '@angular/core';

import { IRtSpinner } from './rt-spinner.model';

const BEM_BLOCK: string = 'rt-spinner';

/**
 * Атомарный rotating-spinner для loading-индикаторов.
 *
 * Чистый CSS keyframe (border + animation rotate), zero deps. Без conditional
 * rendering и backdrop'а — это ответственность parent'а (например `rt-table`
 * sticky overlay).
 *
 * Размер задаётся через `[diameter]` (px); цвет — через `[color]`
 * (`primary` / `neutral` / `on-primary`).
 *
 * Анимация уважает `@media (prefers-reduced-motion)` — у пользователей с
 * включённым reduced-motion spinner не вращается.
 */
@Component({
    selector: 'rt-spinner',
    template: '',
    styleUrls: ['./rt-spinner.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: BEM_BLOCK,
        role: 'status',
        'aria-live': 'polite',
    },
})
export class RtSpinnerComponent {
    /** Диаметр spinner'а в px. Default 32. */
    public readonly diameter: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(32, {
        transform: numberAttribute,
    });

    /** Семантическая палитра. Default `primary`. */
    public readonly color: InputSignal<IRtSpinner.Color> = input<IRtSpinner.Color>('primary');

    @HostBinding('class')
    public get hostClasses(): Record<string, boolean> {
        return {
            [BEM_BLOCK]: true,
            [`${BEM_BLOCK}--${this.color()}`]: true,
        };
    }

    @HostBinding('style.--rt-spinner-diameter')
    public get cssDiameter(): string {
        return `${this.diameter()}px`;
    }
}
