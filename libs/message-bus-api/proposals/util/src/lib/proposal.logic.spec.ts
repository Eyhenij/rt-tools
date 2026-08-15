import { describe, expect, it } from 'vitest';

import { proposalDigest } from './proposal.logic';

/** Длина шестнадцатеричной записи хеша: она же — всё, что уезжает в ограничение хранилища. */
const DIGEST_LENGTH: number = 64;

describe('proposalDigest', () => {
    it('SC-MB-82 — предложение длиннее предела строки индекса принимается', () => {
        const long: string = 'предложение о слое правил '.repeat(400);

        expect(long.length).toBeGreaterThan(4000);
        expect(proposalDigest(long)).toHaveLength(DIGEST_LENGTH);
    });

    it('SC-MB-85 — один и тот же текст даёт один и тот же признак', () => {
        expect(proposalDigest('первое')).toBe(proposalDigest('первое'));
        expect(proposalDigest('первое')).not.toBe(proposalDigest('второе'));
    });
});
