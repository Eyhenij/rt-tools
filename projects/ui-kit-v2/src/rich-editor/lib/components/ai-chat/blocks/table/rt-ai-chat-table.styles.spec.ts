import { join } from 'node:path';

import * as sass from 'sass';

/**
 * Окно прокрутки, закреплённая шапка, края столбцов и цвета таблицы объявлены стилем, и спросить о
 * них можно только собранный CSS. Как это выглядит, держат кадры витрины.
 */

const TABLE: string = join(__dirname, 'rt-ai-chat-table.component.scss');
const STYLES: string = join(__dirname, '../../../../../../styles');

/** Тело правила с таким селектором, без вложенных в него правил. */
function ruleBody(css: string, selector: string): string {
    const at: number = css.indexOf(`${selector} {`);
    if (at < 0) {
        return '';
    }

    const opened: number = css.indexOf('{', at);

    return css.slice(opened + 1, css.indexOf('}', opened));
}

describe('стили блока таблицы', (): void => {
    const css: string = sass.compile(TABLE, { loadPaths: [STYLES] }).css;

    it('SC-UKV-1407 / SC-UKV-1408 — окно прокрутки не выше 200 и прокручивается в обе стороны', (): void => {
        const body: string = ruleBody(css, '.rt-ai-chat-table__scroll');

        expect(body).toContain('max-height: 200px');
        expect(body).toContain('overflow: auto');
    });

    it('SC-UKV-1408 — шапка стоит у верха окна прокрутки на фоне поверхности', (): void => {
        const body: string = ruleBody(css, '.rt-ai-chat-table__cell--head');

        expect(body).toContain('position: sticky');
        expect(body).toContain('top: 0');
        expect(body).toContain('background: var(--rt-color-bg-surface)');
    });

    it('SC-UKV-1397 / SC-UKV-1409 — текст к началу, число к концу без переноса, строка не ниже 28', (): void => {
        const cell: string = ruleBody(css, '.rt-ai-chat-table__cell');
        const end: string = ruleBody(css, '.rt-ai-chat-table__cell--end');

        expect(cell).toContain('height: 27px');
        expect(cell).toContain('text-align: start');
        expect(cell).toContain('overflow-wrap: break-word');
        expect(end).toContain('text-align: end');
        expect(end).toContain('white-space: nowrap');
    });

    it('SC-UKV-1400 / SC-UKV-1406 — отрицательное цветом ошибки, итог под границей default', (): void => {
        expect(ruleBody(css, '.rt-ai-chat-table__cell--negative')).toContain('color: var(--rt-color-state-error-text)');
        expect(ruleBody(css, '.rt-ai-chat-table__row--total')).toContain('var(--rt-color-border-default)');
    });

    it('SC-UKV-1422 — без текстового столбца таблица по своему содержимому', (): void => {
        expect(ruleBody(css, '.rt-ai-chat-table__table--content')).toContain('width: auto');
        expect(ruleBody(css, '.rt-ai-chat-table__cell--fill')).toContain('width: 100%');
    });
});
