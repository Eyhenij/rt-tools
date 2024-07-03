import { BreakStringPipe } from './break-string.pipe';

describe(BreakStringPipe.name, () => {
    const pipe: BreakStringPipe = new BreakStringPipe();

    describe('when string contains capital letter', () => {
        it('should return string with a breaks', () => {
            const value: string = 'WithCapitalLetter';
            expect(pipe.transform(value)).toBe('With Capital Letter');
        });
    });

    describe('when string contains number', () => {
        it('should return original string', () => {
            const value: string = 'Withnumber6';
            expect(pipe.transform(value)).toBe('Withnumber6');
        });
    });

    describe('when string contains punctuation marks', () => {
        it('should return original string', () => {
            const value: string = 'Withpunctuationmarks!';
            expect(pipe.transform(value)).toBe('Withpunctuationmarks!');
        });
    });

    describe('when string does not contain capital letter', () => {
        it('should return original string', () => {
            const value: string = 'Withoutcapitalletter';
            expect(pipe.transform(value)).toBe('Withoutcapitalletter');
        });
    });

    describe('when string contains capital letter', () => {
        it('should not return original string', () => {
            const value: string = 'WithCapitalLetter';
            expect(pipe.transform(value)).not.toBe('WithCapitalLetter');
        });
    });
});
