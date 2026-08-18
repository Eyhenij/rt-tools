import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'sanitize',
    pure: true,
})
export class SanitizePipe implements PipeTransform {
    readonly #sanitizer: DomSanitizer = inject(DomSanitizer);

    public transform(value: string): SafeHtml {
        // Обход санитайзера и есть назначение пайпа: он объявлен именно затем, чтобы вызывающий
        // сказал это явно.
        // eslint-disable-next-line sonarjs/no-angular-bypass-sanitization -- см. пояснение выше
        return this.#sanitizer.bypassSecurityTrustHtml(value);
    }
}
