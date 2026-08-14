import { describe, expect, it } from 'vitest';

import { ITreeCommandParse, parseTreeCommand, TREE_COMMANDS_USAGE } from './tree-command.util';

describe('parseTreeCommand', () => {
    it('SC-MB-19 — заведение дерева разбирается в имя и признак', () => {
        const parse: ITreeCommandParse = parseTreeCommand(['tree:add', 'Своё дерево', 'own-tree']);

        expect(parse.fault).toBeNull();
        expect(parse.command).toEqual({ kind: 'add', name: 'Своё дерево', slug: 'own-tree' });
    });

    it('SC-MB-26 — заведение без признака не разбирается, и отказ говорит, что признак обязателен', () => {
        const parse: ITreeCommandParse = parseTreeCommand(['tree:add', 'Своё дерево']);

        expect(parse.command).toBeNull();
        expect(parse.fault).toContain('признак дерева обязателен');
    });

    it('SC-MB-26 — признак из одних пробелов признаком не считается', () => {
        const parse: ITreeCommandParse = parseTreeCommand(['tree:add', 'Своё дерево', '   ']);

        expect(parse.command).toBeNull();
        expect(parse.fault).toContain('признак дерева обязателен');
    });

    it('SC-MB-19 — заведение без имени не разбирается', () => {
        const parse: ITreeCommandParse = parseTreeCommand(['tree:add']);

        expect(parse.command).toBeNull();
        expect(parse.fault).toContain('имя дерева');
    });

    it('SC-MB-25 — выдача нового токена разбирается по имени дерева', () => {
        expect(parseTreeCommand(['tree:token', 'Своё дерево']).command).toEqual({ kind: 'token', name: 'Своё дерево' });
    });

    it('SC-MB-25 — выдача без имени дерева не разбирается', () => {
        const parse: ITreeCommandParse = parseTreeCommand(['tree:token']);

        expect(parse.command).toBeNull();
        expect(parse.fault).toContain('tree:token');
    });

    it('отзыв разбирается по имени дерева', () => {
        expect(parseTreeCommand(['tree:revoke', 'Своё дерево']).command).toEqual({ kind: 'revoke', name: 'Своё дерево' });
    });

    it('SC-MB-6 — список деревьев разбирается без доводов', () => {
        expect(parseTreeCommand(['tree:list']).command).toEqual({ kind: 'list' });
    });

    it('незнакомая команда не разбирается, и отказ перечисляет команды деревьев', () => {
        const parse: ITreeCommandParse = parseTreeCommand(['tree:grant', 'Своё дерево']);

        expect(parse.command).toBeNull();
        expect(parse.fault).toContain('tree:grant');
        TREE_COMMANDS_USAGE.forEach((line: string): void => {
            expect(parse.fault).toContain(line);
        });
    });
});
