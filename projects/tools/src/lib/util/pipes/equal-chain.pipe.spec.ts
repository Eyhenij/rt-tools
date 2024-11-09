import { EqualChainPipe } from './equal-chain.pipe';

describe(EqualChainPipe.name, () => {
    const pipe: EqualChainPipe = new EqualChainPipe();
    const arg1: string = 'a';
    const arg2: string = 'b';

    describe('should return true', () => {
        it('if object contain provided value', () => {
            const obj: object = { a: { b: true } };
            expect(pipe.transform(obj, arg1, arg2, true)).toBe(true);
        });
    });

    describe('should return false', () => {
        it('if object does not contain provided value', () => {
            const obj: object = { a: { b: false } };
            expect(pipe.transform(obj, arg1, arg2, true)).toBe(false);
        });
        it('if object does not contain provided argument', () => {
            const obj: object = { a: { c: true } };
            expect(pipe.transform(obj, arg1, arg2, true)).toBe(false);
        });
    });
});
