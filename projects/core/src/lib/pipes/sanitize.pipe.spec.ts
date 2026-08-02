import { TestBed } from '@angular/core/testing';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { SanitizePipe } from './sanitize.pipe';

describe(SanitizePipe.name, () => {
    let pipe: SanitizePipe;
    let sanitizer: DomSanitizer;

    const testString: string = '<div>some text<script>alert("some text")</script></div>';

    const setup: (sanitizer: unknown) => SanitizePipe = (sanitizer: unknown): SanitizePipe => {
        return TestBed.configureTestingModule({
            providers: [
                {
                    provide: DomSanitizer,
                    useValue: sanitizer,
                },
                SanitizePipe,
            ],
        }).inject(SanitizePipe);
    };

    beforeEach(() => {
        sanitizer = {
            bypassSecurityTrustHtml: jest.fn(() => testString as SafeHtml),
        } as unknown as DomSanitizer;

        pipe = setup(sanitizer);
        pipe.transform(testString);
    });

    it(`should call "bypassSecurityTrustHtml" with "${testString}"`, () => {
        expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(testString);
    });

    it('should not call "bypassSecurityTrustHtml" with "some other string"', () => {
        expect(sanitizer.bypassSecurityTrustHtml).not.toHaveBeenCalledWith('some other string');
    });

    it(`should return "${testString}"`, () => {
        expect(pipe.transform(testString)).toBe(testString);
    });
});
