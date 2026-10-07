import {
    buildMediaCopies,
    type IBuiltMediaCopy,
    type IMediaBucket,
    type IMediaResizer,
    MEDIA_COPY_CONTENT_TYPE,
    mediaCopyKey,
    mediaCopyWidths,
} from './media-copies.function';
import type { IMediaFileRecord } from './media-store.function';

/** What the backfill takes: the queue of files without copies, the file store, the resizer and the write of the widths. */
export interface IMediaCopiesBackfillSources {
    readonly filesWithoutCopies: (skip: number, take: number) => Promise<IMediaFileRecord[]>;
    readonly bucket: IMediaBucket;
    readonly resizer: IMediaResizer;
    readonly saveCopyWidths: (fileId: string, copyWidths: number[]) => Promise<void>;
}

/** A file the backfill failed: the name — to find it in the media library, the reason — to know what to fix. */
export interface IMediaCopiesBackfillFailure {
    readonly name: string;
    readonly reason: string;
}

/** The backfill result: how many files got copies, how many are due none and which failed. */
export interface IMediaCopiesBackfillReport {
    readonly built: number;
    readonly skipped: number;
    readonly failed: IMediaCopiesBackfillFailure[];
}

const BATCH: number = 50;

async function copiesOf(sources: IMediaCopiesBackfillSources, file: IMediaFileRecord): Promise<void> {
    const original: Uint8Array = await sources.bucket.read(file.key);
    const copies: IBuiltMediaCopy[] = await buildMediaCopies(sources.resizer, original, file.contentType, file.width);
    for (const copy of copies) {
        await sources.bucket.put(mediaCopyKey(file.id, copy.width), copy.content, MEDIA_COPY_CONTENT_TYPE);
    }
    await sources.saveCopyWidths(
        file.id,
        copies.map((copy: IBuiltMediaCopy) => copy.width)
    );
}

/**
 * Builds the copies of files uploaded before the copies existed. The queue is the files without
 * copies: a file that got them leaves it, so a second run builds nothing and an interrupted one
 * goes on from the same place. A failure of one file is named in the result and does not stop the
 * rest. The copies are put before the widths are written: a file failed halfway stays in the queue
 * and is backfilled by the next run.
 */
export async function backfillMediaCopies(sources: IMediaCopiesBackfillSources): Promise<IMediaCopiesBackfillReport> {
    let built: number = 0;
    let skipped: number = 0;
    const failed: IMediaCopiesBackfillFailure[] = [];

    for (let stayed: number = 0; ;) {
        const batch: IMediaFileRecord[] = await sources.filesWithoutCopies(stayed, BATCH);
        if (batch.length === 0) {
            break;
        }
        for (const file of batch) {
            if (mediaCopyWidths(file.contentType, file.width).length === 0) {
                skipped++;
                stayed++;
                continue;
            }
            try {
                await copiesOf(sources, file);
                built++;
            } catch (error: unknown) {
                failed.push({ name: file.name, reason: error instanceof Error ? error.message : String(error) });
                stayed++;
            }
        }
    }

    return { built, skipped, failed };
}
