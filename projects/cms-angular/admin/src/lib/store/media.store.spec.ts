import { TestBed } from '@angular/core/testing';

import { create } from '@bufbuild/protobuf';
import { timestampFromDate } from '@bufbuild/protobuf/wkt';
import { Code } from '@connectrpc/connect';
import {
    DeleteMediaFolderRequest,
    ListFilesRequest,
    MediaFile,
    MediaFileSchema,
    MediaFolderSchema,
    SaveMediaFolderRequest,
    UploadFileRequest,
} from '@rt-tools/cms-contract';
import { CMS_LABELS_EN, IMediaFileRow } from '@rt-tools/cms-angular';

import { cmsTestBed, ICmsTestBed, pickedFile, refusal, settled } from '../testing/cms-server.function';
import { MediaFoldersStore } from './media-folders.store';
import { mediaRefusalOf, MediaStore } from './media.store';

const CREATED_AT: Date = new Date(Date.UTC(2026, 9, 7));

function fileOf(id: string): MediaFile {
    return create(MediaFileSchema, {
        id,
        name: `${id}.webp`,
        width: 800,
        height: 600,
        size: BigInt(2049),
        url: `/${id}.webp`,
        copies: [{ width: 320, url: `/${id}-320.webp` }],
        createdAt: timestampFromDate(CREATED_AT),
    });
}

function messagesOf(bed: ICmsTestBed): string[] {
    return bed.notices.map((notice: { payload: { message: string } }) => notice.payload.message);
}

function failing(code: Code): () => never {
    return (): never => {
        throw refusal(code);
    };
}

describe('the media library files', () => {
    it('SC-CMS-67 — a folder opens from the first page, and its files read with a preview and a size in kilobytes', async () => {
        const asked: ListFilesRequest[] = [];
        cmsTestBed({}, [], {
            listFiles: (request: ListFilesRequest) => {
                asked.push(request);
                return { total: 1, files: [fileOf('a'), create(MediaFileSchema, { id: 'bare', url: '/bare.webp' })] };
            },
        });
        const media: MediaStore = TestBed.inject(MediaStore);

        media.setQuery({ pageNumber: 4, pageSize: 20, search: 'oak' });
        media.openFolder('stairs');
        await settled();

        expect(asked[0]).toMatchObject({ folderId: 'stairs', page: 1, search: 'oak' });
        expect(media.rows()[0]).toEqual({
            id: 'a',
            name: 'a.webp',
            width: 800,
            height: 600,
            sizeKb: 3,
            url: '/a.webp',
            previewUrl: '/a-320.webp',
            createdAt: CREATED_AT,
        });
        expect(media.rows()[1]).toMatchObject({ previewUrl: '/bare.webp', createdAt: null });
        expect(media.folderId()).toBe('stairs');
        expect(media.query().pageNumber).toBe(1);
        expect(media.loaded()).toBe(true);
        expect(media.loading()).toBe(false);
        expect(media.total()).toBe(1);
    });

    it('SC-CMS-67 — uploaded files go first in the order picked, and a file of a folder left is not shown', async () => {
        const uploads: UploadFileRequest[] = [];
        cmsTestBed({}, [], {
            listFiles: () => ({ total: 0, files: [] }),
            uploadFile: (request: UploadFileRequest) => {
                uploads.push(request);
                return request.name === 'empty.png' ? {} : { file: fileOf(request.name.split('.')[0]) };
            },
        });
        const media: MediaStore = TestBed.inject(MediaStore);
        media.load();
        await settled();

        media.upload([pickedFile('a.png', 'x'), pickedFile('b.png', 'y'), pickedFile('empty.png', 'z')]);
        expect(media.uploading()).toBe(3);
        await settled();
        await settled();

        expect(uploads.map((request: UploadFileRequest) => request.name)).toEqual(['a.png', 'b.png', 'empty.png']);
        expect(Array.from(uploads[0].content)).toEqual([120]);
        expect(media.rows().map((row: IMediaFileRow) => row.id)).toEqual(['b', 'a']);
        expect(media.total()).toBe(2);
        expect(media.uploading()).toBe(0);

        media.upload([pickedFile('c.png', 'x')]);
        media.openFolder('elsewhere');
        await settled();
        await settled();
        expect(media.rows().map((row: IMediaFileRow) => row.id)).toEqual([]);
    });

    it('SC-CMS-67 — a deleted file leaves the list', async () => {
        cmsTestBed({}, [], { listFiles: () => ({ total: 1, files: [fileOf('a')] }), deleteFile: () => ({}) });
        const media: MediaStore = TestBed.inject(MediaStore);
        media.load();
        await settled();

        media.remove(media.rows()[0]);
        await settled();

        expect(media.rows()).toEqual([]);
        expect(media.total()).toBe(0);
    });

    it('SC-CMS-68 — a refusal names its cause by the code, and an upload refusal names the file', async () => {
        const bed: ICmsTestBed = cmsTestBed({}, [], {
            listFiles: failing(Code.PermissionDenied),
            uploadFile: failing(Code.InvalidArgument),
            deleteFile: failing(Code.FailedPrecondition),
        });
        const media: MediaStore = TestBed.inject(MediaStore);

        media.load();
        await settled();
        media.upload([pickedFile('big.tiff', 'x')]);
        await settled();
        await settled();
        media.remove({ id: 'a', name: 'a', width: 0, height: 0, sizeKb: 0, url: '', previewUrl: '', createdAt: null });
        await settled();
        // A file the browser cannot read refuses its own upload and does not stop the queue.
        media.upload([new File(['x'], 'unreadable.png')]);
        await settled();
        await settled();

        expect(messagesOf(bed)).toEqual([
            CMS_LABELS_EN.mediaNoRight,
            `big.tiff: ${CMS_LABELS_EN.mediaFileRefused}`,
            CMS_LABELS_EN.mediaFileInUse,
            `unreadable.png: ${CMS_LABELS_EN.mediaUploadFailed}`,
        ]);
        expect(media.uploading()).toBe(0);
        expect(mediaRefusalOf(refusal(Code.NotFound), 'mediaLoadFailed')).toBe('mediaFolderGone');
        expect(mediaRefusalOf(refusal(Code.Internal), 'mediaLoadFailed')).toBe('mediaLoadFailed');
        expect(mediaRefusalOf(new Error('offline'), 'mediaDeleteFailed')).toBe('mediaDeleteFailed');
    });
});

