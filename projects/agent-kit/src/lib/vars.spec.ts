import { IRenderResult, placeholdersOf, renderVars } from './vars.js';

describe('renderVars', () => {
    it('дырка заменяется значением', () => {
        expect(renderVars('ветка {{mainBranch}}', { mainBranch: 'main' }).text).toBe('ветка main');
    });

    it('дырка без значения остаётся в тексте и попадает в отказ', () => {
        const result: IRenderResult = renderVars('префикс {{componentPrefix}}', {});

        expect(result.missing).toEqual(['componentPrefix']);
        expect(result.text).toBe('префикс {{componentPrefix}}');
    });

    it('одна и та же дырка называется в отказе один раз', () => {
        expect(renderVars('{{a}} и ещё {{a}}', {}).missing).toEqual(['a']);
    });

    it('пустое значение — это значение, а не пропуск', () => {
        const result: IRenderResult = renderVars('порт {{port}}.', { port: '' });

        expect(result.missing).toEqual([]);
        expect(result.text).toBe('порт .');
    });

    it('текст без дырок проходит как есть', () => {
        expect(renderVars('обычный текст', {}).text).toBe('обычный текст');
    });
});

describe('placeholdersOf', () => {
    it('перечисляет дырки в порядке появления, без повторов', () => {
        expect(placeholdersOf('{{b}} {{a}} {{b}}')).toEqual(['b', 'a']);
    });
});
