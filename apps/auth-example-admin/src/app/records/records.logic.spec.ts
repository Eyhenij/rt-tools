import { describe, expect, it } from 'vitest';

import { REFUSAL_WORDS, refusalText } from './records.logic';

describe('refusalText', () => {
    it('names a refusal by the right for 403', () => {
        expect(refusalText(403)).toBe(REFUSAL_WORDS.forbidden);
    });

    it('names a record without a title for 400', () => {
        expect(refusalText(400)).toBe(REFUSAL_WORDS.invalid);
    });

    it('names a server that did not answer for every other status', () => {
        expect(refusalText(0)).toBe(REFUSAL_WORDS.unavailable);
        expect(refusalText(502)).toBe(REFUSAL_WORDS.unavailable);
    });
});
