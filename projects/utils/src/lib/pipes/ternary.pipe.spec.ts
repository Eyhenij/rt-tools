import { TernaryPipe } from './ternary.pipe';

describe(TernaryPipe.name, () => {
    const expressionTrue: string = 'First';
    const expressionFalse: string = 'Second';
    const pipe: TernaryPipe = new TernaryPipe();

    it('should return first expression if input is truthy', () => {
        expect(pipe.transform(true, expressionTrue, expressionFalse)).toBe(expressionTrue);
    });

    it('should return second expression if input is falsy', () => {
        expect(pipe.transform(false, expressionTrue, expressionFalse)).toBe(expressionFalse);
    });
});
