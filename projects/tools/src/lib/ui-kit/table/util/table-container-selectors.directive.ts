import { Directive, InputSignalWithTransform, booleanAttribute, input } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[rtTableContainerSelectorsDirective]',
})
export class RtTableContainerSelectorsDirective {
    public isOutlined: InputSignalWithTransform<unknown, boolean> = input<unknown, boolean>(false, {
        alias: 'rtIconOutlinedDirective',
        transform: booleanAttribute,
    });
}
