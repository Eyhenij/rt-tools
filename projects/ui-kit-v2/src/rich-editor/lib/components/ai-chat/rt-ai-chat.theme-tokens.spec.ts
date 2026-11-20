import { join } from 'node:path';

import * as sass from 'sass';

/**
 * Токены вида чата объявлены стилем, и спросить о них можно только собранный CSS: значения по
 * умолчанию, объявления частей на их блоках и правила, которыми чат задаёт их внутри себя.
 */

const LIB: string = join(__dirname, '../../../../lib/components');
const CHAT: string = join(__dirname, 'rt-ai-chat.component.scss');
const ANSWER: string = join(__dirname, 'answer/rt-ai-chat-answer.component.scss');
const MARKDOWN: string = join(LIB, 'markdown-text/rt-markdown-text.component.scss');
const PROMPT: string = join(LIB, 'ai-prompt-input/rt-ai-prompt-input.component.scss');
const THREADS: string = join(LIB, 'thread-list/rt-thread-list.component.scss');
const STORY: string = join(__dirname, 'stories/component/test-ai-chat-properties.component.scss');

/** Тело правила с таким селектором, без вложенных в него правил. */
function ruleBody(css: string, selector: string): string {
    const at: number = css.indexOf(`${selector} {`);
    if (at < 0) {
        return '';
    }

    const opened: number = css.indexOf('{', at);

    return css.slice(opened + 1, css.indexOf('}', opened));
}

/** Тело первого правила, селектор которого содержит этот кусок. */
function ruleWith(css: string, fragment: string): string {
    const at: number = css.indexOf(fragment);
    if (at < 0) {
        return '';
    }

    const opened: number = css.indexOf('{', at);

    return css.slice(opened + 1, css.indexOf('}', opened));
}

function compiled(path: string): string {
    return sass.compile(path).css;
}

