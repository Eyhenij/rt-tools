import { ChangeDetectionStrategy, Component, HostBinding, InputSignal, Signal, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { Nullable } from '../../util';

@Component({
    standalone: true,
    selector: 'rtui-icon',
    template: `
        <svg>
            <use [attr.href]="glyphHref()"></use>
        </svg>
    `,
    styles: [
        `
            :host {
                display: inline-flex;
                line-height: 0;

                svg {
                    flex-shrink: 1;
                }
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtuiIconComponent {
    readonly #sanitizer: DomSanitizer = inject(DomSanitizer);

    protected readonly glyphHref: Signal<string> = computed(() => `#icon-${this.glyph()}`);

    public glyph: InputSignal<string> = input.required<string>();
    public size: InputSignal<number> = input<number>(16);
    public rotate: InputSignal<Nullable<string | number>> = input<Nullable<string | number>>();

    @HostBinding('style')
    public get style(): Nullable<SafeStyle> {
        let styleStr: string = '';

        if (this.rotate()) {
            styleStr += `transform: rotate(${this.rotate()}deg);`;
        }

        if (this.size()) {
            styleStr += `height:${this.size()}px; width:${this.size()}px;`;
        }

        return styleStr.length ? this.#sanitizer.bypassSecurityTrustStyle(styleStr) : undefined;
    }
}
