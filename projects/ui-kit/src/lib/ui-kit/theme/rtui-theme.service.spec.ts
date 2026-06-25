import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import * as path from 'path';
import * as sass from 'sass';

import { RtThemeService } from './rtui-theme.service';
import { RT_COLOR_SCHEME_STORAGE_KEY, RT_DARK_CLASS, RT_SCHEME_ATTRIBUTE, RtColorSchemeRamp } from './rtui-theme.types';

const STYLES_DIR: string = path.join(__dirname, '../../../styles');

/** Sorted `name:value` pairs (whitespace-insensitive) of custom-property declarations in a CSS block. */
function declarationSet(css: string): string[] {
    const out: string[] = [];
    const re: RegExp = /(--rt-color-[\w-]+):\s*([^;]+);/g;
    let match: RegExpExecArray | null = re.exec(css);

    while (match !== null) {
        out.push(`${match[1]}:${match[2].trim()}`);
        match = re.exec(css);
    }

    return out.sort();
}

describe('RtThemeService', () => {
    let document: Document;

    beforeEach(() => {
        window.localStorage.clear();
        TestBed.configureTestingModule({});
    });

    afterEach(() => {
        window.localStorage.clear();
        document?.documentElement.removeAttribute(RT_SCHEME_ATTRIBUTE);
        document?.documentElement.classList.remove(RT_DARK_CLASS);
    });

    function setup(): RtThemeService {
        const service: RtThemeService = TestBed.inject(RtThemeService);
        document = TestBed.inject(DOCUMENT);
        TestBed.tick();

        return service;
    }

    describe('color scheme — runtime', () => {
        it('sets data-rt-scheme on <html> and persists the name', () => {
            const service: RtThemeService = setup();

            service.setColorScheme('teal');
            TestBed.tick();

            expect(service.colorScheme()).toBe('teal');
            expect(document.documentElement.getAttribute(RT_SCHEME_ATTRIBUTE)).toBe('teal');
            expect(window.localStorage.getItem(RT_COLOR_SCHEME_STORAGE_KEY)).toBe('teal');
        });

        it('clears the scheme on null and removes the attribute + storage key', () => {
            const service: RtThemeService = setup();
            service.setColorScheme('teal');
            TestBed.tick();

            service.setColorScheme(null);
            TestBed.tick();

            expect(service.colorScheme()).toBeNull();
            expect(document.documentElement.hasAttribute(RT_SCHEME_ATTRIBUTE)).toBe(false);
            expect(window.localStorage.getItem(RT_COLOR_SCHEME_STORAGE_KEY)).toBeNull();
        });

        it("treats 'default' as a cleared scheme", () => {
            const service: RtThemeService = setup();

            service.setColorScheme('default');
            TestBed.tick();

            expect(service.colorScheme()).toBeNull();
            expect(document.documentElement.hasAttribute(RT_SCHEME_ATTRIBUTE)).toBe(false);
        });

        it('restores a persisted scheme on construction', () => {
            window.localStorage.setItem(RT_COLOR_SCHEME_STORAGE_KEY, 'teal');

            const service: RtThemeService = setup();

            expect(service.colorScheme()).toBe('teal');
            expect(document.documentElement.getAttribute(RT_SCHEME_ATTRIBUTE)).toBe('teal');
        });

        it('is orthogonal to the light/dark theme', () => {
            const service: RtThemeService = setup();

            service.setColorScheme('teal');
            service.setTheme('dark');
            TestBed.tick();

            expect(document.documentElement.getAttribute(RT_SCHEME_ATTRIBUTE)).toBe('teal');
            expect(document.documentElement.classList.contains(RT_DARK_CLASS)).toBe(true);
        });
    });

    describe('registerColorScheme', () => {
        const teal: RtColorSchemeRamp = {
            primary: { 20: '#b3e3e1', 40: '#5cb8b5', 60: '#1a9d99', 100: '#008582' },
            brand: { 20: '#e8e8e8', 100: '#008582' },
        };

        it('injects a <style> with the scoped [data-rt-scheme] block', () => {
            const service: RtThemeService = setup();

            service.registerColorScheme('teal', teal);

            const style: HTMLElement | null = document.getElementById('rt-color-scheme-teal');
            expect(style).not.toBeNull();
            expect(style!.textContent).toContain(`[${RT_SCHEME_ATTRIBUTE}="teal"]`);
            expect(style!.textContent).toContain('--rt-color-primary-100:#008582');
        });

        it('replaces an existing scheme style instead of duplicating it', () => {
            const service: RtThemeService = setup();

            service.registerColorScheme('teal', teal);
            service.registerColorScheme('teal', { primary: { 100: '#006a67' } });

            const styles: NodeListOf<Element> = document.querySelectorAll('#rt-color-scheme-teal');
            expect(styles.length).toBe(1);
            expect(styles[0].textContent).toContain('--rt-color-primary-100:#006a67');
        });

        it('produces declarations identical to the rt.color-scheme Sass mixin (parity)', () => {
            const service: RtThemeService = setup();
            service.registerColorScheme('teal', teal);

            const jsBlock: string = document.getElementById('rt-color-scheme-teal')!.textContent ?? '';
            const sassCss: string = sass.compileString(
                "@use 'main' as rt;\n@include rt.color-scheme('teal', (" +
                    'primary: (20: #b3e3e1, 40: #5cb8b5, 60: #1a9d99, 100: #008582),' +
                    'brand: (20: #e8e8e8, 100: #008582)));',
                { loadPaths: [STYLES_DIR] }
            ).css;
            // isolate the scheme block — the full compile also emits the default :root role rows
            const sassBlock: string = sassCss.slice(sassCss.indexOf('[data-rt-scheme=teal]'));

            expect(declarationSet(jsBlock)).toEqual(declarationSet(sassBlock));
        });

        it('validates its input like the Sass mixin (parity)', () => {
            const service: RtThemeService = setup();

            expect(() => service.registerColorScheme('x', { bogus: { 100: '#000' } } as RtColorSchemeRamp)).toThrow(/unknown role/i);
            expect(() => service.registerColorScheme('x', { primary: { 150: '#000' } })).toThrow(/integer 0–100/i);
            expect(() => service.registerColorScheme('', teal)).toThrow(/non-empty string/i);
            expect(() => service.registerColorScheme('default', teal)).toThrow(/non-empty string/i);
        });
    });
});
