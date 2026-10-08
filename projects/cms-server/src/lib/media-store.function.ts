/** A media library file as storage keeps it. Its address and its copies' addresses are not stored: they are built from the key. */
export interface IMediaFileRecord {
    readonly id: string;
    readonly key: string;
    readonly name: string;
    readonly contentType: string;
    readonly size: number;
    readonly width: number;
    readonly height: number;
    /** The widths of the built copies; empty — no copies: a narrow picture, a GIF or a file before the backfill. */
    readonly copyWidths: number[];
    /** The media folder; none — the root. */
    readonly folderId: string | null;
    readonly createdAt: Date;
}

export interface IMediaFileDraft {
    readonly id: string;
    readonly key: string;
    readonly name: string;
    readonly contentType: string;
    readonly size: number;
    readonly width: number;
    readonly height: number;
    readonly copyWidths: number[];
    readonly uploadedById: string;
    readonly folderId: string | null;
}

export interface IMediaFilePage {
    readonly files: readonly IMediaFileRecord[];
    readonly total: number;
}

/** The folder of a list: a folder id, `null` for the root, `undefined` for every file. */
export type TMediaFolderScope = string | null | undefined;

/** The list filter: a case-insensitive part of the file name and the folder. */
export interface IMediaFileWhere {
    name?: { contains: string; mode: 'insensitive' };
    copyWidths?: { isEmpty: boolean };
    folderId?: string | null;
}

/** The files delegate of a database client, declared by its shape; a Prisma `mediaFile` delegate fits it as it is. */
export interface IMediaFileDelegate {
    findMany(args: { where?: IMediaFileWhere; orderBy: { createdAt: 'desc' }; skip: number; take: number }): Promise<IMediaFileRecord[]>;
    count(args: { where?: IMediaFileWhere }): Promise<number>;
    findUnique(args: { where: { id: string } }): Promise<IMediaFileRecord | null>;
    create(args: { data: IMediaFileDraft }): Promise<IMediaFileRecord>;
    delete(args: { where: { id: string } }): Promise<IMediaFileRecord>;
    update(args: { where: { id: string }; data: { copyWidths: number[] } }): Promise<IMediaFileRecord>;
}

/** A list page of the files, the newest first; the page and its count share one filter. */
export async function mediaFilePageOf(
    files: IMediaFileDelegate,
    skip: number,
    take: number,
    search: string | null,
    folder: TMediaFolderScope
): Promise<IMediaFilePage> {
    const where: IMediaFileWhere = {
        ...(search === null ? {} : { name: { contains: search, mode: 'insensitive' } }),
        ...(folder === undefined ? {} : { folderId: folder }),
    };

    const [found, total]: [IMediaFileRecord[], number] = await Promise.all([
        files.findMany({ orderBy: { createdAt: 'desc' }, where, skip, take }),
        files.count({ where }),
    ]);

    return { files: found, total };
}

/**
 * The files without copies — the backfill queue. Narrow pictures and GIFs stay in it for good, but
 * they are due no copies, and the backfill passes them building nothing.
 */
export function mediaFilesWithoutCopies(files: IMediaFileDelegate, skip: number, take: number): Promise<IMediaFileRecord[]> {
    return files.findMany({ where: { copyWidths: { isEmpty: true } }, orderBy: { createdAt: 'desc' }, skip, take });
}

/** A raw-query database client, declared by its shape; a Prisma client fits it as it is. */
export interface IRawQuerySource {
    $queryRaw<T>(query: TemplateStringsArray, ...values: unknown[]): Promise<T>;
}

/**
 * Whether a page refers to a media library file. There are three references: the main image and a
 * gallery image by the file id, and a body block image by its address inside the body. The address
 * is built from the file key, so the body is searched by the key. The query reads the tables
 * `content_items`, `content_item_images` and `media_files` of the application's schema.
 */
export async function contentItemsUseFile(source: IRawQuerySource, fileId: string): Promise<boolean> {
    const rows: { used: boolean }[] = await source.$queryRaw<{ used: boolean }[]>`
        SELECT EXISTS (SELECT 1 FROM "content_items" WHERE "mainImageId" = ${fileId}::uuid)
            OR EXISTS (SELECT 1 FROM "content_item_images" WHERE "mediaFileId" = ${fileId}::uuid)
            OR EXISTS (
                SELECT 1 FROM "content_items" AS item
                JOIN "media_files" AS file ON file."id" = ${fileId}::uuid
                WHERE strpos(item."contentBody", file."key") > 0
            ) AS "used"`;

    return rows.length > 0 && rows[0].used;
}
