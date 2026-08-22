import { describe, expect, it } from 'vitest';

import { cargoFixNoteFault, ECargoFixNoteFault } from './cargo-fix-note';
import { ECargoState } from './cargo-state';

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
