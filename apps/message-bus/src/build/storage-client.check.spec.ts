import { describe, expect, it } from 'vitest';

import { GENERATE_COMMAND, STORAGE_CLIENT_DIR, STORAGE_CLIENT_ENTRY, storageClientFailure } from './storage-client.check.mjs';

/** Дерево, в котором есть перечисленные пути и больше ничего. */
function treeWith(...paths: readonly string[]): (path: string) => boolean {
    return (path: string): boolean => paths.includes(path);
}

describe('storageClientFailure', () => {
    it('SC-MB-107 — сборка без клиента хранилища отказывает и называет команду', () => {
        const failure: string | null = storageClientFailure(treeWith());

        expect(failure).not.toBeNull();
        expect(failure).toContain(STORAGE_CLIENT_DIR);
        expect(failure).toContain(GENERATE_COMMAND);
    });

    it('SC-MB-108 — наполовину сгенерированный клиент считается пропажей', () => {
        const failure: string | null = storageClientFailure(treeWith(`${STORAGE_CLIENT_DIR}/enums.ts`));

        expect(failure).not.toBeNull();
        expect(failure).toContain(GENERATE_COMMAND);
    });

    it('SC-MB-109 — при живом клиенте проверка молчит', () => {
        expect(storageClientFailure(treeWith(STORAGE_CLIENT_ENTRY))).toBeNull();
    });
});
