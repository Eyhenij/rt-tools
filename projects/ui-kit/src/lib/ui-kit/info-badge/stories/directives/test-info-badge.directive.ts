import { Directive, HostBinding, inject, input, InputSignal, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { getColorBasedOnBackground } from '../../calculate-text-color-based-on-back';
import { InfoBadgeType } from '../../info-badge-types.enum';

@Directive({
    selector: '[rtTestInfoBadge]',
})
export class TestInfoBadgeDirective implements OnInit {
    readonly #sanitizer: DomSanitizer = inject(DomSanitizer);

    private infoBadgeColors: { [key: string]: string } | null = null;
    public type: InputSignal<InfoBadgeType> = input.required();

    public ngOnInit(): void {
        /**
         * The directive is needed to determine color of the badge depending on project color palette.
         * In project, you can use:
         *  if (this.#platformService.isPlatformBrowser) {
         *             this.infoBadgeColors = {
         *                 success: this.#document.body.computedStyleMap().get('--clr-cell-success').toString(),
         *                 info: this.#document.body.computedStyleMap().get('--clr-yellow').toString(),
         *                 warning: this.#document.body.computedStyleMap().get('--clr-red-100').toString(),
         *                 primary: this.#document.body.computedStyleMap().get('--clr-base-accent').toString(),
         *                 disabled: this.#document.body.computedStyleMap().get('--clr-gray').toString(),
         *             };
         *         }
         */

        this.infoBadgeColors = {
            success: '#8bc34a',
            info: '#e1b12c',
            warning: '#eb5055',
            primary: '#4285f4',
            disabled: '#747474',
        };
    }

    @HostBinding('style')
    public get style(): SafeStyle | undefined {
        let style: string = '';

        if (this.infoBadgeColors) {
            style += `color: ${getColorBasedOnBackground(this.infoBadgeColors[`${this.type()}`])};`;
            style += `background: ${this.infoBadgeColors[`${this.type()}`]};`;
        }

        return !!style.length ? this.#sanitizer.bypassSecurityTrustStyle(style) : undefined;
    }
}
