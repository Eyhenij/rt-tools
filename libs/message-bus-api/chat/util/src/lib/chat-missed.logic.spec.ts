import { describe, expect, it } from 'vitest';

import { missedSince } from './chat-missed.logic';

describe('missedSince', () => {
    it('минута из запроса разбирается', () => {
        expect(missedSince('2026-09-20T10:00:00.000Z')?.toISOString()).toBe('2026-09-20T10:00:00.000Z');
    });

    it('неназванная и неразобранная минута добор не сужают', () => {
        expect(missedSince(undefined)).toBeNull();
        expect(missedSince('  ')).toBeNull();
        expect(missedSince('позавчера')).toBeNull();
        expect(missedSince(1758362400000)).toBeNull();
    });
});