describe('the media library folders', () => {
    it('SC-CMS-67 — a saved folder reads the list again, and a deleted one is announced to the screen', async () => {
        const saves: SaveMediaFolderRequest[] = [];
        const deletions: DeleteMediaFolderRequest[] = [];
        let reads: number = 0;
        cmsTestBed({
            listMediaFolders: () => {
                reads += 1;
                return { folders: [create(MediaFolderSchema, { id: 'stairs', name: 'Stairs' })] };
            },
            saveMediaFolder: (request: SaveMediaFolderRequest) => {
                saves.push(request);
                return {};
            },
            deleteMediaFolder: (request: DeleteMediaFolderRequest) => {
                deletions.push(request);
                return {};
            },
        });
        const folders: MediaFoldersStore = TestBed.inject(MediaFoldersStore);
        const removed: string[] = [];
        folders.removed$.subscribe((id: string) => removed.push(id));

        folders.load();
        await settled();
        folders.save({ id: '', name: ' Oak ', parentId: 'stairs' });
        await settled();
        folders.remove(folders.folders()[0]);
        await settled();

        expect(saves[0]).toMatchObject({ id: '', name: 'Oak', parentId: 'stairs' });
        expect(deletions[0].folderId).toBe('stairs');
        expect(removed).toEqual(['stairs']);
        expect(reads).toBe(3);
        expect(folders.loaded()).toBe(true);
    });

    it('SC-CMS-68 — refused folders say what failed, and a missing right is named', async () => {
        const bed: ICmsTestBed = cmsTestBed({
            listMediaFolders: failing(Code.Internal),
            saveMediaFolder: failing(Code.PermissionDenied),
            deleteMediaFolder: failing(Code.Internal),
        });
        const folders: MediaFoldersStore = TestBed.inject(MediaFoldersStore);

        folders.load();
        await settled();
        folders.save({ id: '', name: 'Oak', parentId: '' });
        await settled();
        folders.remove({ id: 'stairs', name: 'Stairs', parentId: '' });
        await settled();

        expect(folders.folders()).toEqual([]);
        expect(messagesOf(bed)).toEqual([CMS_LABELS_EN.foldersLoadFailed, CMS_LABELS_EN.foldersNoRight, CMS_LABELS_EN.folderDeleteFailed]);
    });
});
