import { backfillMediaCopies, type IMediaCopiesBackfillSources } from './media-copies-backfill.function';
import type { IMediaFileRecord } from './media-store.function';
import { fileOf, memoryBucket, type IMemoryBucket, RESIZER } from './testing/media-doubles';

interface IBackfillDouble extends IMediaCopiesBackfillSources {
    rows: IMediaFileRecord[];
    readonly bucket: IMemoryBucket;
}

function backfillOf(rows: IMediaFileRecord[]): IBackfillDouble {
    const double: IBackfillDouble = {
        rows,
        bucket: memoryBucket(),
        resizer: RESIZER,
        filesWithoutCopies: async (skip: number, take: number): Promise<IMediaFileRecord[]> =>
            double.rows.filter((row: IMediaFileRecord) => row.copyWidths.length === 0).slice(skip, skip + take),
        saveCopyWidths: async (fileId: string, copyWidths: number[]): Promise<void> => {
            double.rows = double.rows.map((row: IMediaFileRecord) => (row.id === fileId ? { ...row, copyWidths } : row));
        },
    };
    return double;
}

describe('the copies backfill', () => {
    it('SC-CMS-39 — the backfill builds copies only for files without them, and a second run builds nothing', async () => {
        const double: IBackfillDouble = backfillOf([
            fileOf('wide', 'image/png', 2000),
            fileOf('narrow', 'image/png', 300),
            fileOf('gif', 'image/gif', 2000),
            fileOf('done', 'image/png', 2000, [480]),
        ]);

        await expect(backfillMediaCopies(double)).resolves.toEqual({ built: 1, skipped: 2, failed: [] });
        expect([...double.bucket.objects.keys()]).toEqual(['media/wide-480.webp', 'media/wide-960.webp', 'media/wide-1600.webp']);
        await expect(backfillMediaCopies(double)).resolves.toEqual({ built: 0, skipped: 2, failed: [] });
    });

    it('SC-CMS-39 — a failure of one file does not stop the backfill and is named in the result', async () => {
        const double: IBackfillDouble = backfillOf([fileOf('lost', 'image/png', 2000), fileOf('ok', 'image/png', 2000)]);
        double.bucket.unreadable.add('media/lost.png');
        const rejecting: IBackfillDouble = backfillOf([fileOf('odd', 'image/png', 2000)]);
        rejecting.bucket.read = (): Promise<Uint8Array> => Promise.reject('timeout');

        await expect(backfillMediaCopies(double)).resolves.toEqual({
            built: 1,
            skipped: 0,
            failed: [{ name: 'lost.png', reason: 'NoSuchKey' }],
        });
        await expect(backfillMediaCopies(rejecting)).resolves.toEqual({
            built: 0,
            skipped: 0,
            failed: [{ name: 'odd.png', reason: 'timeout' }],
        });
    });
});
