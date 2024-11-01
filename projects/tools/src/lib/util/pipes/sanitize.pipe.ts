import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    standalone: true,
    name: 'sanitize',
    pure: true,
})
export class SanitizePipe implements PipeTransform {
    readonly #sanitizer: DomSanitizer = inject(DomSanitizer);

    public transform(value: string): SafeHtml {
        return this.#sanitizer.bypassSecurityTrustHtml(value);
    }
}
