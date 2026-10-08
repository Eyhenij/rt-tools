import { ELinkType, IBlock } from '@rt-tools/cms-contract';

/**
 * The attributes by which a link in block HTML carries its settings. The site reads them from the
 * tag itself, and the link dialog restores the former choice by them.
 */
export enum ELinkAttribute {
    LinkType = 'linkType',
    ContentTypeId = 'contentTypeId',
    ContentItemId = 'contentItemId',
    Target = 'target',
    Rel = 'rel',
    Href = 'href',
}

const NEW_TAB: string = '_blank';
const NO_FOLLOW: string = 'nofollow';

/** An attribute value; an empty and a missing one read the same — as "not set". */
function attributeOf(anchor: HTMLElement, name: ELinkAttribute): string | null {
    const value: string | null = anchor.getAttribute(name);
    return value === null || value === '' ? null : value;
}

function relTokensOf(anchor: HTMLElement): string[] {
    return (attributeOf(anchor, ELinkAttribute.Rel) ?? '').split(/\s+/).filter(Boolean);
}

function writeLink(anchor: HTMLElement, link: IBlock.Content.Button, otherRel: string[]): void {
    anchor.setAttribute(ELinkAttribute.LinkType, link.linkType);
    anchor.setAttribute(ELinkAttribute.ContentTypeId, link.contentTypeId ?? '');
    anchor.setAttribute(ELinkAttribute.ContentItemId, link.contentItemId ?? '');
    anchor.setAttribute(ELinkAttribute.Target, link.newTab ? NEW_TAB : '');
    anchor.setAttribute(ELinkAttribute.Rel, [...otherRel, ...(link.noFollow ? [NO_FOLLOW] : [])].join(' '));
    anchor.setAttribute(ELinkAttribute.Href, link.link ?? '');
    anchor.textContent = link.label;
}

/** An empty link: no outside address, no page chosen. */
export function emptyLinkOf(label: string): IBlock.Content.Button {
    const link: IBlock.Content.Button = {
        label,
        linkType: ELinkType.Internal,
        contentTypeId: null,
        contentItemId: null,
        link: null,
        newTab: false,
        noFollow: false,
    };
    return link;
}

/** Reads the link settings from the tag: so the link dialog opens with the former choice. */
export function linkOfElement(anchor: HTMLElement): IBlock.Content.Button {
    const link: IBlock.Content.Button = {
        linkType: attributeOf(anchor, ELinkAttribute.LinkType) === ELinkType.External ? ELinkType.External : ELinkType.Internal,
        label: anchor.textContent,
        contentTypeId: attributeOf(anchor, ELinkAttribute.ContentTypeId),
        contentItemId: attributeOf(anchor, ELinkAttribute.ContentItemId),
        link: attributeOf(anchor, ELinkAttribute.Href),
        newTab: attributeOf(anchor, ELinkAttribute.Target) === NEW_TAB,
        noFollow: relTokensOf(anchor).includes(NO_FOLLOW),
    };
    return link;
}

/** Replaces the selected text with a new link. */
export function insertLink(link: IBlock.Content.Button, range: Range, documentRef: Document): HTMLAnchorElement {
    const anchor: HTMLAnchorElement = documentRef.createElement('a');
    writeLink(anchor, link, []);
    range.deleteContents();
    range.insertNode(anchor);
    return anchor;
}

/**
 * Edits an existing link. Foreign `rel` values — brought by a paste, for one — stay: only
 * `nofollow` is removed and set.
 */
export function updateLink(anchor: HTMLElement, link: IBlock.Content.Button): void {
    writeLink(
        anchor,
        link,
        relTokensOf(anchor).filter((token: string) => token !== NO_FOLLOW)
    );
}
