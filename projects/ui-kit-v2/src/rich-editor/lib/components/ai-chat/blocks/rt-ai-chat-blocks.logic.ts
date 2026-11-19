import {
    ERtKpiDeltaUnit,
    IRtKpiItem,
    IRtSectionItem,
    IRtTableData,
    IRtTag,
    markdownToPlainText,
    rtDeltaNumber,
    rtKpiItems,
    rtKpiValueWriter,
    rtSectionItems,
    rtSectionSpan,
    rtSectionTitle,
    RT_SECTION_BLOCK_TYPE,
    rtTableData,
    rtTablePlainText,
    TRtKitTranslator,
} from '@rt-tools/ui-kit-v2';

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
const OWN_TYPES: ReadonlySet<string> = new Set<string>(['markdown', 'notice', 'table', 'kpi', RT_SECTION_BLOCK_TYPE]);

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

/**
 * Карточки блока `kpi`, приведённые к виду, который можно рисовать; `null` — блок не KPI или без
 * уцелевших карточек, и тогда он показан заглушкой.
 */
export function kpiBlockItems(block: { readonly type: string }): IRtKpiItem[] | null {
    return block.type === 'kpi' ? rtKpiItems(Reflect.get(block, 'items')) : null;
}

/** Запись пунктов дельты подписью кита: в неё уходит записанное число. */
export type TRtAiChatPointsWriter = (value: string) => string;

/** Подпись пунктов английского умолчания кита — когда подписи приложения не переданы. */
const defaultPoints: TRtAiChatPointsWriter = (value: string): string => `${value} pp`;

/** Запись пунктов переводчиком кита; пустой ответ переводчика заменяется английским умолчанием. */
export function rtAiChatPointsWriter(translate: TRtKitTranslator): TRtAiChatPointsWriter {
    return (value: string): string => translate('uiPercentagePoints', { value }) || defaultPoints(value);
}

/** Табуляция и перевод строки внутри текста карточки в копии становятся пробелом. */
function copyField(text: string | null): string {
    return text === null ? '' : text.replace(/[\t\r\n]+/g, ' ');
}

/** Дельта карточки, как её рисует плитка: число с подписью базы через пробел. */
function kpiDelta(item: IRtKpiItem, locale: string, points: TRtAiChatPointsWriter): string {
    if (item.delta === null) {
        return '';
    }
    const written: string = rtDeltaNumber(item.delta, item.deltaUnit, locale).text;
    const delta: string = item.deltaUnit === ERtKpiDeltaUnit.Points ? points(written) : written;

    return item.base === null ? delta : `${delta} ${item.base}`;
}

