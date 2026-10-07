import { EContentItemStatus } from '@rt-tools/cms-contract';

import type {
    IContentItemDraft,
    IContentItemFilter,
    IContentItemImageRecord,
    IContentItemPage,
    IContentItemRecord,
} from './cms-records.model';

/** A page row as the database client gives it: the state is a plain string. */
export type TContentItemRow = Omit<IContentItemRecord, 'status'> & { readonly status: `${EContentItemStatus}` };

const STATUS_OF: Readonly<Record<`${EContentItemStatus}`, EContentItemStatus>> = {
    DRAFT: EContentItemStatus.Draft,
    PUBLISHED: EContentItemStatus.Published,
    ARCHIVED: EContentItemStatus.Archived,
};

function recordOf(row: TContentItemRow): IContentItemRecord {
    const { status, ...fields }: TContentItemRow = row;
    return { ...fields, status: STATUS_OF[status] };
}

function recordOrNull(row: TContentItemRow | null): IContentItemRecord | null {
    return row === null ? null : recordOf(row);
}

export interface IContentItemWhere {
    contentTypeId?: string;
    status?: EContentItemStatus;
    locale?: string;
    slug?: string;
    NOT?: { id: string };
    toBePublishedAt?: { lte: Date };
    contentType?: { adminSlug: string };
    OR?: ({ name: { contains: string; mode: 'insensitive' } } | { slug: { contains: string; mode: 'insensitive' } })[];
}

/** An image as written: the labels as a list the database client accepts. */
interface IContentItemImageWrite {
    mediaFileId: string;
    caption: string;
    altText: string;
    orderIndex: number;
    labels: string[];
}

/** The relations of a new page: there is nothing to remove, and the client refuses a removal inside a create. */
export interface IContentItemRelationsCreate {
    tags: { create: { tagId: string }[] };
    connections: { create: { toId: string }[] };
    images: { create: IContentItemImageWrite[] };
}

/** The relations of an edited page: the old ones are removed and the new ones set by one call with the fields. */
export interface IContentItemRelationsWrite {
    tags: IContentItemRelationsCreate['tags'] & { deleteMany: object };
    connections: IContentItemRelationsCreate['connections'] & { deleteMany: object };
    images: IContentItemRelationsCreate['images'] & { deleteMany: object };
}

export type TContentItemFields = Omit<IContentItemDraft, 'tagIds' | 'connectedItemIds' | 'images'>;

/** What is read with a page: the tags, the connections with names and the images in order. */
export interface IContentItemInclude {
    readonly tags: { readonly select: { readonly tagId: true } };
    readonly connections: {
        readonly select: {
            readonly toId: true;
            readonly to: {
                readonly select: {
                    readonly name: true;
                    readonly contentTypeId: true;
                    readonly contentType: { readonly select: { readonly name: true } };
                };
            };
        };
    };
    readonly images: { readonly orderBy: { readonly orderIndex: 'asc' } };
}

const ITEM_INCLUDE: IContentItemInclude = {
    tags: { select: { tagId: true } },
    connections: { select: { toId: true, to: { select: { name: true, contentTypeId: true, contentType: { select: { name: true } } } } } },
    images: { orderBy: { orderIndex: 'asc' } },
};

/**
 * The pages delegate of a database client, declared by its shape: the package does not depend on
 * the client, and a Prisma `contentItem` delegate fits it as it is.
 */
