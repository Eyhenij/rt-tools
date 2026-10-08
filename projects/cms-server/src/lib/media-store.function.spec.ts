import {
    contentItemsUseFile,
    type IMediaFileDelegate,
    type IMediaFileRecord,
    type IRawQuerySource,
    mediaFilePageOf,
    mediaFilesWithoutCopies,
} from './media-store.function.js';
import { fileOf } from './testing/media-doubles.js';

function delegateOf(calls: unknown[]): IMediaFileDelegate {
    const file: IMediaFileRecord = fileOf('f1', 'image/png', 2000);
    return {
        findMany: async (args: unknown): Promise<IMediaFileRecord[]> => {
            calls.push(args);
            return [file];
        },
        count: async (args: unknown): Promise<number> => {
            calls.push(args);
            return 1;
        },
        findUnique: async (): Promise<IMediaFileRecord | null> => file,
        create: async (): Promise<IMediaFileRecord> => file,
        delete: async (): Promise<IMediaFileRecord> => file,
        update: async (): Promise<IMediaFileRecord> => file,
    };
}

function rawOf(answer: { used: boolean }[]): IRawQuerySource & { values: unknown[] } {
    const source: IRawQuerySource & { values: unknown[] } = {
        values: [],
        $queryRaw: async <T>(_query: TemplateStringsArray, ...values: unknown[]): Promise<T> => {
            source.values.push(...values);
            return answer as T;
        },
    };
    return source;
}

describe('the media files store', () => {
    it('SC-CMS-40 — the list page and its count share one filter by name and folder', async () => {
        const calls: unknown[] = [];

        expect(await mediaFilePageOf(delegateOf(calls), 0, 20, 'pine', null)).toMatchObject({ total: 1, files: [{ id: 'f1' }] });
        await mediaFilePageOf(delegateOf(calls), 0, 20, null, undefined);
        expect(calls).toEqual([
            {
                orderBy: { createdAt: 'desc' },
                where: { name: { contains: 'pine', mode: 'insensitive' }, folderId: null },
                skip: 0,
                take: 20,
            },
            { where: { name: { contains: 'pine', mode: 'insensitive' }, folderId: null } },
            { orderBy: { createdAt: 'desc' }, where: {}, skip: 0, take: 20 },
            { where: {} },
        ]);
    });

    it('SC-CMS-40 — the backfill queue is the files without copies', async () => {
        const calls: unknown[] = [];

        await mediaFilesWithoutCopies(delegateOf(calls), 50, 50);
        expect(calls).toEqual([{ where: { copyWidths: { isEmpty: true } }, orderBy: { createdAt: 'desc' }, skip: 50, take: 50 }]);
    });

    it('SC-CMS-40 — a file is in use when the query finds a reference, and an empty answer reads as unused', async () => {
        const used: IRawQuerySource & { values: unknown[] } = rawOf([{ used: true }]);

        await expect(contentItemsUseFile(used, 'f1')).resolves.toBe(true);
        await expect(contentItemsUseFile(rawOf([{ used: false }]), 'f1')).resolves.toBe(false);
        await expect(contentItemsUseFile(rawOf([]), 'f1')).resolves.toBe(false);
        expect(used.values).toEqual(['f1', 'f1', 'f1']);
    });
});