/** Блок KPI в копии: строка на карточку — название, значение, дельта с базой и период через табуляцию. */
function kpiPlainText(items: readonly IRtKpiItem[], locale: string, points: TRtAiChatPointsWriter): string {
    return items
        .map((item: IRtKpiItem): string =>
            [item.label, rtKpiValueWriter(item, locale)(item.value), kpiDelta(item, locale, points), item.period]
                .map((field: string | null): string => copyField(field))
                .join('\t')
        )
        .join('\n');
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

/** Чем пишется копия: реестр отрисовщиков, язык значений и подпись пунктов. */
interface ICopyContext {
    readonly byType: ReadonlyMap<string, IRtAiChat.BlockRenderer>;
    readonly locale: string;
    readonly points: TRtAiChatPointsWriter;
}

/**
 * Видимый текст блока, который не секция; таблица — строками через табуляцию, блок из реестра —
 * текстом своей функции. Секция сюда попадает только вложенной: она не рисуется и текста не даёт.
 */
function leafText(block: IRtAiChat.Block, context: ICopyContext): string {
    const { byType, locale, points }: ICopyContext = context;

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
    const kpi: IRtKpiItem[] | null = kpiBlockItems(block);

    if (kpi !== null) {
        return kpiPlainText(kpi, locale, points);
    }

    return rendererText(byType.get(block.type), block);
}

/**
 * Секция в копии: обрезанный заголовок и тексты вложенных блоков через пустую строку. Секция,
 * чьи блоки не дали текста, не даёт и заголовка.
 */
function sectionText(block: IRtAiChat.Block, context: ICopyContext): string {
    const texts: string[] = (rtSectionItems(Reflect.get(block, 'blocks')) ?? [])
        .map((item: IRtSectionItem): string => leafText(item, context))
        .filter((text: string): boolean => text.length > 0);

    if (texts.length === 0) {
        return '';
    }
    const title: string | null = rtSectionTitle(Reflect.get(block, 'title'));

    return (title === null ? texts : [copyField(title), ...texts]).join(BLOCK_SEPARATOR);
}

/** Видимый текст одного блока ленты. */
function blockText(block: IRtAiChat.Block, context: ICopyContext): string {
    return block.type === RT_SECTION_BLOCK_TYPE ? sectionText(block, context) : leafText(block, context);
}

/**
 * Что рисуется для блока, который не секция. Секция сюда попадает только вложенной: свой тип из
 * реестра не берётся, и она уходит в заглушку с именем типа.
 */
function leafView(block: IRtAiChat.Block, byType: ReadonlyMap<string, IRtAiChat.BlockRenderer>): IRtAiChat.BlockView {
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
    const kpi: IRtKpiItem[] | null = kpiBlockItems(block);

    if (kpi !== null) {
        return { kind: 'kpi', items: kpi };
    }
    const renderer: IRtAiChat.BlockRenderer | undefined = byType.get(block.type);

    return renderer ? { kind: 'custom', component: renderer.component, block } : { kind: 'unsupported', type: block.type };
}

/**
 * Секция как сетка ячеек; секция без блоков — заглушка с именем типа. Место ячейки идёт от
 * объявленного типа блока и его `span`, а что в ней рисуется — от правил ленты.
 */
function sectionView(block: IRtAiChat.Block, byType: ReadonlyMap<string, IRtAiChat.BlockRenderer>): IRtAiChat.BlockView {
    const items: IRtSectionItem[] | null = rtSectionItems(Reflect.get(block, 'blocks'));

    if (items === null) {
        return { kind: 'unsupported', type: RT_SECTION_BLOCK_TYPE };
    }

    return {
        kind: 'section',
        title: rtSectionTitle(Reflect.get(block, 'title')),
        cells: items.map((item: IRtSectionItem): IRtAiChat.SectionCell => ({
            span: rtSectionSpan(item.type, item['span']),
            view: leafView(item, byType),
        })),
    };
}

/**
 * Что лента рисует для каждого блока. Свои типы кит рисует сам; чужой — отрисовщиком из реестра,
 * а без отрисовщика — заглушкой с именем типа: пропуск спрятал бы забытую регистрацию.
 * Свой тип без нужных полей тоже уходит в заглушку: отрисовщик из реестра его не подхватывает.
 * Из нескольких отрисовщиков одного типа берётся последний. Секция даёт сетку ячеек, и блок в
 * ячейке собран теми же правилами.
 */
export function toBlockViews(
    blocks: readonly IRtAiChat.Block[],
    renderers: readonly IRtAiChat.BlockRenderer[]
): readonly IRtAiChat.BlockView[] {
    const byType: ReadonlyMap<string, IRtAiChat.BlockRenderer> = lastByType(renderers);

    return blocks.map((block: IRtAiChat.Block): IRtAiChat.BlockView =>
        block.type === RT_SECTION_BLOCK_TYPE ? sectionView(block, byType) : leafView(block, byType)
    );
}

/**
 * Текст ответа, как его видит читатель: markdown без знаков разметки, плашки — их текстом, таблицы —
 * строками через табуляцию со значениями в языке кита, KPI — строкой на карточку через табуляцию,
 * блоки из реестра — текстом функции `toText` их отрисовщика. Блок без такой функции пропущен.
 * Секция — заголовком и текстами своих блоков.
 * Пункты дельты пишутся подписью `points`; без неё — английским умолчанием кита.
 */
export function blocksToPlainText(
    blocks: readonly IRtAiChat.Block[],
    renderers: readonly IRtAiChat.BlockRenderer[] = [],
    locale: string = 'en',
    points: TRtAiChatPointsWriter = defaultPoints
): string {
    const context: ICopyContext = { byType: lastByType(renderers), locale, points };

    return blocks
        .map((block: IRtAiChat.Block): string => blockText(block, context))
        .filter((text: string): boolean => text.length > 0)
        .join(BLOCK_SEPARATOR);
}
