import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, inject, input, InputSignalWithTransform, TemplateRef } from '@angular/core';
import { DomSanitizer, SafeValue } from '@angular/platform-browser';

import { INullable } from '@rt-tools/utils';
import { isString } from '@rt-tools/utils';

const BEM_BLOCK: string = 'rtui-popover-container';

@Component({
    selector: 'rtui-popover-container',
    templateUrl: './rtui-popover-container.component.html',
    styleUrls: ['./rtui-popover-container.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgTemplateOutlet],
    host: { class: BEM_BLOCK },
})
export class RtuiPopoverContainerComponent {
    readonly #sanitizer: DomSanitizer = inject(DomSanitizer);

    public popoverTemplate: InputSignalWithTransform<INullable<TemplateRef<HTMLElement>>, INullable<TemplateRef<HTMLElement>>> = input<
        INullable<TemplateRef<HTMLElement>>,
        INullable<TemplateRef<HTMLElement>>
    >(undefined, {
        transform: (value: INullable<TemplateRef<HTMLElement>>) => value ?? null,
    });

    public popoverClass: InputSignalWithTransform<INullable<string>, string | undefined> = input<INullable<string>, string | undefined>(
        undefined,
        {
            transform: (value: unknown) => (isString(value) ? value : undefined),
        }
    );

    @HostBinding('class')
    public get className(): SafeValue {
        return this.#sanitizer.sanitize(1, this.popoverClass() as string) as SafeValue;
    }
}
