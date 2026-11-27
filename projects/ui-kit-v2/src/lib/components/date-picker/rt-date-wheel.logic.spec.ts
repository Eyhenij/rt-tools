import {
    rtDateWheelHome,
    rtDateWheelIndex,
    rtDateWheelNearest,
    rtDateWheelRows,
    rtDateWheelTop,
    rtDateWheelTurns,
    rtDateWheelValue,
    IRtDateWheelRow,
} from './rt-date-wheel.logic';

describe('Барабан времени — какое значение стоит под полосой', (): void => {
    it('SC-UKV-1762 — прокрутка на строку сдвигает на одно значение, недокрученное берётся ближайшее', (): void => {
        expect(rtDateWheelIndex(0, 40, 24)).toBe(0);
        expect(rtDateWheelIndex(360, 40, 24)).toBe(9);
        expect(rtDateWheelIndex(379, 40, 24)).toBe(9);
        expect(rtDateWheelIndex(381, 40, 24)).toBe(10);
    });

    it('SC-UKV-1762 — прокрутка за край даёт крайнее значение, пустая колонка значения не имеет', (): void => {
        expect(rtDateWheelIndex(-30, 40, 24)).toBe(0);
        expect(rtDateWheelIndex(5000, 40, 24)).toBe(23);
        expect(rtDateWheelIndex(120, 40, 0)).toBe(-1);
        expect(rtDateWheelIndex(120, 0, 24)).toBe(-1);
    });

    it('SC-UKV-1762 — значение с номером стоит под полосой при прокрутке на столько же строк', (): void => {
        expect(rtDateWheelTop(9, 40)).toBe(360);
        expect(rtDateWheelTop(-1, 40)).toBe(0);
    });

    it('SC-UKV-1768 — круг повторён нечётное число раз, по каждую сторону от домашнего не меньше 60 строк', (): void => {
        expect(rtDateWheelTurns(24)).toBe(7);
        expect(rtDateWheelTurns(12)).toBe(11);
        expect(rtDateWheelTurns(60)).toBe(3);
        expect(rtDateWheelTurns(0)).toBe(1);
    });

    it('SC-UKV-1768 — за последним значением круга идёт первое; домашняя строка стоит в среднем круге', (): void => {
        expect(rtDateWheelValue(23, 24)).toBe(23);
        expect(rtDateWheelValue(24, 24)).toBe(0);
        expect(rtDateWheelValue(-1, 24)).toBe(-1);
        expect(rtDateWheelHome(0, 24, 7)).toBe(72);
        expect(rtDateWheelHome(23, 24, 7)).toBe(95);
    });

    it('SC-UKV-1768 — нажатое значение подъезжает к полосе коротким путём: от 00 до 23 — на строку назад', (): void => {
        expect(rtDateWheelNearest(23, 24, 7, 72)).toBe(71);
        expect(rtDateWheelNearest(1, 24, 7, 95)).toBe(97);
        expect(rtDateWheelNearest(9, 24, 1, 3)).toBe(9);
    });

    it('SC-UKV-1768 — копии круга спрятаны от скринридера и Tab; у списка без барабана круг один и все строки домашние', (): void => {
        const cells: { value: number }[] = [{ value: 0 }, { value: 30 }];
        const wheel: IRtDateWheelRow<{ value: number }>[] = rtDateWheelRows(cells, true, 30, 'minute');
        const home: IRtDateWheelRow<{ value: number }>[] = wheel.filter(
            (row: IRtDateWheelRow<{ value: number }>): boolean => row.hidden === null
        );

        expect(wheel).toHaveLength(2 * rtDateWheelTurns(2));
        expect(home.map((row: IRtDateWheelRow<{ value: number }>): string => row.qa)).toEqual(['minute', 'minute']);
        expect(home.map((row: IRtDateWheelRow<{ value: number }>): boolean => row.pressed)).toEqual([false, true]);
        expect(wheel[0]).toMatchObject({ qa: 'minute-copy', pressed: false, hidden: 'true', tabindex: -1 });

        const list: IRtDateWheelRow<{ value: number }>[] = rtDateWheelRows(cells, false, 0, 'minute');
        expect(list.map((row: IRtDateWheelRow<{ value: number }>): string => row.qa)).toEqual(['minute', 'minute']);
        expect(list[0].pressed).toBe(true);
    });
});
