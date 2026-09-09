import { describe, expect, it } from 'vitest';

import { cargoQuarantineNoteFault, ECargoQuarantineNoteFault } from './cargo-quarantine-note';
import { ECargoState } from './cargo-state';

describe('cargoQuarantineNoteFault', () => {
    it('SC-MB-309 — причина при переходе в карантин годится', () => {
        expect(cargoQuarantineNoteFault(ECargoState.Quarantined, 'спорит со спекой о границах пакета')).toBeNull();
    });

    it('SC-MB-310 — переход в карантин без причины не годится', () => {
        expect(cargoQuarantineNoteFault(ECargoState.Quarantined, null)).toBe(ECargoQuarantineNoteFault.Missing);
    });

    it('SC-MB-311 — причина при любом другом переходе не годится', () => {
        expect(cargoQuarantineNoteFault(ECargoState.New, 'спорит со спекой')).toBe(ECargoQuarantineNoteFault.Unexpected);
        expect(cargoQuarantineNoteFault(ECargoState.InWork, 'спорит со спекой')).toBe(ECargoQuarantineNoteFault.Unexpected);
        expect(cargoQuarantineNoteFault(ECargoState.Fixed, 'спорит со спекой')).toBe(ECargoQuarantineNoteFault.Unexpected);
        expect(cargoQuarantineNoteFault(ECargoState.Released, 'спорит со спекой')).toBe(ECargoQuarantineNoteFault.Unexpected);
    });

    it('SC-MB-311 — переход без причины и без карантина ничем не отбивается', () => {
        expect(cargoQuarantineNoteFault(ECargoState.New, null)).toBeNull();
        expect(cargoQuarantineNoteFault(ECargoState.Fixed, null)).toBeNull();
    });
});
