import { BooleanInput } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    Signal,
    ViewEncapsulation,
    WritableSignal,
    booleanAttribute,
    computed,
    inject,
    input,
    signal,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import { RtIconOutlinedDirective, transformStringInput } from '@rt-tools/utils';

export type RtuiIconSizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '3xl';
export type RtuiIconThemeType =
    | 'inherit'
    | 'primary'
    | 'primary-strong'
    | 'neutral'
    | 'disabled'
    | 'muted'
    | 'white'
    | 'danger'
    | 'success';

const MATERIAL_SYMBOLS_FONT: string = 'Material Symbols Outlined';
const fontLoaded: WritableSignal<boolean> = signal<boolean>(false);

@Component({
    selector: 'rtui-icon',
    templateUrl: './rtui-icon.component.html',
    styleUrl: './rtui-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // material
        MatIcon,

        // directives
        RtIconOutlinedDirective,
    ],
    hostDirectives: [
        {
            directive: MatTooltip,
            inputs: ['matTooltip: tooltip', 'matTooltipPosition: tooltipPosition', 'matTooltipDisabled: tooltipDisabled'],
        },
    ],
    host: {
        class: 'rtui-icon',
        '[class]': 'hostClasses()',
    },
})
export class RtuiIconComponent {
    readonly #document: Document = inject(DOCUMENT);

    protected readonly fontLoaded: Signal<boolean> = fontLoaded.asReadonly();
    protected readonly hostClasses: Signal<string> = computed(() => {
        const classes: string[] = [`rtui-icon--size-${this.size()}`, `rtui-icon--theme-${this.theme()}`];

        if (this.rotate()) {
            classes.push('rtui-icon--rotate');
        }

        if (!this.fontLoaded()) {
            classes.push('rtui-icon--loading');
        }

        return classes.join(' ');
    });

    public readonly size: InputSignal<RtuiIconSizeType> = input<RtuiIconSizeType>('md');
    public readonly theme: InputSignal<RtuiIconThemeType> = input<RtuiIconThemeType>('inherit');
    public readonly glyph: InputSignalWithTransform<string, unknown> = input<string, unknown>('', { transform: transformStringInput });
    public readonly outlined: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });
    public readonly rotate: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    constructor() {
        if (!fontLoaded()) {
            this.#checkFontLoaded();
        }
    }

    #checkFontLoaded(): void {
        const fonts: FontFaceSet = this.#document.fonts;

        if (fonts.check(`1rem "${MATERIAL_SYMBOLS_FONT}"`)) {
            fontLoaded.set(true);
            return;
        }

        fonts.ready.then(() => {
            fontLoaded.set(true);
        });
    }
}
