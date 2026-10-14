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
    ])('SC-UKV-900 — шаг %s снимает с высоты Material %s шага шкалы, и поле берёт её как среднюю', (step: string, taken: string): void => {
        const body: string | undefined = ruleBody(`[data-rt-density="${step}"]`);

        expect(body).toContain(`--rt-input-height-md: calc(var(--rt-size-12) + var(--rt-size-2) - ${taken} * var(--rt-size-1))`);
        expect(body).toContain('--rt-input-height: var(--rt-input-height-md)');
    });

    it('SC-UKV-900 — шаг действует только под материальным набором, на поле и на предке', (): void => {
        expect(CSS).toContain(`:where(.rt-preset-material, [data-preset=material]) [data-rt-density="-2"]`);
        expect(CSS).toContain(`:is(.rt-preset-material, [data-preset=material])[data-rt-density="-2"]`);
        expect(CSS).not.toMatch(/(^|[},]\s*)\[data-rt-density=/);
    });
});
