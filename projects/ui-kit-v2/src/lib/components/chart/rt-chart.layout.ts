import { rtChartHeatmapScene, rtChartTreemapScene } from './rt-chart.blocks';
import { rtChartCartesianScene, rtChartScatterScene } from './rt-chart.cartesian';
import { IRtChart } from './rt-chart.model';
import { rtChartPieScene, rtChartSunburstScene } from './rt-chart.round';
import { IRtChartScene, IRtChartSize, TRtChartMeasure } from './rt-chart.scene';

/** Пустая сцена: ничего не нарисовано. */
export const RT_CHART_NO_SCENE: IRtChartScene = { paths: [], texts: [], legend: [] };

/**
 * Сцена графика по его данным и размеру поля: фигуры, подписи и легенда.
 *
 * Чистая функция: d3 считает формы и раскладку дерева, шкалы — функции кита, а рисует шаблон.
 */
export function rtChartScene(data: IRtChart.TData, size: IRtChartSize, measure: TRtChartMeasure): IRtChartScene {
    if (size.width <= 0 || size.height <= 0) {
        return RT_CHART_NO_SCENE;
    }

    switch (data.kind) {
        case 'cartesian':
            return rtChartCartesianScene(data, size, measure);
        case 'scatter':
            return rtChartScatterScene(data, size, measure);
        case 'pie':
            return rtChartPieScene(data, size);
        case 'heatmap':
            return rtChartHeatmapScene(data, size, measure);
        case 'treemap':
            return rtChartTreemapScene(data, size, measure);
        default:
            return rtChartSunburstScene(data, size);
    }
}

/** Ширина подписи без холста — на сервере и в тестах: средняя буква в 0.6 кегля. */
export function rtChartEstimate(text: string, size: number): number {
    return text.length * size * 0.6;
}
