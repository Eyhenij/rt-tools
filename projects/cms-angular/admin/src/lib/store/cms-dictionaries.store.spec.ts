import { TestBed } from '@angular/core/testing';

import { firstValueFrom } from 'rxjs';

import { create } from '@bufbuild/protobuf';
import { Code } from '@connectrpc/connect';
import {
    ContentTypeSchema,
    DeleteTagRequest,
    ERedirectType,
    ListRedirectsRequest,
    RedirectSchema,
    RedirectType,
    SaveRedirectRequest,
    SaveTagRequest,
    TagSchema,
    UpdateContentTypeRequest,
} from '@rt-tools/cms-contract';
import { CMS_LABELS_EN, IRedirectListRow } from '@rt-tools/cms-angular';

import { cmsTestBed, ICmsTestBed, refusal, settled } from '../testing/cms-server.function';
import { ContentTypeSettingsStore } from './content-type-settings.store';
import { ContentTypesStore } from './content-types.store';
import { redirectRefusalOf, RedirectsStore } from './redirects.store';
import { TagsStore } from './tags.store';

const BLOG: ReturnType<typeof create<typeof ContentTypeSchema>> = create(ContentTypeSchema, { id: 'blog', name: 'Blog', settings: '{}' });

function messagesOf(bed: ICmsTestBed): string[] {
    return bed.notices.map((notice: { payload: { message: string } }) => notice.payload.message);
}

function failing(code: Code): () => never {
    return (): never => {
        throw refusal(code);
    };
}

describe('the content types', () => {
    it('SC-CMS-63 — the types load, and saved settings replace the type in the list', async () => {
        const saved: UpdateContentTypeRequest[] = [];
        const bed: ICmsTestBed = cmsTestBed(
            {
                listContentTypes: () => ({ contentTypes: [BLOG, create(ContentTypeSchema, { id: 'news', name: 'News' })] }),
                getContentType: () => ({ contentType: BLOG }),
                updateContentType: (request: UpdateContentTypeRequest) => {
                    saved.push(request);
                    return { contentType: create(ContentTypeSchema, { ...BLOG, name: request.name }) };
                },
            },
            [ContentTypeSettingsStore]
        );
        const types: ContentTypesStore = TestBed.inject(ContentTypesStore);
        const settings: ContentTypeSettingsStore = TestBed.inject(ContentTypeSettingsStore);
        types.load();
        settings.open('blog');
        await settled();
        expect(settings.type()?.name).toBe('Blog');
        expect(types.loaded()).toBe(true);

        settings.save({ id: 'blog', name: 'Journal', description: '', settings: '{}' });
        await settled();

        expect(saved[0]).toMatchObject({ contentTypeId: 'blog', name: 'Journal' });
        expect(types.types().map((type: { name: string }) => type.name)).toEqual(['Journal', 'News']);
        expect(settings.saving()).toBe(false);
        expect(settings.loading()).toBe(false);
        expect(types.loading()).toBe(false);
        expect(messagesOf(bed)).toEqual([CMS_LABELS_EN.typeSaved]);
    });

    it('SC-CMS-60 — refused types, settings and a save say what failed', async () => {
        const bed: ICmsTestBed = cmsTestBed(
            {
                listContentTypes: failing(Code.Internal),
                getContentType: failing(Code.Internal),
                updateContentType: failing(Code.PermissionDenied),
            },
            [ContentTypeSettingsStore]
        );
        const types: ContentTypesStore = TestBed.inject(ContentTypesStore);
        const settings: ContentTypeSettingsStore = TestBed.inject(ContentTypeSettingsStore);

        types.load();
        settings.open('blog');
        settings.save({ id: 'blog', name: 'Blog', description: '', settings: '{}' });
        await settled();

        expect(types.types()).toEqual([]);
        expect(settings.type()).toBeNull();
        expect(messagesOf(bed)).toEqual([CMS_LABELS_EN.typesLoadFailed, CMS_LABELS_EN.typeLoadFailed, CMS_LABELS_EN.errorNoRight]);
    });
});

