import { describe, expect, it } from 'vitest';

import { ECargoState } from './cargo-state';
import { cargoStateData, cargoStateMove, cargoStateWrites, ECargoStateMove, ICargoStateAsk } from './cargo-state-move';

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

describe('cargoStateWrites', () => {
    it('SC-MB-181 — разрешённый переход ложится с приложенным значением и без него', () => {
        expect(cargoStateWrites(ECargoStateMove.Allowed, 'статьёй правила', null)).toBe(true);
        expect(cargoStateWrites(ECargoStateMove.Allowed, null, null)).toBe(true);
    });

    it('SC-MB-187 — правка в то же состояние ложится, только когда несёт текст починки', () => {
        expect(cargoStateWrites(ECargoStateMove.Same, 'второй правкой', null)).toBe(true);
        expect(cargoStateWrites(ECargoStateMove.Same, null, null)).toBe(false);
    });

    it('SC-MB-199 — правка в то же состояние ложится, когда несёт версию выпуска', () => {
        expect(cargoStateWrites(ECargoStateMove.Same, null, 'rt-agent-kit@0.10.1')).toBe(true);
    });

    it('SC-MB-186 — отбитая строка не ложится ни с приложенным значением, ни без него', () => {
        expect(cargoStateWrites(ECargoStateMove.Denied, 'статьёй правила', null)).toBe(false);
        expect(cargoStateWrites(ECargoStateMove.Denied, null, 'rt-agent-kit@0.10.1')).toBe(false);
        expect(cargoStateWrites(null, 'статьёй правила', null)).toBe(false);
        expect(cargoStateWrites(null, null, null)).toBe(false);
    });
});

describe('cargoStateData', () => {
    const ask: (fixNote: string | null, releaseVersion: string | null) => ICargoStateAsk = (
        fixNote: string | null,
        releaseVersion: string | null
    ): ICargoStateAsk => ({
        key: 'разбор.md',
        state: ECargoState.Released,
        fixNote,
        releaseVersion,
    });

    it('SC-MB-193 — версия выпуска ложится в запись вместе с состоянием', () => {
        expect(cargoStateData(ask(null, 'rt-agent-kit@0.10.1'))).toEqual({
            state: ECargoState.Released,
            releaseVersion: 'rt-agent-kit@0.10.1',
        });
    });

    it('SC-MB-198 — приложенного значения нет — в правку идёт одно состояние', () => {
        expect(cargoStateData(ask(null, null))).toEqual({ state: ECargoState.Released });
    });
});
