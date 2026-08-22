import { cargoKindFault, cargoKindOf, ECargoKind } from './cargo-kind';

describe('род груза', (): void => {
    describe('cargoKindOf', (): void => {
        it('SC-MB-254 — слово набора читается родом груза', (): void => {
            expect(cargoKindOf('postmortem')).toBe(ECargoKind.Postmortem);
            expect(cargoKindOf('proposal')).toBe(ECargoKind.Proposal);
        });

        it('SC-MB-254 — слово вне набора и не строка родом не читаются', (): void => {
            expect(cargoKindOf('summary')).toBeNull();
            expect(cargoKindOf(undefined)).toBeNull();
            expect(cargoKindOf(7)).toBeNull();
        });
    });

    describe('cargoKindFault', (): void => {
        it('SC-MB-254 — названный род разбирается без отказа', (): void => {
            expect(cargoKindFault({ kind: 'proposal' })).toBeNull();
        });

        it('SC-MB-254 — неназванный род отбивается именем параметра и набором слов', (): void => {
            expect(cargoKindFault({})).toBe('параметр kind ожидается одним из: postmortem, proposal');
            expect(cargoKindFault({ kind: 'сводка' })).toContain('параметр kind');
        });
    });
});
