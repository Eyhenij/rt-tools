import type { IMediaBucket, IMediaResizer } from '../media-copies.function.js';
import type { IMediaFileDraft, IMediaFilePage, IMediaFileRecord, TMediaFolderScope } from '../media-store.function.js';
import type { IMediaSources } from '../media-service.js';
import { NOW } from './fixtures.js';

/** A file store over a map of keys to types; a key may be made unreadable. */
export interface IMemoryBucket extends IMediaBucket {
    readonly objects: Map<string, string>;
    readonly unreadable: Set<string>;
}

export function memoryBucket(): IMemoryBucket {
    const objects: Map<string, string> = new Map<string, string>();
    const unreadable: Set<string> = new Set<string>();
    return {
        objects,
        unreadable,
        put: async (key: string, _body: Uint8Array, contentType: string): Promise<void> => {
            objects.set(key, contentType);
        },
        read: async (key: string): Promise<Uint8Array> => {
            if (unreadable.has(key)) {
                throw new Error('NoSuchKey');
            }
            return Uint8Array.from([1]);
        },
        remove: async (key: string): Promise<void> => {
            objects.delete(key);
        },
    };
}

/** A resizer whose copy is one byte of its width. */
export const RESIZER: IMediaResizer = {
    copy: async (_content: Uint8Array, width: number): Promise<Uint8Array> => Uint8Array.from([width % 256]),
};

export function fileOf(id: string, contentType: string, width: number, copyWidths: number[] = []): IMediaFileRecord {
    return {
        id,
        contentType,
        width,
        copyWidths,
        key: `media/${id}.png`,
        name: `${id}.png`,
        size: 1,
        height: width,
        folderId: null,
        createdAt: NOW,
    };
}

/** The media library port over a list of records, recording the pages it was asked for. */
export interface IMediaDouble extends IMediaSources {
    files: IMediaFileRecord[];
    readonly pages: TMediaFolderScope[];
    readonly bucket: IMemoryBucket;
    used: boolean;
    failCreate: boolean;
}

export function mediaDouble(): IMediaDouble {
    const double: IMediaDouble = {
        files: [fileOf('f1', 'image/png', 2000, [480, 960])],
        pages: [],
        bucket: memoryBucket(),
        used: false,
        failCreate: false,
        resizer: RESIZER,
        publicUrl: 'https://cdn.example',
        newId: (): string => 'f9',
        filePageOf: async (_skip: number, _take: number, _search: string | null, folder: TMediaFolderScope): Promise<IMediaFilePage> => {
            double.pages.push(folder);
            return { files: double.files, total: double.files.length };
        },
        folderExists: async (folderId: string): Promise<boolean> => folderId === 'd1',
        fileOf: async (fileId: string): Promise<IMediaFileRecord | null> =>
            double.files.find((file: IMediaFileRecord) => file.id === fileId) ?? null,
        createFile: async (draft: IMediaFileDraft): Promise<IMediaFileRecord> => {
            if (double.failCreate) {
                throw new Error('storage is down');
            }
            const record: IMediaFileRecord = { ...draft, createdAt: NOW };
            double.files.push(record);
            return record;
        },
        deleteFile: async (fileId: string): Promise<void> => {
            double.files = double.files.filter((file: IMediaFileRecord) => file.id !== fileId);
        },
        fileInUse: async (): Promise<boolean> => double.used,
    };
    return double;
}

/** The first bytes of a PNG of the given size: enough for the media library to recognise it. */
export function pngOf(width: number, height: number): Uint8Array {
    const view: DataView = new DataView(new ArrayBuffer(24));
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].forEach((byte: number, index: number) => view.setUint8(index, byte));
    view.setUint32(8, 13);
    view.setUint32(12, 0x49484452);
    view.setUint32(16, width);
    view.setUint32(20, height);
    return new Uint8Array(view.buffer);
}
