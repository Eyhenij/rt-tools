import { join } from 'node:path';

import { compileString } from 'sass';

/**
 * Схема цвета перекрашивает шкалу марки и синий шаг материального набора на корне страницы. Спрашивается
 * то, что миксин выводит: линтер стилей и сборка молчат, если схема перестанет доставать до набора.
 */

function scheme(ramp: string): string {
    return compileString(`@use 'color-scheme' as s;\n@include s.rt-color-scheme('teal', ${ramp});`, {
        loadPaths: [join(__dirname)],
    }).css;
}

describe('цветовая схема', () => {
    it('SC-UKV-479 — схема отвечает на корне признаком data-rt-scheme и переписывает шаги марки и материального набора', () => {
        const css: string = scheme('(50: #e6f4f3, 500: #008582, 600: #00706d)');

        expect(css).toContain(':root[data-rt-scheme=teal]');
        expect(css).toContain('--rt-brand-50: #e6f4f3;');
        expect(css).toContain('--rt-brand-500: #008582;');
        expect(css).toContain('--rt-brand-600: #00706d;');
        expect(css).toContain('--rt-mat-blue-100: #008582;');
    });

    it('SC-UKV-479 — схема без шага 500 и схема с шагом вне шкалы отказывают при сборке', () => {
        expect(() => scheme('(600: #00706d)')).toThrow(/step 500/);
        expect(() => scheme('(500: #008582, 550: #007a77)')).toThrow(/unknown step 550/);
    });
});
