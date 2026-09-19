import { describe, expect, it } from 'vitest';

import { ECargoState } from '@rt/message-bus-common';

import { cargoStateKey } from './cargo-state.logic';

describe('cargoStateKey', () => {
    it('SC-MB-171 — у каждого состояния свой ключ словаря, а не машинная строка', () => {
        expect(cargoStateKey(ECargoState.New)).toBe('cargoStateNew');
        expect(cargoStateKey(ECargoState.InWork)).toBe('cargoStateInWork');
        expect(cargoStateKey(ECargoState.Fixed)).toBe('cargoStateFixed');
        expect(cargoStateKey(ECargoState.Released)).toBe('cargoStateReleased');
    });

    it('SC-MB-316 — у карантина тоже свой ключ', () => {
        expect(cargoStateKey(ECargoState.Quarantined)).toBe('cargoStateQuarantined');
    });
});
