import { Directive, output, OutputEmitterRef } from '@angular/core';

@Directive({
    selector: '[rtEscapeKey]',
    host: {
        '(document:keydown)': 'handleKeyboardEvent($event)',
    },
})
export class RtEscapeKeyDirective {
    public readonly escapeKeyAction: OutputEmitterRef<void> = output<void>();

    public handleKeyboardEvent(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.escapeKeyAction.emit();
        }
    }
}
