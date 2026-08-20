import { describe, expect, it } from 'vitest';

import { ECargoState } from '@rt/message-bus-common';

import { cargoStateBody, ECargoStateBodyFault, ECargoStateKind, ICargoStateBody } from './cargo-state-body';

describe('cargoStateBody', () => {
    it('SC-MB-173 — пакет из двух родов разбирается в две строки', () => {
        const body: ICargoStateBody = cargoStateBody([
            { kind: 'postmortem', key: '2026-08-20-guard.md', state: 'in_work' },
            { kind: 'proposal', key: 'ab12cd34', state: 'in_work' },
        ]);

        expect(body.fault).toBeNull();
        expect(body.lines).toEqual([
            { at: 0, kind: ECargoStateKind.Postmortem, key: '2026-08-20-guard.md', state: ECargoState.InWork },
            { at: 1, kind: ECargoStateKind.Proposal, key: 'ab12cd34', state: ECargoState.InWork },
        ]);
    });

    it('SC-MB-179 — незнакомое состояние отбивает запрос и называет строку', () => {
        const body: ICargoStateBody = cargoStateBody([
            { kind: 'postmortem', key: 'a.md', state: 'new' },
            { kind: 'postmortem', key: 'b.md', state: 'разобрано наполовину' },
        ]);

        expect(body.lines).toBeNull();
        expect(body.fault).toBe(ECargoStateBodyFault.UnknownState);
        expect(body.at).toBe(1);
    });

    it('SC-MB-179 — незнакомый род записи отбивает запрос и называет строку', () => {
        const body: ICargoStateBody = cargoStateBody([{ kind: 'month', key: 'a', state: 'new' }]);

        expect(body.lines).toBeNull();
        expect(body.fault).toBe(ECargoStateBodyFault.UnknownKind);
        expect(body.at).toBe(0);
    });

    it('SC-MB-179 — строка без обязательного поля отбивает запрос и называет своё место', () => {
        const body: ICargoStateBody = cargoStateBody([
            { kind: 'postmortem', key: 'a.md', state: 'new' },
            { kind: 'postmortem', state: 'new' },
        ]);

        expect(body.fault).toBe(ECargoStateBodyFault.BadLine);
        expect(body.at).toBe(1);
    });

    it('SC-MB-179 — пустой пакет и не список отбиваются без места', () => {
        expect(cargoStateBody([]).fault).toBe(ECargoStateBodyFault.Empty);
        expect(cargoStateBody([]).at).toBeNull();
        expect(cargoStateBody('строки').fault).toBe(ECargoStateBodyFault.NotAList);
        expect(cargoStateBody(undefined).fault).toBe(ECargoStateBodyFault.NotAList);
    });
});
