import { describe, expect, it } from 'vitest';

import { cargoFixNoteFault, cargoStateWrites, ECargoFixNoteFault } from './cargo-fix-note';
import { ECargoState } from './cargo-state';
import { ECargoStateMove } from './cargo-state-move';

describe('cargoFixNoteFault', () => {
    it('SC-MB-181 — текст при переходе в «починено и не выпущено» годится', () => {
        expect(cargoFixNoteFault(ECargoState.Fixed, 'статьёй правила')).toBeNull();
    });

    it('SC-MB-182 — переход в «починено и не выпущено» без текста не годится', () => {
        expect(cargoFixNoteFault(ECargoState.Fixed, null)).toBe(ECargoFixNoteFault.Missing);
    });

    it('SC-MB-183 — текст при любом другом переходе не годится', () => {
        expect(cargoFixNoteFault(ECargoState.New, 'статьёй правила')).toBe(ECargoFixNoteFault.Unexpected);
        expect(cargoFixNoteFault(ECargoState.InWork, 'статьёй правила')).toBe(ECargoFixNoteFault.Unexpected);
        expect(cargoFixNoteFault(ECargoState.Released, 'статьёй правила')).toBe(ECargoFixNoteFault.Unexpected);
    });

    it('SC-MB-183 — переход без текста годится везде, кроме починки', () => {
        expect(cargoFixNoteFault(ECargoState.New, null)).toBeNull();
        expect(cargoFixNoteFault(ECargoState.InWork, null)).toBeNull();
        expect(cargoFixNoteFault(ECargoState.Released, null)).toBeNull();
    });
});

describe('cargoStateWrites', () => {
    it('SC-MB-181 — разрешённый переход ложится с текстом и без него', () => {
        expect(cargoStateWrites(ECargoStateMove.Allowed, 'статьёй правила')).toBe(true);
        expect(cargoStateWrites(ECargoStateMove.Allowed, null)).toBe(true);
    });

    it('SC-MB-187 — правка в то же состояние ложится, только когда несёт текст', () => {
        expect(cargoStateWrites(ECargoStateMove.Same, 'второй правкой')).toBe(true);
        expect(cargoStateWrites(ECargoStateMove.Same, null)).toBe(false);
    });

    it('SC-MB-186 — отбитая строка не ложится ни с текстом, ни без него', () => {
        expect(cargoStateWrites(ECargoStateMove.Denied, 'статьёй правила')).toBe(false);
        expect(cargoStateWrites(ECargoStateMove.Denied, null)).toBe(false);
        expect(cargoStateWrites(null, 'статьёй правила')).toBe(false);
        expect(cargoStateWrites(null, null)).toBe(false);
    });
});
