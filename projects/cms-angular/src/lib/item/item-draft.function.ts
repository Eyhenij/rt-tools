import type { IContentItemConnection, IContentItemImage, IEditedContentItem, ITagNode } from './cms-item.model';
import { EWebPageField, type IContentTypeSettings } from './content-type-settings.function';

/** Whether the form is valid: the name and the address always, the other page fields when the type requires them. */
export function isItemDraftValid(draft: IEditedContentItem, settings: IContentTypeSettings.Form): boolean {
    if (draft.name.trim() === '' || draft.page.slug.trim() === '') {
        return false;
    }
    if (!settings.webPage) {
        return true;
    }
    const required: EWebPageField[] = Object.values(EWebPageField).filter((field: EWebPageField) => settings.fields[field].required);
    return required.every((field: EWebPageField) => draft.page[field].trim() !== '');
}

/**
 * Images picked in the media library go to the end, and those already there are not repeated. The
 * first image of a page without a main one becomes the main one.
 */
export function withAddedImages(draft: IEditedContentItem, added: readonly IContentItemImage[]): IEditedContentItem {
    const known: Set<string> = new Set<string>(draft.images.map((image: IContentItemImage) => image.fileId));
    const fresh: IContentItemImage[] = added.filter((image: IContentItemImage) => {
        if (known.has(image.fileId)) {
            return false;
        }
        known.add(image.fileId);
        return true;
    });
    const images: IContentItemImage[] = [...draft.images, ...fresh];
    const mainImageId: string = draft.mainImageId === '' ? (images[0]?.fileId ?? '') : draft.mainImageId;
    return { ...draft, images, mainImageId };
}

/** The main image cannot be removed: another one is marked main first. */
export function withoutImage(draft: IEditedContentItem, fileId: string): IEditedContentItem {
    if (fileId === draft.mainImageId) {
        return draft;
    }
    return { ...draft, images: draft.images.filter((image: IContentItemImage) => image.fileId !== fileId) };
}

export function withImageMoved(draft: IEditedContentItem, from: number, to: number): IEditedContentItem {
    if (from < 0 || from >= draft.images.length) {
        return draft;
    }
    const images: IContentItemImage[] = [...draft.images];
    const moved: IContentItemImage[] = images.splice(from, 1);
    images.splice(to, 0, ...moved);
    return { ...draft, images };
}

export function withImageText(
    draft: IEditedContentItem,
    fileId: string,
    change: Partial<Pick<IContentItemImage, 'caption' | 'altText'>>
): IEditedContentItem {
    return {
        ...draft,
        images: draft.images.map((image: IContentItemImage) => (image.fileId === fileId ? { ...image, ...change } : image)),
    };
}

/** A connection to a page is set once; a connection to the page itself is not set. */
export function withConnection(draft: IEditedContentItem, connection: IContentItemConnection, selfId: string): IEditedContentItem {
    const taken: boolean = draft.connections.some((item: IContentItemConnection) => item.itemId === connection.itemId);
    return taken || connection.itemId === selfId ? draft : { ...draft, connections: [...draft.connections, connection] };
}

export function withoutConnection(draft: IEditedContentItem, itemId: string): IEditedContentItem {
    return { ...draft, connections: draft.connections.filter((item: IContentItemConnection) => item.itemId !== itemId) };
}

/** A tag is ticked or unticked; the order of ticked ones is the order of ticking. */
export function withTagPicked(draft: IEditedContentItem, tagId: string, picked: boolean): IEditedContentItem {
    const rest: string[] = draft.tagIds.filter((id: string) => id !== tagId);
    return { ...draft, tagIds: picked ? [...rest, tagId] : rest };
}

/**
 * The tag tree the page form offers. An empty allowed list means all tags; otherwise the allowed
 * ones stay with the tags above them, so an allowed nested tag has a place to be shown.
 */
export function allowedTagsOf(tags: readonly ITagNode[], allowedIds: readonly string[]): ITagNode[] {
    if (allowedIds.length === 0) {
        return [...tags];
    }
    const allowed: Set<string> = new Set<string>(allowedIds);
    const pruned: (nodes: readonly ITagNode[]) => ITagNode[] = (nodes: readonly ITagNode[]): ITagNode[] =>
        nodes.flatMap((node: ITagNode) => {
            const children: ITagNode[] = pruned(node.children);
            return allowed.has(node.id) || children.length > 0 ? [{ ...node, children }] : [];
        });
    return pruned(tags);
}

function padded(value: number): string {
    return value.toString().padStart(2, '0');
}

/** The value of a date and time field: local time without a zone, as the field writes it. */
export function localInputOf(date: Date | null): string {
    if (date === null) {
        return '';
    }
    const day: string = `${date.getFullYear().toString()}-${padded(date.getMonth() + 1)}-${padded(date.getDate())}`;
    return `${day}T${padded(date.getHours())}:${padded(date.getMinutes())}`;
}

/** The way back: an empty or unreadable value means "no date". */
export function dateOfLocalInput(value: string | null): Date | null {
    if (value === null || value === '') {
        return null;
    }
    const date: Date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}
