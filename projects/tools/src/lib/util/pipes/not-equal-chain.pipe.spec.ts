import { NotEqualChainPipe } from './not-equal-chain.pipe';

describe(NotEqualChainPipe.name, () => {
    const pipe: NotEqualChainPipe = new NotEqualChainPipe();
    const arg1: string = 'a';
    const arg2: string = 'b';

    describe('should return false', () => {
        it('if object contain provided value', () => {
            const obj: object = { a: { b: true } };
            expect(pipe.transform(obj, arg1, arg2, true)).toBe(false);
        });
    });

    describe('should return true', () => {
        it('if object does not contain provided value', () => {
            const obj: object = { a: { b: false } };
            expect(pipe.transform(obj, arg1, arg2, true)).toBe(true);
        });
        it('if object does not contain provided argument', () => {
            const obj: object = { a: { c: true } };
            expect(pipe.transform(obj, arg1, arg2, true)).toBe(true);
        });
    });
});
