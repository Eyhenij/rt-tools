import { SanitizePipe } from './sanitize.pipe';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


describe(SanitizePipe.name, () => {
    let pipe: SanitizePipe;
    let sanitizer: DomSanitizer;

    const testString: string = '<div>some text<script>alert("some text")</script></div>';

    beforeEach(() => {
        sanitizer = TestBed.inject<DomSanitizer>(DomSanitizer);
        pipe = new SanitizePipe(sanitizer);

        spyOn(sanitizer, 'bypassSecurityTrustHtml').and.returnValue(testString as SafeHtml);

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
