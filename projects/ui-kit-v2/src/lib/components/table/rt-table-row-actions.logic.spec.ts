import { rowHasAvailableActions } from './rt-table-row-actions.logic';

interface IRow {
    id: string;
    canConfirm: boolean;
}

function row(overrides: Partial<IRow> = {}): IRow {
    return { id: 'b-1', canConfirm: true, ...overrides };
}

describe('rowHasAvailableActions', () => {
    it('строка без доступных действий кнопку меню не показывает', () => {
        expect(rowHasAvailableActions(row({ canConfirm: false }), (candidate: IRow): boolean => candidate.canConfirm)).toBe(false);
    });

    it('строка хотя бы с одним доступным действием кнопку меню показывает', () => {
        expect(rowHasAvailableActions(row(), (candidate: IRow): boolean => candidate.canConfirm)).toBe(true);
    });

    it('без предиката действия считаются доступными', () => {
        expect(rowHasAvailableActions(row({ canConfirm: false }), null)).toBe(true);
    });
});
