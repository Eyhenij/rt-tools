import { dotDensity, isDotLit } from './rt-dot-field.logic';

const COLUMNS: number = 40;
const ROWS: number = 40;

/** Средняя плотность клеток в квадрате 5x5 вокруг точки: одна клетка зависит от случайного шума. */
function meanDensity(centerColumn: number, centerRow: number, time: number): number {
    let sum: number = 0;
    for (let row: number = centerRow - 2; row <= centerRow + 2; row++) {
        for (let column: number = centerColumn - 2; column <= centerColumn + 2; column++) {
            sum += dotDensity(column, row, COLUMNS, ROWS, time);
        }
    }

    return sum / 25;
}

describe('rt-dot-field logic', (): void => {
    it('SC-UKV-638 — на поляне в центре плотность ниже, чем у края', (): void => {
        const times: readonly number[] = [0, 1.5, 3, 7];
        const center: number = times.reduce((sum: number, time: number): number => sum + meanDensity(20, 20, time), 0);
        const edge: number = times.reduce((sum: number, time: number): number => sum + meanDensity(2, 2, time), 0);

        expect(center).toBeGreaterThan(0);
        expect(center).toBeLessThan(edge);
    });

    it('SC-UKV-639 — матрица Байера рвёт порог по клеткам одного блока 4x4', (): void => {
        const lit: boolean[] = [];
        for (let row: number = 0; row < 4; row++) {
            for (let column: number = 0; column < 4; column++) {
                lit.push(isDotLit(0.66, column, row));
            }
        }

        expect(lit).toContain(true);
        expect(lit).toContain(false);
    });
});
