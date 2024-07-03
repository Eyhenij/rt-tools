import { transformArrayInput } from './transform-array-input';

describe(`${transformArrayInput.name} function`, () => {
    describe('should return the transformed array', () => {
        it('when a valid array is provided', () => {
            const inputArray: number[] = [1, 2, 3];
            const result: unknown[] = transformArrayInput(inputArray);
            expect(result).toEqual(inputArray);
        });
    });

    describe('should return an empty array', () => {
        it('when an empty array is provided', () => {
            const inputArray: unknown[] = [];
            const result: unknown[] = transformArrayInput(inputArray);
            expect(result).toEqual([]);
        });

        it('when a non-array value is provided', () => {
            const inputArray: string = 'not an array';
            const result: unknown[] = transformArrayInput(inputArray);
            expect(result).toEqual([]);
        });

        it('when a non-array (js object) value is provided', () => {
            const inputArray: { [key: string]: unknown } = { test: 'test' };
            const result: unknown[] = transformArrayInput(inputArray);
            expect(result).toEqual([]);
        });

        it('when a null value is provided', () => {
            const inputArray: null = null;
            const result: unknown[] = transformArrayInput(inputArray);
            expect(result).toEqual([]);
        });

        it(' when an undefined value is provided', () => {
            const inputArray: undefined = undefined;
            const result: unknown[] = transformArrayInput(inputArray);
            expect(result).toEqual([]);
        });
    });
});
