import { IRtTag, markdownToPlainText } from '@rt-tools/ui-kit-v2';

import { IRtAiChat } from '../rt-ai-chat.model';

/** Тексты разных блоков в скопированном ответе разделены пустой строкой, как абзацы markdown. */
const BLOCK_SEPARATOR: string = '\n\n';

/** Оттенки плашки, которые знает `rt-message`; полная запись, чтобы новый оттенок не прошёл мимо. */
const NOTICE_SEVERITIES: Readonly<Record<IRtTag.Severity, true>> = {
    info: true,
    success: true,
    warning: true,
    danger: true,
    secondary: true,
    neutral: true,
};

/** Типы, которые кит рисует сам: отрисовщик из реестра их не заменяет. */
const OWN_TYPES: ReadonlySet<string> = new Set<string>(['markdown', 'notice']);

/** Текст блока из реестра для копии ответа; без функции блок в копию не попадает. */
type TBlockText = NonNullable<IRtAiChat.BlockRenderer['toText']>;

/** Блок текста в markdown: тип `markdown` и строка `text`. */
export function isMarkdownBlock(block: { readonly type: string }): block is IRtAiChat.MarkdownBlock {
    return block.type === 'markdown' && typeof Reflect.get(block, 'text') === 'string';
}

/** Плашка: тип `notice`, строка `text` и оттенок из тех, что знает `rt-message`. */
export function isNoticeBlock(block: { readonly type: string }): block is IRtAiChat.NoticeBlock {
    const severity: unknown = Reflect.get(block, 'severity');

    return (
        block.type === 'notice' &&
        typeof Reflect.get(block, 'text') === 'string' &&
        typeof severity === 'string' &&
        Object.hasOwn(NOTICE_SEVERITIES, severity)
    );
}

/** Последняя регистрация каждого типа; свои типы кита из реестра не берутся. */
function lastByType<T>(
    renderers: readonly IRtAiChat.BlockRenderer[],
    pick: (renderer: IRtAiChat.BlockRenderer) => T | undefined
): ReadonlyMap<string, T> {
    const byType: Map<string, T> = new Map<string, T>();
    for (const renderer of renderers) {
        const value: T | undefined = pick(renderer);
        if (value !== undefined && !OWN_TYPES.has(renderer.type)) {
            byType.set(renderer.type, value);
        }
    }

    return byType;
}

/** Видимый текст одного блока; блок из реестра — текстом своей функции, без неё — пусто. */
function blockText(block: IRtAiChat.Block, textOf: ReadonlyMap<string, TBlockText>): string {
    if (isMarkdownBlock(block)) {
        return markdownToPlainText(block.text);
    }
    if (isNoticeBlock(block)) {
        return block.text.trim();
    }
    const toText: TBlockText | undefined = textOf.get(block.type);

    return toText ? toText(block).trim() : '';
}

/**
 * Что лента рисует для каждого блока. Свои типы кит рисует сам; чужой — отрисовщиком из реестра,
 * а без отрисовщика — заглушкой с именем типа: пропуск спрятал бы забытую регистрацию.
 * Свой тип без нужных полей тоже уходит в заглушку: отрисовщик из реестра его не подхватывает.
 * Из нескольких отрисовщиков одного типа берётся последний.
 */
export function toBlockViews(
    blocks: readonly IRtAiChat.Block[],
    renderers: readonly IRtAiChat.BlockRenderer[]
): readonly IRtAiChat.BlockView[] {
    const byType: ReadonlyMap<string, IRtAiChat.BlockRenderer['component']> = lastByType(
        renderers,
        (renderer: IRtAiChat.BlockRenderer): IRtAiChat.BlockRenderer['component'] => renderer.component
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
 * Текст ответа, как его видит читатель: markdown без знаков разметки, плашки — их текстом, блоки
 * из реестра — текстом функции `toText` их отрисовщика. Блок без такой функции пропущен.
 */
export function blocksToPlainText(blocks: readonly IRtAiChat.Block[], renderers: readonly IRtAiChat.BlockRenderer[] = []): string {
    const textOf: ReadonlyMap<string, TBlockText> = lastByType(
        renderers,
        (renderer: IRtAiChat.BlockRenderer): TBlockText | undefined => renderer.toText
    );

    return blocks
        .map((block: IRtAiChat.Block): string => blockText(block, textOf))
        .filter((text: string): boolean => text.length > 0)
        .join(BLOCK_SEPARATOR);
}
