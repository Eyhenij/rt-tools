import { join } from 'node:path';

import * as sass from 'sass';

/**
 * Токены вида чата объявлены стилем, и спросить о них можно только собранный CSS: значения по
 * умолчанию, запасные значения частей и то, что части свои токены не объявляют.
 */

const LIB: string = join(__dirname, '../../../../lib/components');
const CHAT: string = join(__dirname, 'rt-ai-chat.component.scss');
const ANSWER: string = join(__dirname, 'answer/rt-ai-chat-answer.component.scss');
const MARKDOWN: string = join(LIB, 'markdown-text/rt-markdown-text.component.scss');
const PROMPT: string = join(LIB, 'ai-prompt-input/rt-ai-prompt-input.component.scss');
const THREADS: string = join(LIB, 'thread-list/rt-thread-list.component.scss');

/** Тело правила с таким селектором, без вложенных в него правил. */
function ruleBody(css: string, selector: string): string {
    const at: number = css.indexOf(`${selector} {`);
    if (at < 0) {
        return '';
    }

    const opened: number = css.indexOf('{', at);

    return css.slice(opened + 1, css.indexOf('}', opened));
}

function compiled(path: string): string {
    return sass.compile(path).css;
}

/** Объявления токенов части, где бы они ни стояли в её собранном CSS. */
function declaredHandles(css: string, pattern: string): string[] {
    return [...css.matchAll(new RegExp(`(${pattern}[a-z-]*)\\s*:`, 'g'))].map((match: RegExpMatchArray): string => match[1]);
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
        expect(root).toContain('--rt-ai-chat-rating-active-bg: var(--rt-icon-button-color-bg-hover)');
        expect(root).toContain('--rt-ai-chat-rating-active-color: var(--rt-color-text-primary)');
        expect(root).toContain('--rt-ai-chat-header-height: auto');
        expect(root).toContain('--rt-ai-chat-header-border-width: 0');
        expect(root).toContain('--rt-ai-chat-suggestion-width: 100%');
        expect(root).toContain('--rt-ai-chat-suggestion-radius: var(--rt-radius-lg)');
        expect(root).toContain('--rt-ai-chat-bg: var(--rt-color-bg-surface)');
        expect(root).toContain('--rt-ai-chat-prompt-bg: var(--rt-color-bg-surface)');
        expect(root).toContain('--rt-ai-chat-thread-actions-bg: var(--rt-color-bg-subtle)');
        expect(root).toContain('--rt-ai-chat-thread-actions-bg-active: var(--rt-color-state-info-bg)');
        expect(root).toContain('--rt-ai-chat-thread-action-radius: var(--rt-radius-md)');
        expect(root).toContain('--rt-ai-chat-thread-actions-padding-inline: var(--rt-space-2) var(--rt-space-4)');
        expect(root).toContain('--rt-ai-chat-thread-meta-under-actions: visible');
        expect(root).not.toContain('--rt-ai-chat-font-family:');
    });

    it('SC-UKV-1595 — чат передаёт свои токены частям на своём корне', (): void => {
        const root: string = ruleBody(compiled(CHAT), '.rt-ai-chat');

        expect(root).toContain('--rt-markdown-text-font-size: var(--rt-ai-chat-answer-font-size)');
        expect(root).toContain('--rt-markdown-text-font-family: var(--rt-ai-chat-font-family, var(--rt-font-family-sans))');
        expect(root).toContain('--rt-ai-prompt-input-bg: var(--rt-ai-chat-prompt-bg)');
        expect(root).toContain('--rt-ai-prompt-input-send-bg: var(--rt-ai-chat-send-bg)');
        expect(root).toContain('--rt-ai-prompt-input-focus-shadow: var(--rt-ai-chat-focus-shadow)');
        expect(root).toContain('--rt-thread-list-row-actions-bg: var(--rt-ai-chat-thread-actions-bg)');
        expect(root).toContain('--rt-thread-list-under-actions-visibility: var(--rt-ai-chat-thread-meta-under-actions)');
    });

    it('SC-UKV-1595 — ни одна часть не объявляет свои новые токены', (): void => {
        expect(declaredHandles(compiled(MARKDOWN), '--rt-markdown-text-font-')).toEqual([]);
        expect(declaredHandles(compiled(PROMPT), '--rt-ai-prompt-input-(?:bg|send|focus)')).toEqual([]);
        expect(declaredHandles(compiled(THREADS), '--rt-thread-list-(?:row-action|under-actions)')).toEqual([]);
    });

    it('SC-UKV-1594 — части читают свои токены с нынешним значением на месте', (): void => {
        const markdown: string = ruleBody(compiled(MARKDOWN), '.rt-markdown-text');
        const prompt: string = compiled(PROMPT);
        const threads: string = compiled(THREADS);

        expect(markdown).toContain('font-family: var(--rt-markdown-text-font-family, var(--rt-font-family-sans))');
        expect(markdown).toContain('font-size: var(--rt-markdown-text-font-size, var(--rt-text-xs))');
        expect(ruleBody(prompt, '.rt-ai-prompt-input__box')).toContain(
            'background: var(--rt-ai-prompt-input-bg, var(--rt-color-bg-surface))'
        );
        expect(ruleBody(prompt, '.rt-ai-prompt-input__box--disabled')).toContain('background: var(--rt-input-color-bg-disabled)');
        expect(ruleBody(prompt, '.rt-ai-prompt-input__send .rt-icon-button--primary')).toContain(
            '--rt-icon-button-bg-variant: var(--rt-ai-prompt-input-send-bg, var(--rt-color-action-primary))'
        );
        expect(ruleBody(threads, '.rt-thread-list__row-actions')).toContain(
            'background: var(--rt-thread-list-row-actions-bg, var(--rt-color-bg-subtle))'
        );
        expect(ruleBody(threads, '.rt-thread-list__row-wrap [rtThreadListUnderActions]')).toContain(
            'visibility: var(--rt-thread-list-under-actions-visibility, visible)'
        );
    });

    it('SC-UKV-1586 — выбранная оценка без токенов чата красится как прежде', (): void => {
        const active: string = ruleBody(
            compiled(ANSWER),
            '.rt-ai-chat-answer__feedback rt-icon-button .rt-icon-button.rt-icon-button--active'
        );

        expect(active).toContain('background-color: var(--rt-ai-chat-rating-active-bg, var(--rt-icon-button-color-bg-hover))');
        expect(active).toContain('--rt-icon-button-color: var(--rt-ai-chat-rating-active-color, var(--rt-color-text-primary))');
    });

    it('SC-UKV-1598 — поиск списка бесед без предела ширины', (): void => {
        const search: string = ruleBody(compiled(THREADS), '.rt-thread-list__search');

        expect(search).toContain('flex: 1 1 auto');
        expect(search).not.toContain('max-inline-size');
        expect(search).not.toContain('max-width');
    });

    it('SC-UKV-1599 — заголовки и код ответа не читают токены семейства и кегля', (): void => {
        const markdown: string = compiled(MARKDOWN);

        for (const selector of [
            '.rt-markdown-text__heading--level--1',
            '.rt-markdown-text__heading--level--2',
            '.rt-markdown-text__code',
            '.rt-markdown-text__code-inline',
        ]) {
            expect(ruleBody(markdown, selector)).not.toContain('--rt-markdown-text-font');
        }
    });
});
