import { NotEqualPipe } from './not-equal.pipe';

describe(NotEqualPipe.name, () => {
    const pipe: NotEqualPipe = new NotEqualPipe();
    const compare1: string = 'Compare 1';
    const compare2: string = 'Compare 2';

    it('should return true if values to compare does not contain provided value', () => {
        const value: string = 'Compare 5';
        expect(pipe.transform(value, compare1, compare2)).toBe(true);
    });
    it('should return false if values to compare contain any provided value', () => {
        const value: string = 'Compare 1';
        expect(pipe.transform(value, compare1, compare2)).toBe(false);
    });
});
