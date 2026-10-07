/** The widths of the reduced copies: a card, an article column and a cover on a wide screen. */
export const MEDIA_COPY_WIDTHS: readonly number[] = [480, 960, 1600];

/** The type of a copy: every live browser reads WebP, and it is lighter than JPEG and PNG of the same width. */
export const MEDIA_COPY_CONTENT_TYPE: string = 'image/webp';

/**
 * A file stays the same under its key — the key is built from the record id — so a CDN keeps it
 * for a year. The application's file store sets this header on every file it puts.
 */
export const MEDIA_CACHE_CONTROL: string = 'public, max-age=31536000, immutable';

/** A copy of one width, built before the file store. */
export interface IBuiltMediaCopy {
    readonly width: number;
    readonly content: Uint8Array;
}

/** A copy as the contract gives it: the width and the address under the public address of the store. */
export interface IMediaCopy {
    readonly width: number;
    readonly url: string;
}

/**
 * The file store of the media library: it puts a file under a key, reads and removes it. The
 * application implements it over its own storage — an S3 bucket, a disk.
 */
export interface IMediaBucket {
    put(key: string, body: Uint8Array, contentType: string): Promise<void>;
    read(key: string): Promise<Uint8Array>;
    remove(key: string): Promise<void>;
}

/**
 * Builds a reduced WebP copy of a picture of the given width. The application implements it over
 * its image library; the copy is turned by the photo metadata and loses it, so the place of the shot
 * never reaches the site.
 */
export interface IMediaResizer {
    copy(content: Uint8Array, width: number): Promise<Uint8Array>;
}

/**
 * A copy wider than the original is not built — a stretched one is heavier and worse; a copy as
 * wide as the original is built, because WebP is lighter. A GIF gets no copies: a copy would lose
 * the animation.
 */
export function mediaCopyWidths(contentType: string, width: number): number[] {
    if (contentType === 'image/gif') {
        return [];
    }
    return MEDIA_COPY_WIDTHS.filter((copyWidth: number) => copyWidth <= width);
}

/** The key of a file in the store is built from the record id: two files with one name never overwrite each other. */
export function mediaKey(fileId: string, extension: string): string {
    return `media/${fileId}.${extension}`;
}

/** The key of a copy is built from the record id and the width: the record keeps only which widths are built. */
export function mediaCopyKey(fileId: string, width: number): string {
    return `media/${fileId}-${String(width)}.webp`;
}

/** The address of a file is the public address of the store and the key; a trailing slash is not doubled. */
export function mediaUrl(publicBase: string, key: string): string {
    return publicBase.endsWith('/') ? `${publicBase}${key}` : `${publicBase}/${key}`;
}

export function mediaCopies(publicBase: string, fileId: string, widths: readonly number[]): IMediaCopy[] {
    return [...widths]
        .sort((left: number, right: number) => left - right)
        .map((width: number) => ({ width, url: mediaUrl(publicBase, mediaCopyKey(fileId, width)) }));
}

/**
 * The copies of every width a picture of this type and width is due. The upload and the backfill
 * build them by one road: otherwise a file backfilled later would get other copies than one
 * uploaded today.
 */
export function buildMediaCopies(
    resizer: IMediaResizer,
    content: Uint8Array,
    contentType: string,
    width: number
): Promise<IBuiltMediaCopy[]> {
    return Promise.all(
        mediaCopyWidths(contentType, width).map(async (copyWidth: number) => ({
            width: copyWidth,
            content: await resizer.copy(content, copyWidth),
        }))
    );
}
