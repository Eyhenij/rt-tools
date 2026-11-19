import { join } from 'node:path';

import * as sass from 'sass';

/**
 * Именованный контейнер, порог двух колонок, шаг сетки и место ячейки объявлены стилем, и спросить
 * о них можно только собранный CSS. Колонки и ширины ячеек на ширинах меряют шаги play историй.
 */

const SECTION: string = join(__dirname, 'rt-ai-chat-section.component.scss');
const BLOCKS: string = join(__dirname, '../rt-ai-chat-blocks.component.scss');
const STYLES: string = join(__dirname, '../../../../../../styles');
const QUERY: string = '@container rt-ai-chat-section (min-width: 600px)';

/** Тело правила с таким селектором, без вложенных в него правил. */
function ruleBody(css: string, selector: string, from: number = 0): string {
    const at: number = css.indexOf(`${selector} {`, from);
    if (at < 0) {
        return '';
    }

    const opened: number = css.indexOf('{', at);

    return css.slice(opened + 1, css.indexOf('}', opened));
}

describe('стили секции', (): void => {
    const css: string = sass.compile(SECTION, { loadPaths: [STYLES] }).css;
    const wide: number = css.indexOf(QUERY);

    it('SC-UKV-1510 — хост — именованный контейнер по ширине, ниже порога одна колонка с шагом md', (): void => {
        const grid: string = ruleBody(css, '.rt-ai-chat-section__grid');

        expect(ruleBody(css, '.rt-ai-chat-section')).toContain('container: rt-ai-chat-section/inline-size');
        expect(grid).toContain('grid-template-columns: minmax(0, 1fr)');
        expect(grid).toContain('gap: var(--rt-space-md)');
        expect(grid).toContain('align-items: start');
        expect(css.slice(0, wide)).not.toContain('grid-column');
    });

    it('SC-UKV-1510 — от 600 сетка спрашивает контейнер по имени: две равные колонки, ячейка full — обе', (): void => {
        expect(wide).toBeGreaterThan(-1);
        expect(css.match(/@container/g)?.length).toBe(1);
        expect(ruleBody(css, '.rt-ai-chat-section__grid', wide)).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
        expect(ruleBody(css, '.rt-ai-chat-section__cell--full', wide)).toContain('grid-column: 1/-1');
        expect(css).not.toContain('.rt-ai-chat-section__cell--column');
    });

    it('SC-UKV-1514 — ячейка кладёт блок блочным с нулевой минимальной шириной и не обрезает его', (): void => {
        const cell: string = ruleBody(css, '.rt-ai-chat-section__cell');

        expect(cell).toContain('display: grid');
        expect(cell).toContain('min-width: 0');
        expect(cell).toContain('grid-template-columns: minmax(0, 1fr)');
        expect(cell).not.toContain('overflow');
    });

    it('SC-UKV-1517 — заголовок: 16 полужирный на строке 20, 12 над сеткой, длинное слово ломается', (): void => {
        const title: string = ruleBody(css, '.rt-ai-chat-section__title');

        expect(title).toContain('font-size: var(--rt-text-md)');
        expect(title).toContain('font-weight: var(--rt-font-weight-semibold)');
        expect(title).toContain('line-height: calc(var(--rt-text-md) + var(--rt-space-1))');
        expect(title).toContain('margin: 0 0 calc(var(--rt-space-2) + var(--rt-space-1))');
        expect(title).toContain('color: var(--rt-color-text-primary)');
        expect(title).toContain('overflow-wrap: anywhere');
    });

    it('SC-UKV-1528 — лента добавляет свой шаг перед секцией и перед блоком после неё', (): void => {
        const feed: string = sass.compile(BLOCKS, { loadPaths: [STYLES] }).css;
        const selector: string = '* + .rt-ai-chat-blocks__section, .rt-ai-chat-blocks__section + :not(.rt-ai-chat-blocks__section)';

        expect(ruleBody(feed, '.rt-ai-chat-blocks')).toContain('gap: var(--rt-space-sm)');
        expect(ruleBody(feed, selector)).toContain('margin-block-start: var(--rt-space-sm)');
    });
});
