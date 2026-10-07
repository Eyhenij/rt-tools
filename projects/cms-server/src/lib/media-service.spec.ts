import { create } from '@bufbuild/protobuf';
import { Code, type HandlerContext, type ServiceImpl } from '@connectrpc/connect';
import { type CmsMediaService, DeleteFileRequestSchema, ListFilesRequestSchema, UploadFileRequestSchema } from '@rt-tools/cms-contract';

import { MEDIA_MAX_BYTES } from './image-sniff.function';
import { cmsMediaServiceImpl } from './media-service';
import { callerOf, contextOf, refusalOf } from './testing/memory-sources';
import { type IMediaDouble, mediaDouble, pngOf } from './testing/media-doubles';

type TMediaServiceImpl = ServiceImpl<typeof CmsMediaService>;

const ME: HandlerContext = contextOf(callerOf('u1'));

describe('the media library service', () => {
    it('SC-CMS-38 — the list gives every file without a folder, the root for an empty one, with addresses and copies', async () => {
        const double: IMediaDouble = mediaDouble();
        const service: TMediaServiceImpl = cmsMediaServiceImpl(double);

        expect(await service.listFiles(create(ListFilesRequestSchema, { search: ' pine ' }), ME)).toMatchObject({
            total: 1,
            files: [{ url: 'https://cdn.example/media/f1.png', copies: [{ width: 480 }, { width: 960 }] }],
        });
        await service.listFiles(create(ListFilesRequestSchema, { folderId: ' ' }), ME);
        await service.listFiles(create(ListFilesRequestSchema, { folderId: 'd1' }), ME);
        expect(double.pages).toEqual([undefined, null, 'd1']);
        await expect(refusalOf(service.listFiles(create(ListFilesRequestSchema), contextOf(null)))).resolves.toBe(Code.Unauthenticated);
    });

    it('SC-CMS-36 — an upload puts the file and its copies before the record, named by the caller', async () => {
        const double: IMediaDouble = mediaDouble();

        expect(
            await cmsMediaServiceImpl(double).uploadFile(create(UploadFileRequestSchema, { content: pngOf(1000, 500), folderId: 'd1' }), ME)
        ).toMatchObject({ file: { id: 'f9', name: 'f9.png', width: 1000, copies: [{ width: 480 }, { width: 960 }] } });
        expect([...double.bucket.objects.keys()]).toEqual(['media/f9.png', 'media/f9-480.webp', 'media/f9-960.webp']);
        expect(double.files[1]).toMatchObject({ folderId: 'd1', uploadedById: 'u1', copyWidths: [480, 960] });
        await cmsMediaServiceImpl(double).uploadFile(create(UploadFileRequestSchema, { content: pngOf(10, 10), name: ' cover.png ' }), ME);
        expect(double.files[2]).toMatchObject({ name: 'cover.png', folderId: null });
    });

    it('SC-CMS-36 — a non-picture, an empty or oversized file, a missing store, a gone folder and a damaged picture are refused before the store', async () => {
        const double: IMediaDouble = mediaDouble();
        const service: TMediaServiceImpl = cmsMediaServiceImpl(double);
        const unset: TMediaServiceImpl = cmsMediaServiceImpl({ ...double, bucket: null });
        const damaged: TMediaServiceImpl = cmsMediaServiceImpl({
            ...double,
            resizer: { copy: () => Promise.reject(new Error('corrupt')) },
        });

        await expect(
            refusalOf(service.uploadFile(create(UploadFileRequestSchema, { content: Uint8Array.from([1, 2, 3]) }), ME))
        ).resolves.toBe(Code.InvalidArgument);
        await expect(refusalOf(service.uploadFile(create(UploadFileRequestSchema), ME))).resolves.toBe(Code.InvalidArgument);
        await expect(
            refusalOf(service.uploadFile(create(UploadFileRequestSchema, { content: new Uint8Array(MEDIA_MAX_BYTES + 1) }), ME))
        ).resolves.toBe(Code.InvalidArgument);
        await expect(refusalOf(unset.uploadFile(create(UploadFileRequestSchema, { content: pngOf(10, 10) }), ME))).resolves.toBe(
            Code.FailedPrecondition
        );
        await expect(
            refusalOf(service.uploadFile(create(UploadFileRequestSchema, { content: pngOf(10, 10), folderId: 'gone' }), ME))
        ).resolves.toBe(Code.NotFound);
        await expect(refusalOf(damaged.uploadFile(create(UploadFileRequestSchema, { content: pngOf(1000, 10) }), ME))).resolves.toBe(
            Code.InvalidArgument
        );
        expect(double.bucket.objects.size).toBe(0);
    });

    it('SC-CMS-36 — when the record fails, the file and its copies are removed from the store', async () => {
        const double: IMediaDouble = mediaDouble();
        double.failCreate = true;

        await expect(
            cmsMediaServiceImpl(double).uploadFile(create(UploadFileRequestSchema, { content: pngOf(1000, 500) }), ME)
        ).rejects.toThrow('storage is down');
        expect(double.bucket.objects.size).toBe(0);
    });

    it('SC-CMS-37 — a removal takes the file and its copies out of the store before the record; a used or missing file is refused', async () => {
        const double: IMediaDouble = mediaDouble();
        const service: TMediaServiceImpl = cmsMediaServiceImpl(double);
        await double.bucket.put('media/f1.png', Uint8Array.from([1]), 'image/png');
        await double.bucket.put('media/f1-480.webp', Uint8Array.from([1]), 'image/webp');

        double.used = true;
        await expect(refusalOf(service.deleteFile(create(DeleteFileRequestSchema, { fileId: 'f1' }), ME))).resolves.toBe(
            Code.FailedPrecondition
        );
        await expect(
            refusalOf(
                cmsMediaServiceImpl({ ...double, used: false, bucket: null }).deleteFile(
                    create(DeleteFileRequestSchema, { fileId: 'f1' }),
                    ME
                )
            )
        ).resolves.toBe(Code.FailedPrecondition);
        double.used = false;
        await service.deleteFile(create(DeleteFileRequestSchema, { fileId: 'f1' }), ME);
        expect(double.bucket.objects.size).toBe(0);
        expect(double.files).toEqual([]);
        await expect(refusalOf(service.deleteFile(create(DeleteFileRequestSchema, { fileId: 'f1' }), ME))).resolves.toBe(Code.NotFound);
    });
});
