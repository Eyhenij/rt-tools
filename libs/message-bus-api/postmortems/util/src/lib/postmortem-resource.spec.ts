import { describe, expect, it } from 'vitest';

import { postmortemResourceOf } from './postmortem.const';

describe('postmortemResourceOf', () => {
    it('SC-AK-1324 — имя ресурса пакета принимается', () => {
        expect(postmortemResourceOf('rules/testing.md')).toBe('rules/testing.md');
    });

    it('SC-AK-1324 — чужая форма читается как отсутствие ресурса', () => {
        expect(postmortemResourceOf('/Users/one/tree/file.md')).toBeNull();
        expect(postmortemResourceOf('просто текст')).toBeNull();
        expect(postmortemResourceOf(undefined)).toBeNull();
    });
});
