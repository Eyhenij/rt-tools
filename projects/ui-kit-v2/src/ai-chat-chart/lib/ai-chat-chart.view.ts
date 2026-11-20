import { rtAiChatChartCheck, TRtAiChatChartCheck } from './ai-chat-chart.check';
import { rtAiChatChartFormat } from './ai-chat-chart.data';
import { ERtAiChatChartKind } from './ai-chat-chart.enum';
import { IRtAiChatChart } from './ai-chat-chart.model';

/** Что рисует блок: заглушку, пока спецификация идёт, плашку, если она негодна, или график. */
export type TRtAiChatChartState =
    | { readonly kind: 'pending' }
    | { readonly kind: 'invalid'; readonly reason: string }
    | { readonly kind: 'ready'; readonly spec: IRtAiChatChart.Spec };

const PENDING: TRtAiChatChartState = { kind: 'pending' };

/** Ширина одного знака подписи оси в точках: оценка, по которой прореживаются подписи. */
const LABEL_CHAR_WIDTH: number = 7;

/** Промежуток между соседними подписями оси. */
const LABEL_GAP: number = 12;

/** Длина имени файла без расширения, по Q-12. */
const FILE_NAME_LENGTH: number = 80;

const FILE_NAME_FALLBACK: string = 'chart';

const TREE_KINDS: ReadonlySet<ERtAiChatChartKind> = new Set([ERtAiChatChartKind.TREEMAP, ERtAiChatChartKind.SUNBURST]);

/** Виды, где нулевое значение не даёт площади: сплошные нули рисуют пустое поле. */
const AREA_KINDS: ReadonlySet<ERtAiChatChartKind> = new Set([ERtAiChatChartKind.PIE, ...TREE_KINDS]);

/** Состояние блока из того, что пришло во вход `block`: признак ожидания сильнее содержимого. */
export function rtAiChatChartState(block: unknown): TRtAiChatChartState {
    if (typeof block !== 'object' || block === null) {
        return { kind: 'invalid', reason: 'json' };
    }
    if (Reflect.get(block, 'pending') === true) {
        return PENDING;
    }
    const result: TRtAiChatChartCheck = rtAiChatChartCheck(Reflect.get(block, 'spec'));

    return result.ok ? { kind: 'ready', spec: result.spec } : { kind: 'invalid', reason: result.reason };
}

function valuesOf(spec: IRtAiChatChart.Spec): number[] {
    if (TREE_KINDS.has(spec.kind)) {
        return (spec.hierarchy ?? []).map((leaf: IRtAiChatChart.Leaf): number => leaf.value);
    }

    return (spec.series ?? []).flatMap((one: IRtAiChatChart.Series): number[] =>
        one.points.map((point: IRtAiChatChart.Point): number => point.y)
    );
}

/** Пусто: ни одной точки, а в круге и деревьях — ещё и все значения нулевые. */
export function rtAiChatChartIsEmpty(spec: IRtAiChatChart.Spec): boolean {
    const values: number[] = valuesOf(spec);

    return values.length === 0 || (AREA_KINDS.has(spec.kind) && values.every((value: number): boolean => value === 0));
}

/** Каждую какую подпись оси категорий показывать, чтобы подписи не налезали друг на друга. */
export function rtAiChatChartLabelEvery(categories: readonly string[], width: number): number {
    if (width <= 0 || categories.length === 0) {
        return 1;
    }
    const longest: number = Math.max(...categories.map((category: string): number => category.length));
    const fits: number = Math.max(1, Math.floor(width / (longest * LABEL_CHAR_WIDTH + LABEL_GAP)));

    return Math.max(1, Math.ceil(categories.length / fits));
}

/** Снимает дефис с краёв: серии прочих знаков уже сведены к одному дефису. */
function trimDash(text: string): string {
    const start: number = text.startsWith('-') ? 1 : 0;
    const end: number = text.endsWith('-') && text.length > start ? text.length - 1 : text.length;

    return text.slice(start, end);
}

/** Имя PNG по заголовку, по Q-12: буквы и цифры остаются, прочее — одним дефисом, до 80 знаков. */
export function rtAiChatChartFileName(title: string | undefined): string {
    const name: string = trimDash(trimDash((title ?? '').replace(/[^\p{L}\p{N}]+/gu, '-')).slice(0, FILE_NAME_LENGTH));

    return `${name || FILE_NAME_FALLBACK}.png`;
}

/** Листья дерева: равные пути сложены, порядок — первого появления. */
function leavesOf(spec: IRtAiChatChart.Spec): Map<string, number> {
    const leaves: Map<string, number> = new Map<string, number>();
    for (const leaf of spec.hierarchy ?? []) {
        const path: string = leaf.path.join(' / ');
        leaves.set(path, (leaves.get(path) ?? 0) + leaf.value);
    }

    return leaves;
}

/** Подпись `x` в копии: корзина гистограммы — `low–high`, прочее — как дано. */
function xTextOf(spec: IRtAiChatChart.Spec, points: readonly IRtAiChatChart.Point[], index: number): string {
    const x: string | number = points[index].x;
    if (spec.kind !== ERtAiChatChartKind.HISTOGRAM) {
        return String(x);
    }
    const step: number = points.length > 1 ? Number(points[1].x) - Number(points[0].x) : 0;

    return `${x}–${Number(x) + step}`;
}

/** Текст блока для копии ответа, по Q-13: заголовок, подзаголовок, затем строка на ряд или лист. */
export function rtAiChatChartText(spec: IRtAiChatChart.Spec, locale: string): string {
    const format: (value: number) => string = rtAiChatChartFormat(spec, locale);
    const head: string[] = [spec.title, spec.subtitle].filter((text: string | undefined): text is string => !!text);
    const body: string[] = TREE_KINDS.has(spec.kind)
        ? [...leavesOf(spec)].map(([path, value]: [string, number]): string => `${path} — ${format(value)}`)
        : (spec.series ?? []).map(
              (one: IRtAiChatChart.Series): string =>
                  `${one.name}: ${one.points
                      .map(
                          (point: IRtAiChatChart.Point, index: number): string => `${xTextOf(spec, one.points, index)} — ${format(point.y)}`
                      )
                      .join('; ')}`
          );

    return [...head, ...body].join('\n');
}

/** Текст блока для копии из того, что пришло во вход: ожидающий и негодный блок не дают ничего. */
export function rtAiChatChartBlockText(block: unknown, locale: string): string {
    const state: TRtAiChatChartState = rtAiChatChartState(block);

    return state.kind === 'ready' ? rtAiChatChartText(state.spec, locale) : '';
}
