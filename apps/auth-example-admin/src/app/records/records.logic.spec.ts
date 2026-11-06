import { describe, expect, it } from 'vitest';

import { accountLines, REFUSAL_WORDS, refusalText } from './records.logic';

describe('accountLines', () => {
    it('puts the name and the email on two lines', () => {
        expect(accountLines('Rita Reader', 'reader@example.test')).toBe('Rita Reader\nreader@example.test');
    });

    it('leaves one line when a part is missing', () => {
        expect(accountLines(null, 'reader@example.test')).toBe('reader@example.test');
        expect(accountLines('Rita Reader', null)).toBe('Rita Reader');
    });
});

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
