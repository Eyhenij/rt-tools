import { isEmail } from './is-email.js';

describe('isEmail', () => {
    describe('accepts well-formed addresses', () => {
        const valid: string[] = [
            'test@test.com',
            'user.name@example.co.uk',
            'user+tag_name@sub.domain.org',
            'a@b.co',
            'first.last@x-y.example',
            'digits123@123domain.io',
        ];

        it.each(valid)('%s', (value: string) => {
            expect(isEmail(value)).toBe(true);
        });
    });

    describe('rejects malformed addresses', () => {
        const invalid: string[] = [
            'some string',
            'no-at-sign.com',
            '@no-local.com',
            'no-domain@',
            'two@@ats.com',
            'trailing.dot@domain.',
            'leading-hyphen@-domain.com',
            'space in@local.com',
        ];

        it.each(invalid)('%s', (value: string) => {
            expect(isEmail(value)).toBe(false);
        });
    });

    describe('length limits', () => {
        it('rejects a local part longer than 64 characters', () => {
            expect(isEmail(`${'a'.repeat(65)}@example.com`)).toBe(false);
        });

        it('accepts a local part of exactly 64 characters', () => {
            expect(isEmail(`${'a'.repeat(64)}@example.com`)).toBe(true);
        });

        it('rejects an address longer than 254 characters', () => {
            const address: string = `${'a'.repeat(64)}@${'b'.repeat(186)}.com`;

            expect(address.length).toBeGreaterThan(254);
            expect(isEmail(address)).toBe(false);
        });
    });

    describe('empty values', () => {
        /**
         * Deliberate: the check only rejects malformed input and leaves presence to a separate
         * required-check. Long-standing behaviour, inherited from the validator this function used
         * to delegate to — these cases exist so it cannot drift silently.
         */
        it.each([
            ['an empty string', ''],
            ['null', null],
            ['undefined', undefined],
            ['an empty array', []],
        ])('treats %s as valid', (_name: string, value: unknown) => {
            expect(isEmail(value)).toBe(true);
        });
    });
});
