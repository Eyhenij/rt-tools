import {
    emptyItemDraft,
    type IContentItemConnection,
    type IContentItemImage,
    type IEditedContentItem,
    type ITagNode,
} from './cms-item.model';
import {
    EWebPageField,
    IContentTypeSettings,
    typeSettingsOf,
    withField,
    withSection,
    EFormSection,
} from './content-type-settings.function';
import {
    allowedTagsOf,
    dateOfLocalInput,
    isItemDraftValid,
    localInputOf,
    withAddedImages,
    withConnection,
    withImageMoved,
    withImageText,
    withoutConnection,
    withoutImage,
    withTagPicked,
} from './item-draft.function';

function imageOf(fileId: string): IContentItemImage {
    const image: IContentItemImage = { fileId, url: `/media/${fileId}`, caption: '', altText: '' };
    return image;
}

const NAMED: IEditedContentItem = { ...emptyItemDraft('en'), name: 'Stair', page: { ...emptyItemDraft('en').page, slug: 'stair' } };

describe('the page draft', () => {
    it('SC-CMS-51 — the name and the address are always required, the page fields by the type settings', () => {
        expect(isItemDraftValid(emptyItemDraft('en'), typeSettingsOf(''))).toBe(false);
        expect(isItemDraftValid(NAMED, typeSettingsOf(''))).toBe(true);

        const titleRequired: IContentTypeSettings.Form = withField(typeSettingsOf(''), EWebPageField.Title, { required: true });
        expect(isItemDraftValid(NAMED, titleRequired)).toBe(false);
        expect(isItemDraftValid({ ...NAMED, page: { ...NAMED.page, title: 'Title' } }, titleRequired)).toBe(true);
        expect(isItemDraftValid(NAMED, withSection(titleRequired, EFormSection.WebPage, false))).toBe(true);
    });

    it('SC-CMS-51 — the first added image becomes the main one, and the main one cannot be removed', () => {
        const withImages: IEditedContentItem = withAddedImages(NAMED, [imageOf('a'), imageOf('b'), imageOf('a')]);
        expect(withImages.images.map((image: IContentItemImage) => image.fileId)).toEqual(['a', 'b']);
        expect(withImages.mainImageId).toBe('a');
        expect(withAddedImages(NAMED, []).mainImageId).toBe('');
        expect(withAddedImages(withImages, [imageOf('c')]).mainImageId).toBe('a');

        expect(withoutImage(withImages, 'a')).toBe(withImages);
        expect(withoutImage(withImages, 'b').images).toHaveLength(1);
        expect(withImageMoved(withImages, 1, 0).images.map((image: IContentItemImage) => image.fileId)).toEqual(['b', 'a']);
        expect(withImageMoved(withImages, 5, 0)).toBe(withImages);
        expect(withImageMoved(withImages, -1, 0)).toBe(withImages);
        expect(withImageText(withImages, 'b', { caption: 'Pine' }).images[1].caption).toBe('Pine');
        expect(withImageText(withImages, 'b', { caption: 'Pine' }).images[0].caption).toBe('');
    });

    it('SC-CMS-51 — a connection is set once and does not lead to the page itself', () => {
        const connection: IContentItemConnection = { contentTypeId: 't', itemId: 'x', typeName: 'Blog', itemName: 'Article' };
        const once: IEditedContentItem = withConnection(NAMED, connection, 'self');

        expect(withConnection(once, connection, 'self').connections).toHaveLength(1);
        expect(withConnection(NAMED, { ...connection, itemId: 'self' }, 'self').connections).toHaveLength(0);
        expect(withoutConnection(once, 'x').connections).toHaveLength(0);
    });

    it('SC-CMS-51 — the publication date goes into the field and back without loss', () => {
        const date: Date = new Date(2026, 9, 7, 9, 5);

        expect(localInputOf(date)).toBe('2026-10-07T09:05');
        expect(dateOfLocalInput(localInputOf(date))?.getTime()).toBe(date.getTime());
        expect(dateOfLocalInput('')).toBeNull();
        expect(dateOfLocalInput(null)).toBeNull();
        expect(dateOfLocalInput('not a date')).toBeNull();
        expect(localInputOf(null)).toBe('');
    });

    it('SC-CMS-51 — the form offers the allowed tags with the tags above them, and an empty list offers all', () => {
        const leaf: ITagNode = { id: 'leaf', name: 'Pine', parentId: 'wood', children: [] };
        const tree: ITagNode[] = [
            { id: 'wood', name: 'Wood', parentId: '', children: [leaf] },
            { id: 'metal', name: 'Metal', parentId: '', children: [] },
        ];

        expect(allowedTagsOf(tree, [])).toEqual(tree);
        expect(allowedTagsOf(tree, ['leaf'])).toEqual([{ ...tree[0], children: [leaf] }]);

        const picked: IEditedContentItem = withTagPicked(withTagPicked(NAMED, 'leaf', true), 'metal', true);
        expect(withTagPicked(picked, 'leaf', false).tagIds).toEqual(['metal']);
    });
});
