import { describe, expect, it } from 'vitest';

import { cargoStateOf, ECargoState } from './cargo-state';

describe('cargoStateOf', () => {
    it('SC-MB-167 — значение набора читается тем состоянием, каким приехало', () => {
        expect(cargoStateOf('new')).toBe(ECargoState.New);
        expect(cargoStateOf('in_work')).toBe(ECargoState.InWork);
        expect(cargoStateOf('fixed')).toBe(ECargoState.Fixed);
        expect(cargoStateOf('released')).toBe(ECargoState.Released);
    });

    it('SC-MB-168 — значение вне набора и пустое читаются как новое', () => {
        expect(cargoStateOf('разобрано наполовину')).toBe(ECargoState.New);
        expect(cargoStateOf('')).toBe(ECargoState.New);
    });
});
