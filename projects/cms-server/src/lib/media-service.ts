import { create } from '@bufbuild/protobuf';
import { timestampFromDate } from '@bufbuild/protobuf/wkt';
import { Code, ConnectError, type HandlerContext, type ServiceImpl } from '@connectrpc/connect';
import type { ICaller } from '@rt-tools/auth-contract';
import {
    type CmsMediaService,
    type DeleteFileRequest,
    type ListFilesRequest,
    MediaCopySchema,
    type MediaFile,
    MediaFileSchema,
    type UploadFileRequest,
} from '@rt-tools/cms-contract';

import { type ISniffedImage, MEDIA_MAX_BYTES, sniffImage } from './image-sniff.function';
import { IListWindow, listWindow, searchTerm, signedCallerOf } from './list-window.function';
import {
    buildMediaCopies,
    type IBuiltMediaCopy,
    type IMediaBucket,
    type IMediaCopy,
    type IMediaResizer,
    MEDIA_COPY_CONTENT_TYPE,
    mediaCopies,
    mediaCopyKey,
    mediaKey,
    mediaUrl,
} from './media-copies.function';
import type { IMediaFileDraft, IMediaFilePage, IMediaFileRecord, TMediaFolderScope } from './media-store.function';

/**
 * The port of the media library service. The id of a new record comes from outside: the file key
 * is built from it before the write. The file store may be absent — a lawful state "the media
 * library is not set up": the list is read, while an upload and a removal are refused. Whether a
 * page uses a file is asked of the application: the pages table is its.
 */
export interface IMediaSources {
    readonly newId: () => string;
    readonly bucket: IMediaBucket | null;
    readonly resizer: IMediaResizer;
    readonly publicUrl: string;
    readonly filePageOf: (skip: number, take: number, search: string | null, folder: TMediaFolderScope) => Promise<IMediaFilePage>;
    readonly folderExists: (folderId: string) => Promise<boolean>;
    readonly fileOf: (fileId: string) => Promise<IMediaFileRecord | null>;
    readonly createFile: (draft: IMediaFileDraft) => Promise<IMediaFileRecord>;
    readonly deleteFile: (fileId: string) => Promise<void>;
    readonly fileInUse: (fileId: string) => Promise<boolean>;
}

/**
 * A media library record in the contract shape. The addresses of the original and the copies are
 * built here from the key, the widths and the public address of the store: moving to another CDN
 * edits no record.
 */
export function contractFileOf(record: IMediaFileRecord, publicUrl: string): MediaFile {
    return create(MediaFileSchema, {
        id: record.id,
        name: record.name,
        contentType: record.contentType,
        size: BigInt(record.size),
        width: record.width,
        height: record.height,
        url: mediaUrl(publicUrl, record.key),
        createdAt: timestampFromDate(record.createdAt),
        copies: mediaCopies(publicUrl, record.id, record.copyWidths).map((copy: IMediaCopy) => create(MediaCopySchema, copy)),
    });
}

/** A folder from the contract: an empty string is the root. */
export function folderOrRoot(folderId: string): string | null {
    return folderId.trim() === '' ? null : folderId.trim();
}

function configuredBucket(bucket: IMediaBucket | null): IMediaBucket {
    if (bucket === null) {
        throw new ConnectError('the media library file store is not set up', Code.FailedPrecondition);
    }
    return bucket;
}

/** A picture of the media library types within the limit; otherwise a refusal before the store. */
function acceptedImage(content: Uint8Array): ISniffedImage {
    const sniffed: ISniffedImage | null = content.length === 0 || content.length > MEDIA_MAX_BYTES ? null : sniffImage(content);
    if (sniffed === null) {
        throw new ConnectError('the file is not a JPEG, PNG, WebP, AVIF or GIF picture up to 10 MB', Code.InvalidArgument);
    }
    return sniffed;
}

/**
 * The copies are built before the store: a picture that passed the check by its first bytes but
 * is unreadable further is refused whole — a broken picture would break on the site as well.
 */
async function builtCopies(resizer: IMediaResizer, content: Uint8Array, sniffed: ISniffedImage): Promise<IBuiltMediaCopy[]> {
    try {
        return await buildMediaCopies(resizer, content, sniffed.contentType, sniffed.width);
    } catch {
        throw new ConnectError('the picture could not be reduced: the file is damaged', Code.InvalidArgument);
    }
}

