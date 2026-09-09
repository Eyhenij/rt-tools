import { describe, expect, it } from 'vitest';

import { CARGO_RELEASE_VERSION_LIMIT, ECargoKind, ECargoState } from '@rt/message-bus-common';

import { cargoStateBody, ECargoStateBodyFault, ICargoStateParsed } from './cargo-state-body';

describe('cargoStateBody', () => {
    it('SC-MB-173 — пакет из двух родов разбирается в две строки', () => {
        const body: ICargoStateParsed = cargoStateBody([
            { kind: 'postmortem', key: '2026-08-20-guard.md', state: 'in_work' },
            { kind: 'proposal', key: 'ab12cd34', state: 'in_work' },
        ]);

        expect(body.fault).toBeNull();
        expect(body.lines).toEqual([
            {
                at: 0,
                kind: ECargoKind.Postmortem,
                key: '2026-08-20-guard.md',
                state: ECargoState.InWork,
                fixNote: null,
                releaseVersion: null,
                quarantineNote: null,
            },
            {
                at: 1,
                kind: ECargoKind.Proposal,
                key: 'ab12cd34',
                state: ECargoState.InWork,
                fixNote: null,
                releaseVersion: null,
                quarantineNote: null,
            },
        ]);
    });

    it('SC-MB-184 — текст починки из одних пробелов приходит пустотой', () => {
        const body: ICargoStateParsed = cargoStateBody([
            { kind: 'postmortem', key: 'a.md', state: 'fixed', fixNote: '   \n\t ' },
            { kind: 'postmortem', key: 'b.md', state: 'fixed', fixNote: '  статьёй правила  ' },
        ]);

        expect(body.fault).toBeNull();
        expect(body.lines?.[0]?.fixNote).toBeNull();
        expect(body.lines?.[1]?.fixNote).toBe('статьёй правила');
    });

    it('SC-MB-188 — своего предела длины у текста починки нет', () => {
        const long: string = 'п'.repeat(20000);
        const body: ICargoStateParsed = cargoStateBody([{ kind: 'postmortem', key: 'a.md', state: 'fixed', fixNote: long }]);

        expect(body.fault).toBeNull();
        expect(body.lines?.[0]?.fixNote).toBe(long);
    });

    it('SC-MB-179 — текст починки не строкой отбивает запрос и называет строку', () => {
        const body: ICargoStateParsed = cargoStateBody([
            { kind: 'postmortem', key: 'a.md', state: 'fixed', fixNote: 'статьёй правила' },
            { kind: 'postmortem', key: 'b.md', state: 'fixed', fixNote: 17 },
        ]);

        expect(body.lines).toBeNull();
        expect(body.fault).toBe(ECargoStateBodyFault.BadFixNote);
        expect(body.at).toBe(1);
    });

    it('SC-MB-179 — незнакомое состояние отбивает запрос и называет строку', () => {
        const body: ICargoStateParsed = cargoStateBody([
            { kind: 'postmortem', key: 'a.md', state: 'new' },
            { kind: 'postmortem', key: 'b.md', state: 'разобрано наполовину' },
        ]);

        expect(body.lines).toBeNull();
        expect(body.fault).toBe(ECargoStateBodyFault.UnknownState);
        expect(body.at).toBe(1);
    });

    it('SC-MB-179 — незнакомый род записи отбивает запрос и называет строку', () => {
        const body: ICargoStateParsed = cargoStateBody([{ kind: 'month', key: 'a', state: 'new' }]);

        expect(body.lines).toBeNull();
        expect(body.fault).toBe(ECargoStateBodyFault.UnknownKind);
        expect(body.at).toBe(0);
    });

    it('SC-MB-179 — строка без обязательного поля отбивает запрос и называет своё место', () => {
        const body: ICargoStateParsed = cargoStateBody([
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

    it('SC-MB-196 — версия выпуска из одних пробелов приходит пустотой', () => {
        const body: ICargoStateParsed = cargoStateBody([
            { kind: 'postmortem', key: 'a.md', state: 'released', releaseVersion: '   \n\t ' },
            { kind: 'postmortem', key: 'b.md', state: 'released', releaseVersion: '  rt-agent-kit@0.10.1  ' },
        ]);

        expect(body.fault).toBeNull();
        expect(body.lines?.[0]?.releaseVersion).toBeNull();
        expect(body.lines?.[1]?.releaseVersion).toBe('rt-agent-kit@0.10.1');
    });

    it('SC-MB-201 — версия длиннее предела отбивает запрос и называет строку', () => {
        const body: ICargoStateParsed = cargoStateBody([
            { kind: 'postmortem', key: 'a.md', state: 'released', releaseVersion: 'rt-agent-kit@0.10.1' },
            { kind: 'postmortem', key: 'b.md', state: 'released', releaseVersion: 'в'.repeat(CARGO_RELEASE_VERSION_LIMIT + 1) },
        ]);

        expect(body.lines).toBeNull();
        expect(body.fault).toBe(ECargoStateBodyFault.LongReleaseVersion);
        expect(body.at).toBe(1);
    });

    it('SC-MB-201 — версия ровно в предел проходит', () => {
        const body: ICargoStateParsed = cargoStateBody([
            { kind: 'postmortem', key: 'a.md', state: 'released', releaseVersion: 'в'.repeat(CARGO_RELEASE_VERSION_LIMIT) },
        ]);

        expect(body.fault).toBeNull();
        expect(body.lines?.[0]?.releaseVersion).toHaveLength(CARGO_RELEASE_VERSION_LIMIT);
    });

    it('SC-MB-202 — формы версии разбор не судит', () => {
        const body: ICargoStateParsed = cargoStateBody([
            { kind: 'postmortem', key: 'a.md', state: 'released', releaseVersion: 'редакция' },
        ]);

        expect(body.fault).toBeNull();
        expect(body.lines?.[0]?.releaseVersion).toBe('редакция');
    });

    it('SC-MB-201 — версия не строкой отбивает запрос и называет строку', () => {
        const body: ICargoStateParsed = cargoStateBody([{ kind: 'postmortem', key: 'a.md', state: 'released', releaseVersion: 12 }]);

        expect(body.lines).toBeNull();
        expect(body.fault).toBe(ECargoStateBodyFault.BadReleaseVersion);
        expect(body.at).toBe(0);
    });
});
