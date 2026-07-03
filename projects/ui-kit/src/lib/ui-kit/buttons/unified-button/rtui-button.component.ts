import { BooleanInput } from '@angular/cdk/coercion';
import {
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    Signal,
    booleanAttribute,
    computed,
    inject,
    input,
    output,
} from '@angular/core';
import { MatButton, MatButtonAppearance } from '@angular/material/button';
import { MatRipple } from '@angular/material/core';
import { MatTooltip } from '@angular/material/tooltip';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';
import { transformStringInput } from '@rt-tools/utils';

import { IRtUiConfig, RT_UI_CONFIG, RtUiDesign } from '../../config';
import { RtuiIconComponent, RtuiIconSizeType } from '../../icon';
import { RtuiSpinnerComponent } from '../../spinner';

export namespace IRtuiButton {
    export type Type = 'icon' | 'fab' | 'pill';
    export type Variant = 'default' | 'primary' | 'danger' | 'success' | 'warning' | 'accent';
    export type Size = 'xs' | 'sm' | 'md' | 'lg';
    export type Radius = 'none' | 'sm' | 'md' | 'lg' | 'full';
    export type Appearance = 'solid' | 'outline' | 'light' | 'text';
    export type IconPosition = 'start' | 'end';
}

@Component({
    selector: 'rtui-button',
    templateUrl: './rtui-button.component.html',
    styleUrl: './rtui-button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtuiSpinnerComponent,

        // components
        RtuiIconComponent,

        // material
        MatButton,
        MatRipple,
    ],
    hostDirectives: [
        {
            directive: MatTooltip,
            inputs: [
                'matTooltip: tooltip',
                'matTooltipPosition: tooltipPosition',
                'matTooltipDisabled: tooltipDisabled',
                'matTooltipClass: tooltipClass',
            ],
        },
    ],
    host: {
        '[class.rtui-button-full]': 'fullWidth()',
    },
})
export class RtuiButtonComponent {
    /** App-wide defaults; the resolution order is: instance input → `components.button` → `global` → library default. */
    readonly #config: IRtUiConfig.Config = inject(RT_UI_CONFIG);
    readonly #buttonConfig: IRtUiConfig.Button | undefined = this.#config.components?.button;

    /** Design system the button renders with — see {@link RtUiDesign}. */
    protected readonly resolvedDesign: Signal<RtUiDesign> = computed(
        () => this.design() ?? this.#buttonConfig?.design ?? this.#config.global?.design ?? 'custom'
    );
    protected readonly resolvedSize: Signal<IRtuiButton.Size> = computed(() => this.size() ?? this.#buttonConfig?.size ?? 'md');
    protected readonly resolvedRadius: Signal<IRtuiButton.Radius> = computed(() => this.radius() ?? this.#buttonConfig?.radius ?? 'full');
    protected readonly resolvedAppearance: Signal<IRtuiButton.Appearance | undefined> = computed(
        () => this.appearance() ?? this.#buttonConfig?.appearance
    );
    /** Native Material button appearance the pill renders with under `design: 'material'`. */
    protected readonly materialAppearance: Signal<MatButtonAppearance> = computed(() => {
        const appearanceMap: Record<IRtuiButton.Appearance, MatButtonAppearance> = {
            solid: 'filled',
            outline: 'outlined',
            light: 'tonal',
            text: 'text',
        };
        return appearanceMap[this.resolvedAppearance() ?? 'solid'];
    });
    protected readonly resolvedIconSize: Signal<RtuiIconSizeType> = computed(() => {
        const iconSize: RtuiIconSizeType | undefined = this.iconSize();

        if (iconSize) {
            return iconSize;
        }

        const sizeMap: Record<IRtuiButton.Size, RtuiIconSizeType> = {
            xs: 'xs',
            sm: 'sm',
            md: 'sm',
            lg: 'md',
        };
        return sizeMap[this.resolvedSize()];
    });
    protected readonly spinnerSize: Signal<number> = computed(() => {
        const sizeMap: Record<IRtuiButton.Size, number> = {
            xs: 12,
            sm: 16,
            md: 20,
            lg: 24,
        };
        return this.spinnerDiameter() ?? sizeMap[this.resolvedSize()];
    });
    protected readonly modifiers: Signal<Record<string, boolean>> = computed(() => ({
        [`type-${this.type()}`]: true,
        [`design-${this.resolvedDesign()}`]: true,
        [`variant-${this.variant()}`]: true,
        [`size-${this.resolvedSize()}`]: true,
        [`radius-${this.resolvedRadius()}`]: true,
        [`appearance-${this.resolvedAppearance()}`]: !!this.resolvedAppearance(),
        loading: this.loading(),
        disabled: this.disabled(),
    }));

    public readonly type: InputSignal<IRtuiButton.Type> = input<IRtuiButton.Type>('icon');
    public readonly design: InputSignal<RtUiDesign | undefined> = input<RtUiDesign>();
    public readonly variant: InputSignal<IRtuiButton.Variant> = input<IRtuiButton.Variant>('default');
    public readonly appearance: InputSignal<IRtuiButton.Appearance | undefined> = input<IRtuiButton.Appearance>();
    public readonly size: InputSignal<IRtuiButton.Size | undefined> = input<IRtuiButton.Size>();
    public readonly radius: InputSignal<IRtuiButton.Radius | undefined> = input<IRtuiButton.Radius>();
    public readonly icon: InputSignalWithTransform<string, unknown> = input<string, unknown>('', { transform: transformStringInput });
    public readonly iconPosition: InputSignal<IRtuiButton.IconPosition> = input<IRtuiButton.IconPosition>('start');
    public readonly iconSize: InputSignal<RtuiIconSizeType | undefined> = input<RtuiIconSizeType>();
    public readonly text: InputSignalWithTransform<string, unknown> = input<string, unknown>('', { transform: transformStringInput });
    public readonly loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly outlined: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });
    public readonly fullWidth: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly spinnerDiameter: InputSignal<number | undefined> = input<number>();

    public readonly clicked: OutputEmitterRef<void> = output<void>();

    protected onClick(): void {
        if (!this.loading() && !this.disabled()) {
            this.clicked.emit();
        }
    }
}
