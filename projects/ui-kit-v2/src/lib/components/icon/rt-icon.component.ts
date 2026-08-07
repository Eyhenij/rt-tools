import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    numberAttribute,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { IRtIcon } from './rt-icon.model';
import { RtIconRegistry } from './rt-icon.registry';

const SIZES: Readonly<Record<IRtIcon.Size, number>> = Object.freeze({
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 40,
});

const COLORS: Readonly<Record<IRtIcon.Color, string>> = Object.freeze({
    current: 'currentColor',
    muted: 'var(--rt-neutral-600)',
    info: 'var(--rt-color-state-info)',
    success: 'var(--rt-color-state-success)',
    warning: 'var(--rt-color-state-warning)',
    danger: 'var(--rt-color-state-danger)',
    inverse: 'var(--rt-color-text-inverse)',
});

const BEM_BLOCK: string = 'rt-icon';

@Component({
    selector: 'rt-icon',
    template: `
        <svg focusable="false" aria-hidden="true" [attr.viewBox]="'0 0 24 24'">
            <use [attr.href]="href()"></use>
        </svg>
    `,
    styleUrls: ['./rt-icon.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: BEM_BLOCK,
        '[attr.aria-hidden]': "'true'",
        '[style.width.px]': 'sizePx()',
        '[style.height.px]': 'sizePx()',
        '[style.color]': 'colorValue()',
        '[style.transform]': 'rotateStyle()',
    },
})
export class RtIconComponent {
    readonly #registry: RtIconRegistry = inject(RtIconRegistry);

    protected readonly href: Signal<string> = computed((): string => this.#registry.symbolHref(this.name()));

    protected readonly sizePx: Signal<number> = computed((): number => SIZES[this.size()]);

    protected readonly colorValue: Signal<string> = computed((): string => COLORS[this.color()]);

    protected readonly rotateStyle: Signal<string | null> = computed((): string | null => {
        const r: number | null = this.rotate();
        return r !== null && r !== 0 ? `rotate(${r}deg)` : null;
    });

    public readonly name: InputSignal<IRtIcon.Name> = input.required<IRtIcon.Name>();

    public readonly size: InputSignal<IRtIcon.Size> = input<IRtIcon.Size>('md');

    public readonly color: InputSignal<IRtIcon.Color> = input<IRtIcon.Color>('current');

    public readonly rotate: InputSignalWithTransform<number | null, IRotateInput> = input<number | null, IRotateInput>(null, {
        transform: (v: IRotateInput): number | null => {
            if (v === null || v === '') {
                return null;
            }
            return numberAttribute(v, 0);
        },
    });
}

type IRotateInput = number | string | null;
