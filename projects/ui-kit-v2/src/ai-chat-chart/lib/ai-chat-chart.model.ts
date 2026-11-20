import { ERtAiChatChartFormat, ERtAiChatChartKind } from './ai-chat-chart.enum';

export namespace IRtAiChatChart {
    /** Точка ряда: категория или число по X и значение по Y. */
    export interface Point {
        readonly x: string | number;
        readonly y: number;
    }

    export interface Series {
        readonly name: string;
        readonly points: readonly Point[];
    }

    /** Лист дерева: путь от корня и его значение. */
    export interface Leaf {
        readonly path: readonly string[];
        readonly value: number;
    }

    /** Спецификация графика — аргументы вызова инструмента после разбора. */
    export interface Spec {
        readonly kind: ERtAiChatChartKind;
        readonly title?: string;
        readonly subtitle?: string;
        readonly xLabel?: string;
        readonly yLabel?: string;
        readonly format?: ERtAiChatChartFormat;
        readonly currency?: string;
        readonly series?: readonly Series[];
        readonly hierarchy?: readonly Leaf[];
    }

    /** Блок ответа: спецификация строкой JSON или уже разобранная; `pending` — аргументы ещё приходят. */
    export interface Block {
        readonly type: 'chart';
        readonly spec: unknown;
        readonly pending?: boolean;
    }
}

/** Пределы спецификации: сверх них она отказывается целиком. */
export const RT_AI_CHAT_CHART_LIMITS: Readonly<{
    series: number;
    points: number;
    leaves: number;
    hierarchyEntries: number;
    depth: number;
}> = {
    series: 6,
    points: 60,
    leaves: 200,
    hierarchyEntries: 400,
    depth: 4,
};
