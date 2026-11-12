import { labelSegment } from './rt-stepper.logic';
import { IRtStepper } from './rt-stepper.model';

describe('labelSegment', (): void => {
    it('SC-UKV-1230 — подпись первого шага берёт всю полосу и прижата к началу', (): void => {
        expect(labelSegment(0, 4)).toEqual({ start: 0, size: 100, anchor: 'start' });
    });

    it('SC-UKV-1231 — подпись последнего шага берёт всю полосу и прижата к концу', (): void => {
        expect(labelSegment(3, 4)).toEqual({ start: 0, size: 100, anchor: 'end' });
    });

    it('SC-UKV-1232 — подпись третьего из четырёх стоит в отрезке с центром на доле шага', (): void => {
        const segment: IRtStepper.LabelSegment = labelSegment(2, 4);

        expect(segment.anchor).toBe('center');
        expect(segment.start).toBeCloseTo(100 / 3);
        expect(segment.size).toBeCloseTo(200 / 3);
    });

    it('SC-UKV-1232 — отрезок второго из четырёх начинается у края и кончается на двух третях', (): void => {
        const segment: IRtStepper.LabelSegment = labelSegment(1, 4);

        expect(segment.start).toBe(0);
        expect(segment.size).toBeCloseTo(200 / 3);
    });

    it('SC-UKV-1232 — отрезок любого среднего шага не выходит за полосу', (): void => {
        for (let total: number = 3; total <= 16; total++) {
            for (let index: number = 1; index < total - 1; index++) {
                const segment: IRtStepper.LabelSegment = labelSegment(index, total);
                const centred: boolean = segment.anchor === 'center';

                expect(segment.start).toBeGreaterThanOrEqual(0);
                expect(segment.start + segment.size).toBeLessThanOrEqual(100 + 1e-9);
                expect(segment.size).toBeGreaterThanOrEqual(50);
                expect(centred ? segment.start + segment.size / 2 : 0).toBeCloseTo(centred ? (index / (total - 1)) * 100 : 0);
            }
        }
    });

    it('SC-UKV-1234 — подпись второго из шестнадцати берёт всю полосу и прижата к началу', (): void => {
        expect(labelSegment(1, 16)).toEqual({ start: 0, size: 100, anchor: 'start' });
    });

    it('SC-UKV-1234 — подпись пятнадцатого из шестнадцати берёт всю полосу и прижата к концу', (): void => {
        expect(labelSegment(14, 16)).toEqual({ start: 0, size: 100, anchor: 'end' });
    });

    it('SC-UKV-1234 — отрезок ровно в половину полосы остаётся над точкой', (): void => {
        expect(labelSegment(1, 5)).toEqual({ start: 0, size: 50, anchor: 'center' });
    });

    it('единственный шаг стоит у начала полосы', (): void => {
        expect(labelSegment(0, 1)).toEqual({ start: 0, size: 100, anchor: 'start' });
    });
});
