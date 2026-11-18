/**
 * Модель графика кита: что рисует `rt-chart`.
 *
 * Пять форм по полю `kind`. Линии, области и столбики — одна декартова форма и могут стоять в одном
 * графике. Цвет серии, сектора и листа — номер слота палитры от 1 до 8; без номера слот идёт по
 * порядку.
 */
export namespace IRtChart {
    /** Номер цвета палитры: `--rt-color-chart-series-1…8`. */
    export type TSlot = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

    /** Значок серии в легенде: круг или отрезок линии. */
    export type TMark = 'dot' | 'line';

    /** Что рисует декартова серия. */
    export type TSeriesType = 'line' | 'area' | 'bar';

    /**
     * Где стоят категории на оси: в середине своей полосы, на краях полос — для областей, или на
     * границах корзин гистограммы, тогда подписей на одну больше, чем значений.
     */
    export type TCategoryPlace = 'band' | 'edge' | 'bins';

    /** Подпись значения на оси и в подсказке. */
    export type TFormat = (value: number) => string;

    /** Ось значений: свои границы и шаг вместо подобранных по данным, своя подпись. */
    export interface ValueAxis {
        readonly min?: number;
        readonly max?: number;
        readonly step?: number;
        readonly format?: TFormat;
    }

    /** Полоса между нижней и верхней границей: разброс прогноза. */
    export interface Band {
        readonly low: ReadonlyArray<number | null>;
        readonly high: ReadonlyArray<number | null>;
    }

    /** Серия декартова графика. */
    export interface Series {
        readonly name: string;
        readonly type: TSeriesType;
        readonly values: ReadonlyArray<number | null>;
        readonly slot?: TSlot;
        /** Серии с одинаковым именем стопки складываются. */
        readonly stack?: string;
        readonly dashed?: boolean;
        /** Точки на линии. */
        readonly points?: boolean;
        readonly band?: Band;
        /** Номер панели: 0 — верхняя, 1 — нижняя. */
        readonly panel?: 0 | 1;
        readonly mark?: TMark;
    }

    /** Декартов график: категории по горизонтали, значения по вертикали, одна или две панели. */
    export interface Cartesian {
        readonly kind: 'cartesian';
        readonly categories: readonly string[];
        readonly series: readonly Series[];
        readonly place?: TCategoryPlace;
        /** Подпись у каждой n-й категории. */
        readonly labelEvery?: number;
        /** Оси значений по панелям. */
        readonly axes?: readonly ValueAxis[];
    }

    /** Серия точек. */
    export interface ScatterSeries {
        readonly name: string;
        readonly points: ReadonlyArray<readonly [number, number]>;
        readonly slot?: TSlot;
    }

    /** Точки на двух осях значений. */
    export interface Scatter {
        readonly kind: 'scatter';
        readonly series: readonly ScatterSeries[];
        readonly x?: ValueAxis;
        readonly y?: ValueAxis;
    }

    /** Сектор круга. */
    export interface Item {
        readonly name: string;
        readonly value: number;
        readonly slot?: TSlot;
    }

    /** Круг с отверстием и подписью в нём. */
    export interface Pie {
        readonly kind: 'pie';
        readonly items: readonly Item[];
        readonly center?: string;
        readonly format?: TFormat;
    }

    /** Тепловая карта: значение задаёт плотность первого цвета. */
    export interface Heatmap {
        readonly kind: 'heatmap';
        readonly columns: readonly string[];
        readonly rows: readonly string[];
        /** Значения по строкам, в каждой — по столбцам. */
        readonly values: ReadonlyArray<ReadonlyArray<number | null>>;
        readonly format?: TFormat;
    }

    /** Узел дерева: у листа значение, у группы дети. */
    export interface Node {
        readonly name: string;
        readonly value?: number;
        readonly slot?: TSlot;
        readonly children?: readonly Node[];
    }

    /** Дерево прямоугольников или солнечные лучи. */
    export interface Tree {
        readonly kind: 'treemap' | 'sunburst';
        readonly nodes: readonly Node[];
        readonly format?: TFormat;
    }

    /** Любой график кита. */
    export type TData = Cartesian | Scatter | Pie | Heatmap | Tree;
}
