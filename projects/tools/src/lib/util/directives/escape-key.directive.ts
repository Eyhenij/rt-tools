import { Directive, HostListener, output, OutputEmitterRef } from '@angular/core';

@Directive({
    selector: '[rtEscapeKey]',
})
export class RtEscapeKeyDirective {
    public readonly escapeKeyAction: OutputEmitterRef<void> = output<void>();

    @HostListener('document:keydown', ['$event'])
    public handleKeyboardEvent(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.escapeKeyAction.emit();
        }
    }
}