describe('the tags', () => {
    it('SC-CMS-63 — a saved or deleted tag reads the tree again', async () => {
        const saves: SaveTagRequest[] = [];
        const deletions: DeleteTagRequest[] = [];
        let reads: number = 0;
        cmsTestBed({
            listTags: () => {
                reads += 1;
                return { tags: [create(TagSchema, { id: 'wood', name: 'Wood' })] };
            },
            saveTag: (request: SaveTagRequest) => {
                saves.push(request);
                return {};
            },
            deleteTag: (request: DeleteTagRequest) => {
                deletions.push(request);
                return {};
            },
        });
        const tags: TagsStore = TestBed.inject(TagsStore);

        tags.load();
        await settled();
        tags.save({ id: '', name: '  Pine ', parentId: 'wood' });
        await settled();
        tags.remove(tags.tags()[0]);
        await settled();

        expect(saves[0]).toMatchObject({ id: '', name: 'Pine', parentTagId: 'wood', isEnabled: true });
        expect(deletions[0].tagId).toBe('wood');
        expect(reads).toBe(3);
        expect(tags.loaded()).toBe(true);
        expect(tags.loading()).toBe(false);
    });

    it('SC-CMS-60 — refused tags say what failed and leave the tree as it was', async () => {
        const bed: ICmsTestBed = cmsTestBed({
            listTags: failing(Code.Internal),
            saveTag: failing(Code.Internal),
            deleteTag: failing(Code.Internal),
        });
        const tags: TagsStore = TestBed.inject(TagsStore);

        tags.load();
        await settled();
        tags.save({ id: '', name: 'Pine', parentId: '' });
        await settled();
        tags.remove({ id: 'wood', name: 'Wood', parentId: '', children: [] });
        await settled();

        expect(tags.tags()).toEqual([]);
        expect(messagesOf(bed)).toEqual([CMS_LABELS_EN.tagsLoadFailed, CMS_LABELS_EN.tagSaveFailed, CMS_LABELS_EN.tagDeleteFailed]);
    });
});

describe('the redirects', () => {
    it('SC-CMS-63 — the redirects load by page, a save reads the list again, and a deletion removes the row', async () => {
        const asked: ListRedirectsRequest[] = [];
        const saves: SaveRedirectRequest[] = [];
        cmsTestBed({
            listRedirects: (request: ListRedirectsRequest) => {
                asked.push(request);
                return {
                    total: 1,
                    redirects: [create(RedirectSchema, { id: 'r', from: '/a', to: '/b', type: RedirectType.MOVED_PERMANENTLY })],
                };
            },
            saveRedirect: (request: SaveRedirectRequest) => {
                saves.push(request);
                return { redirect: create(RedirectSchema, { ...request, id: 'r2' }) };
            },
            deleteRedirect: () => ({}),
        });
        const redirects: RedirectsStore = TestBed.inject(RedirectsStore);

        redirects.setQuery({ pageNumber: 3, pageSize: 10, search: '/a' });
        redirects.load();
        await settled();
        const saved: IRedirectListRow = await firstValueFrom(
            redirects.save({ id: '', from: ' /c ', to: ' /d ', type: ERedirectType.Found })
        );
        await settled();
        redirects.remove(redirects.rows()[0]);
        await settled();

        expect(asked[0]).toMatchObject({ page: 3, pageSize: 10, search: '/a' });
        expect(asked).toHaveLength(2);
        expect(saves[0]).toMatchObject({ from: '/c', to: '/d', type: RedirectType.FOUND });
        expect(saved).toEqual({ id: 'r2', from: '/c', to: '/d', type: ERedirectType.Found });
        expect(redirects.rows()).toEqual([]);
        expect(redirects.total()).toBe(0);
        expect(redirects.query().pageNumber).toBe(3);
        expect(redirects.loaded()).toBe(true);
        expect(redirects.loading()).toBe(false);
    });

    it('SC-CMS-60 — refused redirects say what failed, and a taken source is named apart', async () => {
        const bed: ICmsTestBed = cmsTestBed({
            listRedirects: failing(Code.Internal),
            deleteRedirect: failing(Code.Internal),
        });
        const redirects: RedirectsStore = TestBed.inject(RedirectsStore);

        redirects.load();
        await settled();
        redirects.remove({ id: 'r', from: '/a', to: '/b', type: ERedirectType.Found });
        await settled();

        expect(messagesOf(bed)).toEqual([CMS_LABELS_EN.redirectsLoadFailed, CMS_LABELS_EN.redirectDeleteFailed]);
        expect(redirectRefusalOf(refusal(Code.AlreadyExists))).toBe('redirectTaken');
        expect(redirectRefusalOf(refusal(Code.Internal))).toBe('redirectSaveFailed');
        expect(redirectRefusalOf(new Error('offline'))).toBe('redirectSaveFailed');
    });
});
