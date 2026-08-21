import { describe, expect, it } from 'vitest';

import { cargoReleaseVersionFault, ECargoReleaseVersionFault } from './cargo-release-version';
import { ECargoState } from './cargo-state';

describe('cargoReleaseVersionFault', () => {
    it('SC-MB-193 — версия при переходе в «выпущено» годится', () => {
        expect(cargoReleaseVersionFault(ECargoState.Released, 'rt-agent-kit@0.10.1')).toBeNull();
    });

    it('SC-MB-194 — переход в «выпущено» без версии не годится', () => {
        expect(cargoReleaseVersionFault(ECargoState.Released, null)).toBe(ECargoReleaseVersionFault.Missing);
    });

    it('SC-MB-195 — версия при любом другом переходе не годится', () => {
        expect(cargoReleaseVersionFault(ECargoState.New, 'rt-agent-kit@0.10.1')).toBe(ECargoReleaseVersionFault.Unexpected);
        expect(cargoReleaseVersionFault(ECargoState.InWork, 'rt-agent-kit@0.10.1')).toBe(ECargoReleaseVersionFault.Unexpected);
        expect(cargoReleaseVersionFault(ECargoState.Fixed, 'rt-agent-kit@0.10.1')).toBe(ECargoReleaseVersionFault.Unexpected);
    });

    it('SC-MB-195 — переход без версии годится везде, кроме выпуска', () => {
        expect(cargoReleaseVersionFault(ECargoState.New, null)).toBeNull();
        expect(cargoReleaseVersionFault(ECargoState.InWork, null)).toBeNull();
        expect(cargoReleaseVersionFault(ECargoState.Fixed, null)).toBeNull();
    });

    it('SC-MB-202 — формы версии решение не судит', () => {
        expect(cargoReleaseVersionFault(ECargoState.Released, 'редакция без цифр')).toBeNull();
    });
});
