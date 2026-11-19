import { rtStatTileFitStep } from './rt-stat-tile.fit';

describe('rtStatTileFitStep', (): void => {
    const sizes: readonly number[] = [24, 20, 18];

    it('SC-UKV-1485 — значение шире строки берёт 20, затем 18, а не входит и так — остаётся на 18', (): void => {
        // Ширины значений при 24 px bold в карточке 160, место 131.
        expect([131, 148, 155, 169, 180].map((width: number): number => rtStatTileFitStep(width, sizes, 131))).toEqual([0, 1, 1, 2, 2]);
    });

    it('SC-UKV-1485 — без места или без шкалы значение остаётся на первом шаге', (): void => {
        expect(rtStatTileFitStep(200, sizes, 0)).toBe(0);
        expect(rtStatTileFitStep(200, [], 131)).toBe(0);
    });
});
