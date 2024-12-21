import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, inject, input, InputSignalWithTransform, TemplateRef } from '@angular/core';
import { DomSanitizer, SafeValue } from '@angular/platform-browser';

import { isString, Nullable } from '../../util';

@Component({
    selector: 'rtui-popover-container',
    templateUrl: './rtui-popover-container.component.html',
    styleUrls: ['./rtui-popover-container.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgTemplateOutlet],
})
export class RtuiPopoverContainerComponent {
    readonly #sanitizer: DomSanitizer = inject(DomSanitizer);

    public popoverTemplate: InputSignalWithTransform<Nullable<TemplateRef<HTMLElement>>, Nullable<TemplateRef<HTMLElement>>> = input<
        Nullable<TemplateRef<HTMLElement>>,
        Nullable<TemplateRef<HTMLElement>>
    >(undefined, {
        transform: (value: Nullable<TemplateRef<HTMLElement>>) => value ?? null,
    });

    public popoverClass: InputSignalWithTransform<Nullable<string>, string | undefined> = input<Nullable<string>, string | undefined>(
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
