import { join } from 'node:path';

import * as sass from 'sass';

/**
 * Плотность полей материального набора: атрибут `data-rt-density` на поле или на предке
 * переобъявляет высоту на своём узле. Спрашивается собранный агрегатор — без строки в нём атрибут
 * ставится в разметку и ничего не меняет, а сборка об этом молчит.
 */

const CSS: string = sass.compile(join(__dirname, '_index.scss')).css.replace(/\s+/g, ' ');

/** Тело правила, селектор которого содержит заданный кусок. */
function ruleBody(selectorPart: string): string | undefined {
    const at: number = CSS.indexOf(selectorPart);

    if (at < 0) {
        return undefined;
    }
    const open: number = CSS.indexOf('{', at);

    return CSS.slice(open + 1, CSS.indexOf('}', open)).trim();
}

describe('плотность полей материального набора', (): void => {
    it.each<[string, string]>([
        ['0', '0'],
        ['-1', '1'],
        ['-3', '3'],
        ['-5', '5'],
    ])('SC-UKV-908 — атрибут %s ставит наследуемый шаг плотности %s', (step: string, taken: string): void => {
        expect(ruleBody(`[data-rt-density="${step}"]`)).toBe(`--rt-input-density: ${taken};`);
    });

    it('SC-UKV-900 — узел с атрибутом под набором пересчитывает высоту Material из шага', (): void => {
        const body: string | undefined = ruleBody(':where(.rt-preset-material, [data-preset=material]) [data-rt-density]');

        expect(body).toContain('calc(var(--rt-size-12) + var(--rt-size-2) - var(--rt-input-density) * var(--rt-size-1))');
        expect(body).toContain('--rt-input-height: var(--rt-input-height-md)');
        expect(CSS).toContain(':is(.rt-preset-material, [data-preset=material])[data-rt-density]');
    });

    it('SC-UKV-908 — набор на самом поле считает высоту из шага предка, своя высота приложения сильнее', (): void => {
        const preset: string | undefined = ruleBody(`[data-preset=material], .rt-preset-material {`.slice(0, -2));

        expect(preset?.replace(/\s+/g, '')).toContain(
            '--rt-input-height-md:var(--rt-input-height-app,calc(var(--rt-size-12)+var(--rt-size-2)-var(--rt-input-density)*var(--rt-size-1)))'
        );
    });
});