describe('токены вида чата', (): void => {
    it('SC-UKV-1596 — токены чата по умолчанию равны нынешним значениям', (): void => {
        const root: string = ruleBody(compiled(CHAT), '.rt-ai-chat');

        expect(root).toContain('--rt-ai-chat-question-font-size: var(--rt-text-sm)');
        expect(root).toContain('--rt-ai-chat-answer-font-size: var(--rt-text-xs)');
        expect(root).toContain('--rt-ai-chat-send-bg: var(--rt-color-action-primary)');
        expect(root).toContain('--rt-ai-chat-send-bg-hover: var(--rt-color-action-primary-hover)');
        expect(root).toContain('--rt-ai-chat-focus-border-color: var(--rt-input-color-border-focus)');
        expect(root).toContain('--rt-ai-chat-focus-shadow: var(--rt-input-focus-shadow)');
        expect(root).toContain('--rt-ai-chat-header-height: auto');
        expect(root).toContain('--rt-ai-chat-header-border-width: 0');
        expect(root).toContain('--rt-ai-chat-header-border-color: var(--rt-color-border-default)');
        expect(root).toContain('--rt-ai-chat-suggestion-width: 100%');
        expect(root).toContain('--rt-ai-chat-suggestion-radius: var(--rt-radius-lg)');
        expect(root).toContain('--rt-ai-chat-bg: var(--rt-color-bg-surface)');
        expect(root).toContain('--rt-ai-chat-prompt-bg: var(--rt-color-bg-surface)');
        expect(root).toContain('--rt-ai-chat-thread-actions-bg: var(--rt-color-bg-subtle)');
        expect(root).toContain('--rt-ai-chat-thread-actions-bg-active: var(--rt-color-state-info-bg)');
        expect(root).toContain('--rt-ai-chat-thread-action-radius: var(--rt-radius-md)');
        expect(root).toContain('--rt-ai-chat-thread-actions-padding-inline: var(--rt-space-2) var(--rt-space-4)');
        expect(root).toContain('--rt-ai-chat-thread-time-under-actions: visible');
        expect(root).not.toContain('--rt-ai-chat-font-family:');
        expect(root).not.toContain('--rt-ai-chat-rating-active-bg:');
        expect(root).not.toContain('--rt-ai-chat-rating-active-color:');
    });

    it('SC-UKV-1583 — семейство чата получает вся лента, без запасного значения', (): void => {
        const chat: string = compiled(CHAT);

        expect(ruleBody(chat, '.rt-ai-chat__feed')).toContain('font-family: var(--rt-ai-chat-font-family)');
        expect(ruleBody(chat, '.rt-ai-chat__bubble-text')).not.toContain('font-family');
    });

    it('SC-UKV-1587 — шапка чата и шапка колонки бесед читают одни токены', (): void => {
        const chat: string = compiled(CHAT);

        for (const selector of ['.rt-ai-chat__header', '.rt-ai-chat__column-head']) {
            const head: string = ruleBody(chat, selector);

            expect(head).toContain('block-size: var(--rt-ai-chat-header-height)');
            expect(head).toContain('border-block-end: var(--rt-ai-chat-header-border-width) solid var(--rt-ai-chat-header-border-color)');
        }
    });

    it('SC-UKV-1595 — чат задаёт токены частей правилом на блоке части внутри себя', (): void => {
        const chat: string = compiled(CHAT);
        const root: string = ruleBody(chat, '.rt-ai-chat');
        const markdown: string = ruleBody(chat, '.rt-ai-chat .rt-markdown-text');
        const prompt: string = ruleBody(chat, '.rt-ai-chat .rt-ai-prompt-input');
        const threads: string = ruleBody(chat, '.rt-ai-chat .rt-thread-list');

        expect(markdown).toContain('--rt-markdown-text-font-family: var(--rt-ai-chat-font-family, var(--rt-font-family-sans))');
        expect(markdown).toContain('--rt-markdown-text-font-size: var(--rt-ai-chat-answer-font-size)');
        expect(prompt).toContain('--rt-ai-prompt-input-bg: var(--rt-ai-chat-prompt-bg)');
        expect(prompt).toContain('--rt-ai-prompt-input-send-bg: var(--rt-ai-chat-send-bg)');
        expect(prompt).toContain('--rt-ai-prompt-input-send-bg-hover: var(--rt-ai-chat-send-bg-hover)');
        expect(prompt).toContain('--rt-ai-prompt-input-focus-border-color: var(--rt-ai-chat-focus-border-color)');
        expect(prompt).toContain('--rt-ai-prompt-input-focus-shadow: var(--rt-ai-chat-focus-shadow)');
        expect(threads).toContain('--rt-thread-list-row-actions-bg: var(--rt-ai-chat-thread-actions-bg)');
        expect(threads).toContain('--rt-thread-list-row-actions-bg-active: var(--rt-ai-chat-thread-actions-bg-active)');
        expect(threads).toContain('--rt-thread-list-row-action-radius: var(--rt-ai-chat-thread-action-radius)');
        expect(threads).toContain('--rt-thread-list-row-actions-padding-inline: var(--rt-ai-chat-thread-actions-padding-inline)');
        expect(threads).toContain('--rt-thread-list-under-actions-visibility: var(--rt-ai-chat-thread-time-under-actions)');
        expect(root).not.toContain('--rt-markdown-text-');
        expect(root).not.toContain('--rt-ai-prompt-input-');
        expect(root).not.toContain('--rt-thread-list-');
    });

    it('SC-UKV-1594 — каждая часть объявляет свои токены на своём блоке с нынешним значением', (): void => {
        const markdown: string = ruleBody(compiled(MARKDOWN), '.rt-markdown-text');
        const prompt: string = ruleBody(compiled(PROMPT), '.rt-ai-prompt-input');
        const threads: string = ruleBody(compiled(THREADS), '.rt-thread-list');

        expect(markdown).toContain('--rt-markdown-text-font-family: var(--rt-font-family-sans)');
        expect(markdown).toContain('--rt-markdown-text-font-size: var(--rt-text-xs)');
        expect(prompt).toContain('--rt-ai-prompt-input-bg: var(--rt-color-bg-surface)');
        expect(prompt).toContain('--rt-ai-prompt-input-focus-border-color: var(--rt-input-color-border-focus)');
        expect(prompt).toContain('--rt-ai-prompt-input-focus-shadow: var(--rt-input-focus-shadow)');
        expect(prompt).toContain('--rt-ai-prompt-input-send-bg: var(--rt-color-action-primary)');
        expect(prompt).toContain('--rt-ai-prompt-input-send-bg-hover: var(--rt-color-action-primary-hover)');
        expect(threads).toContain('--rt-thread-list-row-actions-bg: var(--rt-color-bg-subtle)');
        expect(threads).toContain('--rt-thread-list-row-actions-bg-active: var(--rt-color-state-info-bg)');
        expect(threads).toContain('--rt-thread-list-row-actions-padding-inline: var(--rt-space-2) var(--rt-space-4)');
        expect(threads).toContain('--rt-thread-list-row-action-radius: var(--rt-radius-md)');
        expect(threads).toContain('--rt-thread-list-under-actions-visibility: visible');
    });

    it('SC-UKV-1594 — части читают свои токены без запасного значения на месте', (): void => {
        const markdown: string = ruleBody(compiled(MARKDOWN), '.rt-markdown-text');
        const prompt: string = compiled(PROMPT);
        const threads: string = compiled(THREADS);

        expect(markdown).toContain('font-family: var(--rt-markdown-text-font-family);');
        expect(markdown).toContain('font-size: var(--rt-markdown-text-font-size);');
        expect(ruleBody(prompt, '.rt-ai-prompt-input__box')).toContain('background: var(--rt-ai-prompt-input-bg);');
        expect(ruleBody(prompt, '.rt-ai-prompt-input__box--disabled')).toContain('background: var(--rt-input-color-bg-disabled)');
        expect(ruleBody(prompt, '.rt-ai-prompt-input__send .rt-icon-button--primary')).toContain(
            '--rt-icon-button-bg-variant: var(--rt-ai-prompt-input-send-bg);'
        );
        expect(ruleWith(prompt, '.rt-ai-prompt-input__box:focus-within')).toContain(
            'border-color: var(--rt-ai-prompt-input-focus-border-color);'
        );
        expect(ruleWith(prompt, '.rt-ai-prompt-input__box:focus-within')).toContain('box-shadow: var(--rt-ai-prompt-input-focus-shadow);');
        expect(ruleWith(prompt, '.rt-ai-prompt-input__send .rt-icon-button--primary:hover')).toContain(
            'background-color: var(--rt-icon-button-bg-hover, var(--rt-ai-prompt-input-send-bg-hover));'
        );
        const actions: string = ruleBody(threads, '.rt-thread-list__row-actions');

        expect(actions).toContain('background: var(--rt-thread-list-row-actions-bg);');
        expect(actions).toContain('padding-inline: var(--rt-thread-list-row-actions-padding-inline);');
        expect(ruleWith(threads, '.rt-thread-list__row--active + .rt-thread-list__row-actions')).toContain(
            'background: var(--rt-thread-list-row-actions-bg-active);'
        );
        expect(ruleBody(threads, '.rt-thread-list__row-wrap [rtThreadListUnderActions]')).toContain(
            'visibility: var(--rt-thread-list-under-actions-visibility);'
        );
    });

    it('SC-UKV-1586 — выбранная оценка без токенов чата красится как прежде', (): void => {
        const active: string = ruleBody(
            compiled(ANSWER),
            '.rt-ai-chat-answer__feedback rt-icon-button .rt-icon-button.rt-icon-button--active'
        );

        const hovered: string = ruleWith(compiled(ANSWER), '.rt-icon-button--active:hover');

        expect(active).toContain('background-color: var(--rt-ai-chat-rating-active-bg, var(--rt-icon-button-color-bg-hover))');
        expect(active).toContain('color: var(--rt-ai-chat-rating-active-color, var(--rt-icon-button-color))');
        expect(active).not.toContain('--rt-icon-button-color:');
        expect(hovered).toContain(
            'var(--rt-ai-chat-rating-active-bg, var(--rt-icon-button-bg-hover, var(--rt-icon-button-color-bg-hover)))'
        );
        expect(hovered).toContain('color: var(--rt-ai-chat-rating-active-color, var(--rt-icon-button-color-hover))');
    });

    it('SC-UKV-1592 — скругление кнопок действий строки уступает входу radius кнопки', (): void => {
        const threads: string = compiled(THREADS);

        expect(ruleBody(threads, '.rt-thread-list__row-actions :where(rt-icon-button) .rt-icon-button')).toContain(
            '--rt-icon-button-radius: var(--rt-thread-list-row-action-radius)'
        );
    });

    it('SC-UKV-1598 — поиск списка бесед без предела ширины', (): void => {
        const search: string = ruleBody(compiled(THREADS), '.rt-thread-list__search');

        expect(search).toContain('flex: 1 1 auto');
        expect(search).not.toContain('max-inline-size');
        expect(search).not.toContain('max-width');
    });

    it('SC-UKV-1599 — заголовки и код ответа не читают токены семейства и кегля', (): void => {
        const markdown: string = compiled(MARKDOWN);

        for (const level of [1, 2, 3, 4, 5, 6]) {
            const body: string = ruleWith(markdown, `.rt-markdown-text__heading--level--${level}`);

            expect(body).toMatch(/font-size: var\(--rt-text-(lg|md|sm)\)/);
            expect(body).not.toContain('--rt-markdown-text-font');
        }
        for (const selector of ['.rt-markdown-text__code', '.rt-markdown-text__code-inline']) {
            const body: string = ruleBody(markdown, selector);

            expect(body).toContain('font-family: var(--rt-font-family-mono)');
            expect(body).not.toContain('--rt-markdown-text-font');
        }
    });

    it('SC-UKV-1597 — витрина ставит токены правилом на элементе чата, без внутренних классов', (): void => {
        const css: string = compiled(STORY)
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/@charset[^;]*;/, '');
        const selectors: string[] = [...css.matchAll(/([^{}]+)\{/g)]
            .map((match: RegExpMatchArray): string => match[1].trim())
            .filter((selector: string): boolean => !selector.startsWith('@layer'));

        expect(selectors.length).toBeGreaterThan(0);
        for (const selector of selectors) {
            expect(selector).toMatch(/^rt-ai-chat\[data-cell='?[a-z]+'?\]$/);
        }
        expect(css).not.toMatch(/\.rt-(ai-chat__|thread-list__|ai-prompt-input__|markdown-text)/);
    });
});
