import { Directive, InputSignalWithTransform, booleanAttribute, input } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[rtTableSelectorsDirective]',
})
export class RtTableSelectorsDirective {
    public isOutlined: InputSignalWithTransform<unknown, boolean> = input<unknown, boolean>(false, {
        alias: 'rtIconOutlinedDirective',
        transform: booleanAttribute,
    });
}
