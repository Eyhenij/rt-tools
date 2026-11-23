/** Сколько строк стоит по каждую сторону от домашнего круга: столько барабан крутится одним жестом, не упираясь в край. */
const SIDE_ROWS: number = 60;

/** Строка барабана: значение круга и то, чем его копия отличается от домашней. */
export interface IRtDateWheelRow<T> {
    readonly cell: T;
    /** Номер строки в колонке: ключ для шаблона. */
    readonly key: number;
    /** Якорь для тестов: у домашнего круга — `qa`, у копий — `qa` с хвостом `-copy`. */
    readonly qa: string;
    /** Значение выбрано и строка стоит в домашнем круге. */
    readonly pressed: boolean;
    /** Копия спрятана от скринридера и от Tab: значение называет один раз домашний круг. */
    readonly hidden: 'true' | null;
    /**
     * В барабане Tab стоит только на выбранном значении, остальные меняют стрелки: обход всех строк
     * прокручивал бы колонку и менял выбор сам. В списке строки стоят в обходе как обычные кнопки.
     */
    readonly tabindex: 0 | -1 | null;
}

/**
 * Номер строки, стоящей под полосой выбора барабана. Колонка несёт сверху и снизу поля в две
 * строки, поэтому при прокрутке `0` под полосой стоит первая строка, а каждая строка прокрутки
 * сдвигает на одну. Пустая колонка строки не имеет: `-1`.
 */
export function rtDateWheelIndex(scrollTop: number, row: number, count: number): number {
    if (count <= 0 || row <= 0) {
        return -1;
    }

    return Math.min(count - 1, Math.max(0, Math.round(scrollTop / row)));
}

/** Прокрутка колонки, при которой строка с этим номером стоит под полосой выбора. */
export function rtDateWheelTop(index: number, row: number): number {
    return Math.max(0, index) * row;
}

/**
 * Сколько раз круг значений повторён в колонке, чтобы барабан крутился без конца: нечётное число,
 * домашний круг стоит посередине, и по каждую сторону от него не меньше `SIDE_ROWS` строк.
 */
export function rtDateWheelTurns(count: number): number {
    return count <= 0 ? 1 : 2 * Math.ceil(SIDE_ROWS / count) + 1;
}

/** Номер значения в круге по номеру строки колонки. */
export function rtDateWheelValue(row: number, count: number): number {
    return count <= 0 || row < 0 ? -1 : row % count;
}

/** Строка домашнего круга с этим значением: к ней барабан возвращается, когда остановился. */
export function rtDateWheelHome(value: number, count: number, turns: number): number {
    return Math.floor(turns / 2) * count + Math.max(0, value);
}

/**
 * Ближайшая к строке `from` строка с этим значением: нажатое значение подъезжает под полосу
 * коротким путём, а не через весь круг.
 */
export function rtDateWheelNearest(value: number, count: number, turns: number, from: number): number {
    const rows: number[] = Array.from({ length: turns }, (_: unknown, turn: number): number => turn * count + Math.max(0, value));

    return rows.reduce((best: number, row: number): number => (Math.abs(row - from) < Math.abs(best - from) ? row : best), rows[0]);
}

/**
 * Строки колонки. Барабан повторяет круг значений `rtDateWheelTurns` раз; список у поля на широком
 * экране несёт круг один раз, и все его строки домашние.
 */
export function rtDateWheelRows<T extends { readonly value: number }>(
    cells: readonly T[],
    wheel: boolean,
    chosen: number | null,
    qa: string
): IRtDateWheelRow<T>[] {
    const turns: number = wheel ? rtDateWheelTurns(cells.length) : 1;
    const homeTurn: number = Math.floor(turns / 2);

    return Array.from({ length: turns * cells.length }, (_: unknown, key: number): IRtDateWheelRow<T> => {
        const cell: T = cells[key % cells.length];
        const home: boolean = Math.floor(key / cells.length) === homeTurn;
        const pressed: boolean = home && cell.value === chosen;
        const inWheel: 0 | -1 = pressed ? 0 : -1;

        return {
            cell,
            key,
            pressed,
            qa: home ? qa : `${qa}-copy`,
            hidden: home ? null : 'true',
            tabindex: wheel ? inWheel : null,
        };
    });
}
