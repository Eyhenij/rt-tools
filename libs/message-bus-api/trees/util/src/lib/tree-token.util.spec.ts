import { describe, expect, it } from 'vitest';

import { issueTreeToken, treeTokenHash, treeTokenHashesMatch } from './tree-token.util';

describe('issueTreeToken', () => {
    it('SC-MB-5 — два выпуска подряд дают разные токены', () => {
        expect(issueTreeToken()).not.toBe(issueTreeToken());
    });
});

describe('treeTokenHash', () => {
    it('SC-MB-5 — хеш один и тот же у одного токена', () => {
        const token: string = issueTreeToken();

        expect(treeTokenHash(token)).toBe(treeTokenHash(token));
    });

    it('SC-MB-5 — по хешу токен не читается', () => {
        const token: string = issueTreeToken();
        const hash: string = treeTokenHash(token);

        // Сначала — что хеш вообще посчитан, и только потом, что токена в нём нет: проверка
        // отсутствия зелена и тогда, когда ищет не там.
        expect(hash).toHaveLength(64);
        expect(hash).not.toContain(token);
    });
});

describe('treeTokenHashesMatch', () => {
    it('SC-MB-5 — сошедшиеся хеши принимаются, разошедшиеся нет', () => {
        const hash: string = treeTokenHash('токен дерева');

        expect(treeTokenHashesMatch(hash, treeTokenHash('токен дерева'))).toBe(true);
        expect(treeTokenHashesMatch(hash, treeTokenHash('чужой токен'))).toBe(false);
    });

    it('SC-MB-5 — хеши разной длины не сходятся и сравнение не роняют', () => {
        expect(treeTokenHashesMatch(treeTokenHash('токен'), 'коротко')).toBe(false);
    });
});
