/** Вид графика в спецификации из вызова инструмента. */
export enum ERtAiChatChartKind {
    LINE = 'line',
    BAR = 'bar',
    GROUPED_BAR = 'grouped_bar',
    STACKED_BAR = 'stacked_bar',
    PIE = 'pie',
    HISTOGRAM = 'histogram',
    HEATMAP = 'heatmap',
    SCATTER = 'scatter',
    TREEMAP = 'treemap',
    SUNBURST = 'sunburst',
}

/** Как подписаны значения графика. */
export enum ERtAiChatChartFormat {
    NUMBER = 'number',
    PERCENT = 'percent',
    CURRENCY = 'currency',
}
