import { join } from 'node:path';

import * as sass from 'sass';

/**
 * Сетка по ширине блока, промежуток и рамка карточки объявлены стилем, и спросить о них можно
 * только собранный CSS. Колонки на ширинах и высоты рядов меряют шаги play историй блока.
 */

const KPI: string = join(__dirname, 'rt-ai-chat-kpi.component.scss');
const STYLES: string = join(__dirname, '../../../../../../styles');

/** Тело правила с таким селектором, без вложенных в него правил. */
function ruleBody(css: string, selector: string, from: number = 0): string {
    const at: number = css.indexOf(`${selector} {`, from);
    if (at < 0) {
        return '';
    }

    const opened: number = css.indexOf('{', at);

    return css.slice(opened + 1, css.indexOf('}', opened));
}

/** Тело правила сетки внутри запроса контейнера с этим порогом. */
function gridAt(css: string, threshold: number): string {
    const at: number = css.indexOf(`@container (min-width: ${threshold}px)`);

    return at < 0 ? '' : ruleBody(css, '.rt-ai-chat-kpi__grid', at);
}

describe('стили блока KPI', (): void => {
    const css: string = sass.compile(KPI, { loadPaths: [STYLES] }).css;

    it('SC-UKV-1473 — блок — контейнер запросов по ширине, ниже 328 одна колонка', (): void => {
        expect(ruleBody(css, '.rt-ai-chat-kpi')).toContain('container-type: inline-size');
        expect(ruleBody(css, '.rt-ai-chat-kpi__grid')).toContain('grid-template-columns: minmax(0, 1fr)');
    });

    it('SC-UKV-1437, SC-UKV-1439 — две колонки от 328, четыре от 664', (): void => {
        expect(gridAt(css, 328)).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
        expect(gridAt(css, 664)).toContain('grid-template-columns: repeat(4, minmax(0, 1fr))');
    });

    it('SC-UKV-1475 — карточки разделяет шаг 8, рамка берёт токены кита', (): void => {
        const card: string = ruleBody(css, '.rt-ai-chat-kpi__card');

        expect(ruleBody(css, '.rt-ai-chat-kpi__grid')).toContain('gap: var(--rt-space-2)');
        expect(card).toContain('padding: calc(var(--rt-space-2) + var(--rt-space-1))');
        expect(card).toContain('solid var(--rt-color-border-default)');
        expect(card).toContain('background: var(--rt-color-bg-surface)');
        expect(ruleBody(css, '.rt-ai-chat-kpi')).toContain('--rt-ai-chat-kpi-card-radius: calc(var(--rt-radius-md) + var(--rt-radius-sm))');
    });

    it('SC-UKV-1479 — сетка и карточка не раздвигают ленту', (): void => {
        expect(ruleBody(css, '.rt-ai-chat-kpi')).toContain('min-width: 0');
        expect(ruleBody(css, '.rt-ai-chat-kpi__card')).toContain('min-width: 0');
    });
});
