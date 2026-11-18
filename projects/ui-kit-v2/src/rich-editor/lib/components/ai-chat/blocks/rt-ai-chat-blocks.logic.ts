import { IRtTableData, IRtTag, markdownToPlainText, rtTableData, rtTablePlainText } from '@rt-tools/ui-kit-v2';

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
const OWN_TYPES: ReadonlySet<string> = new Set<string>(['markdown', 'notice', 'table']);

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

/**
 * Таблица блока `table`, приведённая к виду, который можно рисовать; `null` — блок не таблица или
 * без столбцов и строк, и тогда он показан заглушкой.
 */
export function tableBlockData(block: { readonly type: string }): IRtTableData | null {
    if (block.type !== 'table') {
        return null;
    }

    return rtTableData(Reflect.get(block, 'columns'), Reflect.get(block, 'rows'), Reflect.get(block, 'total'));
}

/** Заголовок блока `table`: непустая строка, иначе его нет. */
function tableTitle(block: { readonly type: string }): string | null {
    const title: unknown = Reflect.get(block, 'title');

    return typeof title === 'string' && title.trim().length > 0 ? title : null;
}

/**
 * Последняя регистрация каждого типа целиком: она и рисует блок, и даёт его текст. Регистрация без
 * `toText` заменяет прежнюю вместе с её текстом. Свои типы кита из реестра не берутся.
 */
function lastByType(renderers: readonly IRtAiChat.BlockRenderer[]): ReadonlyMap<string, IRtAiChat.BlockRenderer> {
    const byType: Map<string, IRtAiChat.BlockRenderer> = new Map<string, IRtAiChat.BlockRenderer>();
    for (const renderer of renderers) {
        if (!OWN_TYPES.has(renderer.type)) {
            byType.set(renderer.type, renderer);
        }
    }

    return byType;
}

/**
 * Текст блока из реестра. Функция приложения, которая бросила ошибку или вернула не строку, даёт
 * пусто: строка оценки ответа не должна падать из-за копии одного блока.
 */
function rendererText(renderer: IRtAiChat.BlockRenderer | undefined, block: IRtAiChat.Block): string {
    if (!renderer?.toText) {
        return '';
    }
    try {
        const text: unknown = renderer.toText(block);

        return typeof text === 'string' ? text.trim() : '';
    } catch {
        return '';
    }
}

/** Видимый текст одного блока; таблица — строками через табуляцию, блок из реестра — текстом своей функции. */
function blockText(block: IRtAiChat.Block, byType: ReadonlyMap<string, IRtAiChat.BlockRenderer>, locale: string): string {
    if (isMarkdownBlock(block)) {
        return markdownToPlainText(block.text);
    }
    if (isNoticeBlock(block)) {
        return block.text.trim();
    }
    const table: IRtTableData | null = tableBlockData(block);

    if (table !== null) {
        const title: string | null = tableTitle(block);
        const text: string = rtTablePlainText(table, locale);

        return title === null ? text : `${title.trim()}\n${text}`;
    }

    return rendererText(byType.get(block.type), block);
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
    const byType: ReadonlyMap<string, IRtAiChat.BlockRenderer> = lastByType(renderers);

    return blocks.map((block: IRtAiChat.Block): IRtAiChat.BlockView => {
        if (isMarkdownBlock(block)) {
            return { kind: 'markdown', text: block.text };
        }
        if (isNoticeBlock(block)) {
            return { kind: 'notice', severity: block.severity, text: block.text };
        }
        const table: IRtTableData | null = tableBlockData(block);

        if (table !== null) {
            return { kind: 'table', data: table, title: tableTitle(block) };
        }
        const renderer: IRtAiChat.BlockRenderer | undefined = byType.get(block.type);

        return renderer ? { kind: 'custom', component: renderer.component, block } : { kind: 'unsupported', type: block.type };
    });
}

/**
 * Текст ответа, как его видит читатель: markdown без знаков разметки, плашки — их текстом, таблицы —
 * строками через табуляцию со значениями в языке кита, блоки из реестра — текстом функции `toText`
 * их отрисовщика. Блок без такой функции пропущен.
 */
export function blocksToPlainText(
    blocks: readonly IRtAiChat.Block[],
    renderers: readonly IRtAiChat.BlockRenderer[] = [],
    locale: string = 'en'
): string {
    const byType: ReadonlyMap<string, IRtAiChat.BlockRenderer> = lastByType(renderers);

    return blocks
        .map((block: IRtAiChat.Block): string => blockText(block, byType, locale))
        .filter((text: string): boolean => text.length > 0)
        .join(BLOCK_SEPARATOR);
}
