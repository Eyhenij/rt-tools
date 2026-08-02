import { transformStringInput } from './transform-string-input.js';

describe(transformStringInput.name, () => {
    it('should pass strings through unchanged', () => {
        expect(transformStringInput('text')).toBe('text');
        expect(transformStringInput('')).toBe('');
    });

    it('should coerce anything that is not a string to an empty string', () => {
        expect(transformStringInput(null)).toBe('');
        expect(transformStringInput(undefined)).toBe('');
        expect(transformStringInput(42)).toBe('');
        expect(transformStringInput({})).toBe('');
    });
});
