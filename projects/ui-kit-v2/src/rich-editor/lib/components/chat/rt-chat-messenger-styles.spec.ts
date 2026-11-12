import { join } from 'node:path';

import * as sass from 'sass';

/**
 * Цвет снятой своей реплики объявлен стилями: jsdom каскад не считает, поэтому спека компилирует
 * файл вида мессенджера и читает собранный CSS. Белый текст на пузыре без заливки не видят ни
 * сборка, ни линтер стилей.
 */

const MESSENGER: string = join(__dirname, 'rt-chat-messenger.scss');
const ON_PRIMARY: string = 'color: var(--rt-color-action-on-primary)';

/** Селекторы правила, в теле которого стоит это объявление. */
function selectorsOf(css: string, declaration: string): string[] {
    const at: number = css.indexOf(declaration);
    if (at === -1) {
        return [];
    }
    const open: number = css.lastIndexOf('{', at);
    const start: number = Math.max(css.lastIndexOf('}', open), css.lastIndexOf('{', open - 1)) + 1;

    return css
        .slice(start, open)
        .split(',')
        .map((selector: string): string => selector.trim());
}

describe('снятая своя реплика в виде мессенджера', (): void => {
    it('SC-UKV-1235 — правило белого цвета своей реплики не совпадает со снятой', (): void => {
        const css: string = sass.compile(MESSENGER, { style: 'expanded' }).css;
        const selectors: string[] = selectorsOf(css, ON_PRIMARY);

        expect(selectors.length).toBe(3);
        for (const selector of selectors) {
            expect(selector).toContain('.rt-chat__message--own:not(.rt-chat__message--deleted)');
        }
        expect(css.split(ON_PRIMARY).length - 1).toBe(1);
        expect(css).toMatch(/\.rt-chat--messenger \.rt-chat__message--deleted \{\s+box-shadow: none;/);
    });
});