/** The folder is checked before the store: a file put into a vanished folder would not become a record. */
async function existingFolder(sources: IMediaSources, folderId: string): Promise<string | null> {
    const folder: string | null = folderOrRoot(folderId);
    if (folder !== null && !(await sources.folderExists(folder))) {
        throw new ConnectError('the folder is gone', Code.NotFound);
    }
    return folder;
}

function foundFile(record: IMediaFileRecord | null): IMediaFileRecord {
    if (record === null) {
        throw new ConnectError('there is no file with this id', Code.NotFound);
    }
    return record;
}

/** The media library service of the CMS over its port. */
export function cmsMediaServiceImpl(sources: IMediaSources): ServiceImpl<typeof CmsMediaService> {
    const service: ServiceImpl<typeof CmsMediaService> = {
        /** A file belongs to the whole application. No folder given — every file; an empty one — the root. */
        listFiles: async (request: ListFilesRequest, context: HandlerContext) => {
            signedCallerOf(context);
            const window: IListWindow = listWindow(request.page, request.pageSize);
            const folder: TMediaFolderScope = request.folderId === undefined ? undefined : folderOrRoot(request.folderId);
            const page: IMediaFilePage = await sources.filePageOf(window.skip, window.take, searchTerm(request.search), folder);
            return { files: page.files.map((record: IMediaFileRecord) => contractFileOf(record, sources.publicUrl)), total: page.total };
        },

        /**
         * The type is recognised by the bytes and the copies are built — all before the store. The
         * file and the copies are put before the record: a record without a file would give a broken
         * picture. When the record fails, the file and the copies are removed.
         */
        uploadFile: async (request: UploadFileRequest, context: HandlerContext) => {
            const caller: ICaller = signedCallerOf(context);
            const sniffed: ISniffedImage = acceptedImage(request.content);
            const bucket: IMediaBucket = configuredBucket(sources.bucket);
            const folderId: string | null = await existingFolder(sources, request.folderId);
            const copies: IBuiltMediaCopy[] = await builtCopies(sources.resizer, request.content, sniffed);

            const id: string = sources.newId();
            const key: string = mediaKey(id, sniffed.extension);
            const keys: string[] = [key, ...copies.map((copy: IBuiltMediaCopy) => mediaCopyKey(id, copy.width))];
            await bucket.put(key, request.content, sniffed.contentType);
            for (const copy of copies) {
                await bucket.put(mediaCopyKey(id, copy.width), copy.content, MEDIA_COPY_CONTENT_TYPE);
            }

            let saved: IMediaFileRecord;
            try {
                saved = await sources.createFile({
                    id,
                    key,
                    folderId,
                    name: request.name.trim() === '' ? `${id}.${sniffed.extension}` : request.name.trim(),
                    contentType: sniffed.contentType,
                    size: request.content.length,
                    width: sniffed.width,
                    height: sniffed.height,
                    copyWidths: copies.map((copy: IBuiltMediaCopy) => copy.width),
                    uploadedById: caller.subject,
                });
            } catch (error: unknown) {
                for (const placed of keys) {
                    await bucket.remove(placed);
                }
                throw error;
            }
            return { file: contractFileOf(saved, sources.publicUrl) };
        },

        /**
         * A file a page uses is not removed: removed under a published page it is a broken picture.
         * The file and its copies leave the store before the record: a failed removal keeps the
         * record and can be repeated.
         */
        deleteFile: async (request: DeleteFileRequest, context: HandlerContext) => {
            signedCallerOf(context);
            const record: IMediaFileRecord = foundFile(await sources.fileOf(request.fileId));
            if (await sources.fileInUse(record.id)) {
                throw new ConnectError('a page refers to the file', Code.FailedPrecondition);
            }
            const bucket: IMediaBucket = configuredBucket(sources.bucket);
            await bucket.remove(record.key);
            for (const width of record.copyWidths) {
                await bucket.remove(mediaCopyKey(record.id, width));
            }
            await sources.deleteFile(record.id);
            return {};
        },
    };
    return service;
}
