import { join } from 'node:path';

import * as sass from 'sass';

/** Собранные стили файла одной строкой: правило ищется по началу селектора. */
function compiled(file: string): string {
    return sass.compile(join(__dirname, file)).css.replace(/\s+/g, ' ');
}

/** Тело правила по началу его селектора. */
function ruleBody(css: string, selector: string): string {
    const at: number = css.indexOf(selector);

    if (at < 0) {
        return '';
    }
    const open: number = at + selector.length;

    return css.slice(open, css.indexOf('}', open));
}

describe('RtTabsComponent — стрелки прокрутки и крестик меню «Ещё»', (): void => {
    it('SC-UKV-1209 — крестик строки меню скрыт и виден под указателем и фокусом', (): void => {
        const css: string = compiled('rt-tabs-more-menu.scss');

        expect(ruleBody(css, '.rt-tabs-more-menu__close {')).toContain('opacity: 0');
        expect(
            ruleBody(
                css,
                '.rt-tabs-more-menu__row:hover .rt-tabs-more-menu__close, .rt-tabs-more-menu__row:focus-within .rt-tabs-more-menu__close {'
            )
        ).toContain('opacity: 1');
    });

    it('SC-UKV-1210 — стрелка — компактная кнопка со скруглением и цветами из свойств', (): void => {
        const body: string = ruleBody(compiled('rt-tabs-arrows.scss'), '.rt-tabs__arrow {');

        expect(body).toContain('width: var(--rt-tabs-arrow-size)');
        expect(body).toContain('height: var(--rt-tabs-arrow-size)');
        expect(body).toContain('border-radius: var(--rt-tabs-arrow-radius)');
        expect(body).toContain('background-color: var(--rt-tabs-arrow-bg)');
        expect(body).toContain('color: var(--rt-tabs-arrow-color)');
    });

    it('SC-UKV-1210 — размер кнопки по умолчанию — шаг 24', (): void => {
        expect(ruleBody(compiled('rt-tabs-arrows.scss'), '.rt-tabs {')).toContain('--rt-tabs-arrow-size: var(--rt-size-6)');
    });
});
