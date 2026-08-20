import { describe, expect, it } from 'vitest';

import { ECargoState } from './cargo-state';
import { cargoStateMove, ECargoStateMove } from './cargo-state-move';

describe('cargoStateMove', () => {
    it('SC-MB-174 — возврат из «в работе» в «новое» проходит', () => {
        expect(cargoStateMove(ECargoState.InWork, ECargoState.New)).toBe(ECargoStateMove.Allowed);
    });

    it('SC-MB-174 — шаг вперёд идёт на соседнее состояние', () => {
        expect(cargoStateMove(ECargoState.New, ECargoState.InWork)).toBe(ECargoStateMove.Allowed);
        expect(cargoStateMove(ECargoState.InWork, ECargoState.Fixed)).toBe(ECargoStateMove.Allowed);
        expect(cargoStateMove(ECargoState.Fixed, ECargoState.Released)).toBe(ECargoStateMove.Allowed);
    });

    it('SC-MB-175 — прыжок через шаг запрещён', () => {
        expect(cargoStateMove(ECargoState.New, ECargoState.Fixed)).toBe(ECargoStateMove.Denied);
        expect(cargoStateMove(ECargoState.New, ECargoState.Released)).toBe(ECargoStateMove.Denied);
        expect(cargoStateMove(ECargoState.InWork, ECargoState.Released)).toBe(ECargoStateMove.Denied);
    });

    it('SC-MB-175 — назад ходит только возврат из «в работе»', () => {
        expect(cargoStateMove(ECargoState.Fixed, ECargoState.InWork)).toBe(ECargoStateMove.Denied);
        expect(cargoStateMove(ECargoState.Fixed, ECargoState.New)).toBe(ECargoStateMove.Denied);
        expect(cargoStateMove(ECargoState.Released, ECargoState.Fixed)).toBe(ECargoStateMove.Denied);
        expect(cargoStateMove(ECargoState.Released, ECargoState.New)).toBe(ECargoStateMove.Denied);
        expect(cargoStateMove(ECargoState.Released, ECargoState.InWork)).toBe(ECargoStateMove.Denied);
    });

    it('SC-MB-176 — правка в то же состояние переходом не считается', () => {
        expect(cargoStateMove(ECargoState.New, ECargoState.New)).toBe(ECargoStateMove.Same);
        expect(cargoStateMove(ECargoState.InWork, ECargoState.InWork)).toBe(ECargoStateMove.Same);
        expect(cargoStateMove(ECargoState.Fixed, ECargoState.Fixed)).toBe(ECargoStateMove.Same);
        expect(cargoStateMove(ECargoState.Released, ECargoState.Released)).toBe(ECargoStateMove.Same);
    });
});