export interface IContentItemDelegate {
    findMany(args: {
        where: IContentItemWhere;
        orderBy: { updatedAt: 'desc' } | { publishedAt: 'desc' };
        skip?: number;
        take?: number;
        include: IContentItemInclude;
    }): Promise<TContentItemRow[]>;
    count(args: { where: IContentItemWhere }): Promise<number>;
    findUnique(args: { where: { id: string }; include: IContentItemInclude }): Promise<TContentItemRow | null>;
    findFirst(args: { where: IContentItemWhere; include: IContentItemInclude }): Promise<TContentItemRow | null>;
    create(args: {
        data: TContentItemFields & IContentItemRelationsCreate & { contentTypeId: string; createdById: string; updatedById: string };
        include: IContentItemInclude;
    }): Promise<TContentItemRow>;
    update(args: {
        where: { id: string };
        data: Partial<TContentItemFields & IContentItemRelationsWrite> & {
            updatedById?: string;
            lockedById?: string | null;
            lockedAt?: Date | null;
        };
        include: IContentItemInclude;
    }): Promise<TContentItemRow>;
    delete(args: { where: { id: string } }): Promise<unknown>;
}

function newRelationsOf(draft: IContentItemDraft): IContentItemRelationsCreate {
    return {
        tags: { create: draft.tagIds.map((tagId: string) => ({ tagId })) },
        connections: { create: draft.connectedItemIds.map((toId: string) => ({ toId })) },
        images: {
            create: draft.images.map((image: Omit<IContentItemImageRecord, 'orderIndex'>, orderIndex: number): IContentItemImageWrite => ({
                orderIndex,
                mediaFileId: image.mediaFileId,
                caption: image.caption,
                altText: image.altText,
                labels: [...image.labels],
            })),
        },
    };
}

function replacedRelationsOf(draft: IContentItemDraft): IContentItemRelationsWrite {
    const relations: IContentItemRelationsCreate = newRelationsOf(draft);
    return {
        tags: { ...relations.tags, deleteMany: {} },
        connections: { ...relations.connections, deleteMany: {} },
        images: { ...relations.images, deleteMany: {} },
    };
}

function fieldsOf(draft: IContentItemDraft): TContentItemFields {
    return {
        name: draft.name,
        status: draft.status,
        isFeatured: draft.isFeatured,
        toBePublishedAt: draft.toBePublishedAt,
        publishedAt: draft.publishedAt,
        mainImageId: draft.mainImageId,
        link: draft.link,
        locale: draft.locale,
        slug: draft.slug,
        title: draft.title,
        description: draft.description,
        metaTitle: draft.metaTitle,
        metaDescription: draft.metaDescription,
        contentBody: draft.contentBody,
    };
}

/** A list page, the freshly edited first. Both calls share one filter: a count by another would promise empty pages. */
export async function contentItemPageOf(
    items: IContentItemDelegate,
    filter: IContentItemFilter,
    skip: number,
    take: number
): Promise<IContentItemPage> {
    const where: IContentItemWhere = { contentTypeId: filter.contentTypeId };
    if (filter.status !== null) {
        where.status = filter.status;
    }
    if (filter.locale !== null) {
        where.locale = filter.locale;
    }
    if (filter.search !== null) {
        where.OR = [{ name: { contains: filter.search, mode: 'insensitive' } }, { slug: { contains: filter.search, mode: 'insensitive' } }];
    }

    const [found, total]: [TContentItemRow[], number] = await Promise.all([
        items.findMany({ where, skip, take, orderBy: { updatedAt: 'desc' }, include: ITEM_INCLUDE }),
        items.count({ where }),
    ]);

    return { total, items: found.map(recordOf) };
}

export async function contentItemOf(items: IContentItemDelegate, contentItemId: string): Promise<IContentItemRecord | null> {
    return recordOrNull(await items.findUnique({ where: { id: contentItemId }, include: ITEM_INCLUDE }));
}

/** Whether another page of the locale holds the address. An edited page does not hold its own. */
export async function contentSlugTaken(
    items: IContentItemDelegate,
    slug: string,
    locale: string,
    exceptId: string | null
): Promise<boolean> {
    const where: IContentItemWhere = exceptId === null ? { slug, locale } : { slug, locale, NOT: { id: exceptId } };
    return (await items.findFirst({ where, include: ITEM_INCLUDE })) !== null;
}

