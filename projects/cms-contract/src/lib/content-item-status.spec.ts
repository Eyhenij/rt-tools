import {
    CONTENT_ITEM_STATUS_CONTRACT,
    EContentItemStatus,
    ERedirectType,
    contractRedirectTypeOf,
    redirectTypeOfContract,
} from './content-item-status.js';
import { ContentItemStatus, RedirectType } from './gen/rt/cms/v1/cms_pb.js';

describe('the page state and the redirect kind', () => {
    it('SC-CMS-5 — every page state has its contract value', () => {
        expect(Object.values(EContentItemStatus).map((status: EContentItemStatus) => CONTENT_ITEM_STATUS_CONTRACT[status])).toEqual([
            ContentItemStatus.DRAFT,
            ContentItemStatus.PUBLISHED,
            ContentItemStatus.ARCHIVED,
        ]);
    });

    it('SC-CMS-5 — the redirect kind goes to the contract and back, an unknown one reads as permanent', () => {
        expect(contractRedirectTypeOf(ERedirectType.Found)).toBe(RedirectType.FOUND);
        expect(contractRedirectTypeOf(ERedirectType.MovedPermanently)).toBe(RedirectType.MOVED_PERMANENTLY);
        expect(redirectTypeOfContract(RedirectType.FOUND)).toBe(ERedirectType.Found);
        expect(redirectTypeOfContract(RedirectType.UNSPECIFIED)).toBe(ERedirectType.MovedPermanently);
    });
});
