import { EContentItemStatus } from '@rt-tools/cms-contract';

import { IWebPageFields } from './cms-item.model';
import { canSaveItem, echoedPageFields, IPreviewSource, ISaveGate, ISiteAddress, itemPreviewUrlOf } from './item-form.function';

const PAGE: IWebPageFields = {
    slug: 'stairs',
    title: 'Stair',
    description: '',
    metaTitle: 'Stair — the calculation',
    metaDescription: '',
};

const SITE: ISiteAddress = { baseUrl: 'https://site.example/', sectionRoot: '/blog' };

describe('the page form', () => {
    it('SC-CMS-52 — the description of a new page repeats the title until it is edited', () => {
        expect(echoedPageFields(PAGE, { description: false, metaDescription: false }, true)).toEqual({
            ...PAGE,
            description: 'Stair',
            metaDescription: 'Stair — the calculation',
        });

        const own: IWebPageFields = { ...PAGE, description: 'Own description', metaDescription: 'Own meta' };
        expect(echoedPageFields(own, { description: true, metaDescription: true }, true)).toEqual(own);
        expect(echoedPageFields(PAGE, { description: false, metaDescription: false }, false)).toEqual(PAGE);
    });

    it('SC-CMS-52 — saving is closed without edits, with an invalid form, under a foreign lock and during a save', () => {
        const open: ISaveGate = { dirty: true, valid: true, lockedByOther: false, saving: false };

        expect(canSaveItem(open)).toBe(true);
        expect(canSaveItem({ ...open, dirty: false })).toBe(false);
        expect(canSaveItem({ ...open, valid: false })).toBe(false);
        expect(canSaveItem({ ...open, lockedByOther: true })).toBe(false);
        expect(canSaveItem({ ...open, saving: true })).toBe(false);
    });

    it('SC-CMS-53 — the preview of a draft and an archived page carries the token, of a published one does not', () => {
        const draft: IPreviewSource = { id: 'item-1', status: EContentItemStatus.Draft, link: '', slug: 'stairs', previewToken: 'token 1' };

        expect(itemPreviewUrlOf(SITE, draft)).toBe('https://site.example/blog/stairs?previewToken=token%201');
        expect(itemPreviewUrlOf({ ...SITE, baseUrl: 'https://site.example' }, { ...draft, status: EContentItemStatus.Archived })).toBe(
            'https://site.example/blog/stairs?previewToken=token%201'
        );
        expect(itemPreviewUrlOf(SITE, { ...draft, status: EContentItemStatus.Published, link: '/en/blog/stairs' })).toBe(
            'https://site.example/en/blog/stairs'
        );
        expect(itemPreviewUrlOf(SITE, { ...draft, id: '' })).toBeNull();
    });
});
