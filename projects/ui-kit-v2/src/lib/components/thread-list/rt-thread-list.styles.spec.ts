import { join } from 'node:path';

import * as sass from 'sass';

/**
 * Видимость действий строки объявлена стилем и зависит от наведения: спросить о ней можно только
 * собранный CSS.
 *
 * Спрятанная без наведения кнопка меню на телефоне не появляется никогда, и беседу нельзя ни
 * переименовать, ни удалить. Ни сборка, ни линтер стилей этого не видят.
 */

const SOURCE: string = join(__dirname, 'rt-thread-list.component.scss');
const MESSENGER: string = join(__dirname, 'rt-thread-list-messenger.scss');

/** Тело правила с таким селектором, без вложенных в него правил. */
function ruleBody(css: string, selector: string): string {
    const at: number = css.indexOf(`${selector} {`);
    if (at < 0) {
        return '';
    }

    const opened: number = css.indexOf('{', at);

    return css.slice(opened + 1, css.indexOf('}', opened));
}

/** Тело медиазапроса с таким условием. */
function mediaBody(css: string, condition: string): string {
    const at: number = css.indexOf(`@media ${condition}`);
    if (at < 0) {
        return '';
    }

    const opened: number = css.indexOf('{', at);
    let depth: number = 1;
    let index: number = opened + 1;

    while (depth > 0 && index < css.length) {
        if (css[index] === '{') {
            depth += 1;
        }
        if (css[index] === '}') {
            depth -= 1;
        }
        index += 1;
    }

    return css.slice(opened + 1, index - 1);
}

describe('стили действий строки списка бесед', (): void => {
    const css: string = sass.compile(SOURCE).css;
    const hover: string = mediaBody(css, '(hover: hover)');
    const outside: string = css.replace(hover, '');

    it('SC-UKV-1077 — без наведения действия строки видны: вне медиазапроса их ничто не прячет', (): void => {
        expect(ruleBody(outside, '.rt-thread-list__row-actions')).toContain('position: absolute');
        expect(ruleBody(outside, '.rt-thread-list__row-actions')).not.toContain('opacity: 0');
        expect(ruleBody(outside, '.rt-thread-list__row-actions')).not.toContain('pointer-events: none');
    });

    it('SC-UKV-1077 — с наведением действия прячутся и появляются по наведению, фокусу и открытому меню', (): void => {
        expect(ruleBody(hover, '.rt-thread-list__row-actions')).toContain('opacity: 0');
        expect(hover).toContain('.rt-thread-list__row-wrap:hover .rt-thread-list__row-actions');
        expect(hover).toContain('.rt-thread-list__row-wrap:focus-within .rt-thread-list__row-actions');
        expect(hover).toContain('.rt-thread-list__row-wrap:has(.rt-menu--open) .rt-thread-list__row-actions');
    });
});

describe('шапка и вкладки списка в виде мессенджера', (): void => {
    const css: string = sass.compile(MESSENGER).css;

    it('SC-UKV-1274 — у шапки нет боковых полей: поиск стоит на крае строк', (): void => {
        expect(ruleBody(css, '.rt-thread-list--messenger .rt-thread-list__head')).toContain('padding-inline: 0');
    });

    it('SC-UKV-1275 — вкладки стоят в 8 от линии шапки и от строк: свои 6 и зазор колонки 2', (): void => {
        expect(ruleBody(css, '.rt-thread-list--messenger .rt-thread-list__tabs')).toContain('padding: calc(var(--rt-space-1) * 1.5) 0');
        expect(ruleBody(css, '.rt-thread-list--messenger')).toContain('gap: var(--rt-space-0-5)');
    });
});
