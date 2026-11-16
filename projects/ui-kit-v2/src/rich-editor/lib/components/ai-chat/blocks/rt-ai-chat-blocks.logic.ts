import { markdownToPlainText } from '@rt-tools/ui-kit-v2';

import { IRtAiChat } from '../rt-ai-chat.model';

/** Тексты разных блоков в скопированном ответе разделены пустой строкой, как абзацы markdown. */
const BLOCK_SEPARATOR: string = '\n\n';

/** Блок текста в markdown: тип `markdown` и строка `text`. */
export function isMarkdownBlock(block: { readonly type: string }): block is IRtAiChat.MarkdownBlock {
    return block.type === 'markdown' && typeof Reflect.get(block, 'text') === 'string';
}

/** Плашка: тип `notice` и строка `text`. */
export function isNoticeBlock(block: { readonly type: string }): block is IRtAiChat.NoticeBlock {
    return block.type === 'notice' && typeof Reflect.get(block, 'text') === 'string';
}

/** Видимый текст одного блока; блок, которого кит не знает, текста не даёт. */
function blockText(block: { readonly type: string }): string {
    if (isMarkdownBlock(block)) {
        return markdownToPlainText(block.text);
    }

    return isNoticeBlock(block) ? block.text.trim() : '';
}

/**
 * Что лента рисует для каждого блока. Свои типы кит рисует сам; чужой — отрисовщиком из реестра,
 * а без отрисовщика — заглушкой с именем типа: пропуск спрятал бы забытую регистрацию.
 * Известный тип без строки `text` тоже уходит в заглушку. Из нескольких отрисовщиков одного типа
 * берётся последний.
 */
export function toBlockViews(
    blocks: readonly IRtAiChat.Block[],
    renderers: readonly IRtAiChat.BlockRenderer[]
): readonly IRtAiChat.BlockView[] {
    const byType: ReadonlyMap<string, IRtAiChat.BlockRenderer['component']> = new Map(
        renderers.map((renderer: IRtAiChat.BlockRenderer): [string, IRtAiChat.BlockRenderer['component']] => [
            renderer.type,
            renderer.component,
        ])
    );

    return blocks.map((block: IRtAiChat.Block): IRtAiChat.BlockView => {
        if (isMarkdownBlock(block)) {
            return { kind: 'markdown', text: block.text };
        }
        if (isNoticeBlock(block)) {
            return { kind: 'notice', severity: block.severity, text: block.text };
        }
        const component: IRtAiChat.BlockRenderer['component'] | undefined = byType.get(block.type);

        return component ? { kind: 'custom', component, block } : { kind: 'unsupported', type: block.type };
    });
}

/**
 * Текст ответа, как его видит читатель: markdown без знаков разметки, плашки — их текстом.
 * Блоки, которых кит не знает, пропущены: их текст знает только отрисовщик приложения.
 */
export function blocksToPlainText(blocks: readonly { readonly type: string }[]): string {
    return blocks
        .map(blockText)
        .filter((text: string): boolean => text.length > 0)
        .join(BLOCK_SEPARATOR);
}
