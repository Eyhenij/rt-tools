import { join } from 'node:path';

import * as sass from 'sass';

/**
 * Ширина окна подтверждения идёт от кнопок. Раскладки в jsdom нет, поэтому спрашиваются собранные
 * правила; сами ширины измерены в витрине: 531 точка в широком окне, кнопка 300 из 300 на пределе.
 */

const CSS: string = sass.compile(join(__dirname, 'rt-confirm-popover.component.scss')).css.replace(/\s+/g, ' ');

function ruleBody(selector: string): string | undefined {
    const at: number = CSS.indexOf(`${selector} {`);

    if (at < 0) {
        return undefined;
    }
    const open: number = CSS.indexOf('{', at);

    return CSS.slice(open + 1, CSS.indexOf('}', open)).trim();
}

describe('ширина окна подтверждения', (): void => {
    it('SC-UKV-1637 — окно по содержимому, не уже 280 и не шире окна браузера', (): void => {
        const root: string | undefined = ruleBody('.rt-confirm-popover');

        expect(root).toBeDefined();
        expect(root).toContain('width: max-content');
        expect(root).toContain('min-width: 280px');
        expect(root).toContain('max-width: calc(100vw - 2 * var(--rt-space-md))');
        expect(root).not.toMatch(/(^|[;\s])width: 280px/);
    });

    it('SC-UKV-1637 — заголовок и текст ширину не раздвигают', (): void => {
        expect(ruleBody('.rt-confirm-popover__title, .rt-confirm-popover__message')).toContain('inline-size: 0');
    });

    it('SC-UKV-1637 — кнопки переносятся строкой, длинная подпись — внутри кнопки', (): void => {
        expect(ruleBody('.rt-confirm-popover__actions')).toContain('flex-wrap: wrap');
        expect(ruleBody('.rt-confirm-popover__actions .rt-button')).toContain('max-inline-size: 100%');
        expect(ruleBody('.rt-confirm-popover__actions .rt-button__label')).toContain('white-space: normal');
    });
});
