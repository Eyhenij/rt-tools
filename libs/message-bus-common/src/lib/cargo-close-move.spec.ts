import { describe, expect, it } from 'vitest';

import { ECargoState } from './cargo-state';
import { cargoCloseData, cargoCloseMove, ECargoStateMove, ICargoStateAsk } from './cargo-state-move';

describe('cargoCloseMove', () => {
    it('SC-MB-269 — запись в «новом» закрывается сразу починенной', () => {
        expect(cargoCloseMove(ECargoState.New, ECargoState.Fixed)).toBe(ECargoStateMove.Allowed);
    });

    it('SC-MB-269 — закрытие ходит вперёд через шаг и на соседнее состояние', () => {
        expect(cargoCloseMove(ECargoState.New, ECargoState.Released)).toBe(ECargoStateMove.Allowed);
        expect(cargoCloseMove(ECargoState.InWork, ECargoState.Released)).toBe(ECargoStateMove.Allowed);
        expect(cargoCloseMove(ECargoState.Fixed, ECargoState.Released)).toBe(ECargoStateMove.Allowed);
    });

    it('SC-MB-271 — состояния, которые ставит дерево, закрытием не ставятся', () => {
        expect(cargoCloseMove(ECargoState.New, ECargoState.InWork)).toBe(ECargoStateMove.Denied);
        expect(cargoCloseMove(ECargoState.InWork, ECargoState.New)).toBe(ECargoStateMove.Denied);
        expect(cargoCloseMove(ECargoState.Fixed, ECargoState.InWork)).toBe(ECargoStateMove.Denied);
    });

    it('SC-MB-271 — назад закрытие не ходит', () => {
        expect(cargoCloseMove(ECargoState.Released, ECargoState.Fixed)).toBe(ECargoStateMove.Denied);
    });

    it('SC-MB-271 — запись, уже стоящая в названном состоянии, переходом не считается', () => {
        expect(cargoCloseMove(ECargoState.Fixed, ECargoState.Fixed)).toBe(ECargoStateMove.Same);
        expect(cargoCloseMove(ECargoState.Released, ECargoState.Released)).toBe(ECargoStateMove.Same);
    });
});

describe('cargoCloseData', () => {
    it('SC-MB-273 — в закрытую запись вместе с состоянием ложится признак закрывшего', () => {
        const ask: ICargoStateAsk = {
            key: 'id-1',
            state: ECargoState.Released,
            fixNote: null,
            releaseVersion: 'rt-agent-kit@0.17.0',
        };

        expect(cargoCloseData(ask)).toEqual({
            state: ECargoState.Released,
            releaseVersion: 'rt-agent-kit@0.17.0',
            closedByPublisher: true,
        });
    });
});
