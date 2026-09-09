import { describe, expect, it } from 'vitest';

import { ECargoState } from '@rt/message-bus-common';

import { cargoStateLabel } from './cargo-state.logic';

describe('cargoStateLabel', () => {
    it('SC-MB-171 — у каждого состояния своё слово человека, а не машинная строка', () => {
        expect(cargoStateLabel(ECargoState.New)).toBe('Новое');
        expect(cargoStateLabel(ECargoState.InWork)).toBe('В работе');
        expect(cargoStateLabel(ECargoState.Fixed)).toBe('Готово');
        expect(cargoStateLabel(ECargoState.Released)).toBe('Выпущено');
    });

    it('SC-MB-316 — у карантина тоже своё слово человека', () => {
        expect(cargoStateLabel(ECargoState.Quarantined)).toBe('В карантине');
    });
});
