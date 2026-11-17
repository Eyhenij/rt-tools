import { BarChart, HeatmapChart, LineChart, PieChart, ScatterChart, SunburstChart, TreemapChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent, VisualMapContinuousComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';

/**
 * Виды графика, которые кит берёт у `echarts`, и части, которыми они пользуются.
 *
 * Регистрируется ровно этот набор: полный `echarts` тянет виды, которых кит не рисует. Рендерер —
 * SVG: серии и оси становятся узлами страницы, витрина сверяет их цвета с макетом, а спеки идут
 * без canvas. Вид сверх набора потребитель регистрирует сам через `echarts.use` — экземпляр общий.
 */
export const RT_CHART_KINDS: readonly string[] = ['line', 'bar', 'pie', 'heatmap', 'scatter', 'treemap', 'sunburst'];

echarts.use([
    LineChart,
    BarChart,
    PieChart,
    HeatmapChart,
    ScatterChart,
    TreemapChart,
    SunburstChart,
    GridComponent,
    LegendComponent,
    TooltipComponent,
    VisualMapContinuousComponent,
    SVGRenderer,
]);

/** Экземпляр `echarts` с зарегистрированным набором — его получает `ngx-echarts`. */
export const RT_CHART_ECHARTS: typeof echarts = echarts;