export async function createContentItem(
    items: IContentItemDelegate,
    contentTypeId: string,
    draft: IContentItemDraft,
    callerId: string
): Promise<IContentItemRecord> {
    const row: TContentItemRow = await items.create({
        data: { contentTypeId, ...fieldsOf(draft), ...newRelationsOf(draft), createdById: callerId, updatedById: callerId },
        include: ITEM_INCLUDE,
    });
    return recordOf(row);
}

export async function updateContentItem(
    items: IContentItemDelegate,
    contentItemId: string,
    draft: IContentItemDraft,
    callerId: string
): Promise<IContentItemRecord> {
    const row: TContentItemRow = await items.update({
        where: { id: contentItemId },
        data: { ...fieldsOf(draft), ...replacedRelationsOf(draft), updatedById: callerId },
        include: ITEM_INCLUDE,
    });
    return recordOf(row);
}

export async function setContentItemFeatured(
    items: IContentItemDelegate,
    contentItemId: string,
    isFeatured: boolean
): Promise<IContentItemRecord> {
    return recordOf(await items.update({ where: { id: contentItemId }, data: { isFeatured }, include: ITEM_INCLUDE }));
}

/** The lock and its lifting; the moment arrives as an argument, not from the machine clock. */
export async function lockContentItem(
    items: IContentItemDelegate,
    contentItemId: string,
    callerId: string,
    at: Date
): Promise<IContentItemRecord> {
    return recordOf(
        await items.update({ where: { id: contentItemId }, data: { lockedById: callerId, lockedAt: at }, include: ITEM_INCLUDE })
    );
}

export async function unlockContentItem(items: IContentItemDelegate, contentItemId: string): Promise<IContentItemRecord> {
    return recordOf(
        await items.update({ where: { id: contentItemId }, data: { lockedById: null, lockedAt: null }, include: ITEM_INCLUDE })
    );
}

export async function deleteContentItem(items: IContentItemDelegate, contentItemId: string): Promise<void> {
    await items.delete({ where: { id: contentItemId } });
}

/** Drafts whose date has come become published; the publication time is the scheduled date. */
export async function publishDueContentItems(items: IContentItemDelegate, now: Date): Promise<number> {
    const due: TContentItemRow[] = await items.findMany({
        where: { status: EContentItemStatus.Draft, toBePublishedAt: { lte: now } },
        orderBy: { updatedAt: 'desc' },
        include: ITEM_INCLUDE,
    });

    for (const item of due) {
        await items.update({
            where: { id: item.id },
            data: { status: EContentItemStatus.Published, publishedAt: item.toBePublishedAt ?? now },
            include: ITEM_INCLUDE,
        });
    }
    return due.length;
}

/** A site page by address and locale, in any state: what to show is decided by the service. */
export async function contentItemBySlugOf(items: IContentItemDelegate, slug: string, locale: string): Promise<IContentItemRecord | null> {
    return recordOrNull(await items.findFirst({ where: { slug, locale }, include: ITEM_INCLUDE }));
}

/** The published pages of a type in a site locale, the latest first. */
export async function publishedContentItemsOf(
    items: IContentItemDelegate,
    adminSlug: string,
    locale: string
): Promise<IContentItemRecord[]> {
    const rows: TContentItemRow[] = await items.findMany({
        where: { locale, contentType: { adminSlug }, status: EContentItemStatus.Published },
        orderBy: { publishedAt: 'desc' },
        include: ITEM_INCLUDE,
    });
    return rows.map(recordOf);
}

/** The locales an address is published in: the page links its translations by them. */
export async function publishedContentLocalesOf(items: IContentItemDelegate, slug: string): Promise<string[]> {
    const found: TContentItemRow[] = await items.findMany({
        where: { slug, status: EContentItemStatus.Published },
        orderBy: { publishedAt: 'desc' },
        include: ITEM_INCLUDE,
    });
    return found.map((item: TContentItemRow): string => item.locale);
}
