import { RtRowHasActionsPipe } from './rt-table-row-actions.pipe';

interface IRow {
    id: number;
    archived: boolean;
}

const pipe: RtRowHasActionsPipe = new RtRowHasActionsPipe();

describe('RtRowHasActionsPipe', (): void => {
    it('без предиката действия у строки есть', (): void => {
        expect(pipe.transform<IRow>({ id: 1, archived: true }, null)).toBe(true);
    });

    it('предикат решает построчно', (): void => {
        const hasActions: (row: IRow) => boolean = (row: IRow): boolean => !row.archived;

        expect(pipe.transform<IRow>({ id: 1, archived: false }, hasActions)).toBe(true);
        expect(pipe.transform<IRow>({ id: 2, archived: true }, hasActions)).toBe(false);
    });
});
