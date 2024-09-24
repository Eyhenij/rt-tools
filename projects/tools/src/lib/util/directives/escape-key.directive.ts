import { Directive, HostListener, OutputEmitterRef, output } from '@angular/core';

@Directive({
    standalone: true,
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
