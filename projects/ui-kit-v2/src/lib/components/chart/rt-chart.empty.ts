import type { EChartsCoreOption } from 'echarts/core';

function asList(value: unknown): unknown[] {
    if (Array.isArray(value)) {
        return value;
    }

    return value ? [value] : [];
}

function hasPoints(holder: unknown, key: string): boolean {
    if (!holder || typeof holder !== 'object') {
        return false;
    }

    const points: unknown = Reflect.get(holder, key);

    return Array.isArray(points) && points.length > 0;
}

/**
 * Пуста ли опция: ни в одной серии и ни в одном наборе данных нет ни одной точки.
 *
 * Серия без `data` берёт точки из `dataset`, поэтому пустой считается опция, где пусты и серии, и
 * наборы. Опция без серий тоже пуста: рисовать нечего.
 */
export function rtChartIsEmpty(option: EChartsCoreOption | null | undefined): boolean {
    if (!option) {
        return true;
    }

    const series: unknown[] = asList(Reflect.get(option, 'series'));

    if (series.length === 0) {
        return true;
    }

    const datasetFilled: boolean = asList(Reflect.get(option, 'dataset')).some((set: unknown): boolean => hasPoints(set, 'source'));

    return !datasetFilled && !series.some((item: unknown): boolean => hasPoints(item, 'data'));
}
