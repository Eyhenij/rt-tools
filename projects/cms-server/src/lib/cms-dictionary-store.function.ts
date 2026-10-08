import { ERedirectType } from '@rt-tools/cms-contract';

import type {
    IContentTypeDraft,
    IContentTypeRecord,
    IMediaFolderRecord,
    IRedirectPage,
    IRedirectRecord,
    ITagRecord,
    TMediaFolderDraft,
    TRedirectDraft,
    TTagDraft,
} from './cms-records.model.js';

/** A redirect row as the database client gives it: the kind is a plain string. */
export type TRedirectRow = Omit<IRedirectRecord, 'type'> & { readonly type: `${ERedirectType}` };

const REDIRECT_TYPE_OF: Readonly<Record<`${ERedirectType}`, ERedirectType>> = {
    MOVED_PERMANENTLY: ERedirectType.MovedPermanently,
    FOUND: ERedirectType.Found,
};

function redirectRecordOf(row: TRedirectRow): IRedirectRecord {
    const { type, ...fields }: TRedirectRow = row;
    return { ...fields, type: REDIRECT_TYPE_OF[type] };
}

export interface IRedirectWhere {
    OR?: ({ from: { contains: string; mode: 'insensitive' } } | { to: { contains: string; mode: 'insensitive' } })[];
    from?: string;
    NOT?: { id: string };
}

/** The delegates of a database client, declared by their shape; Prisma delegates fit them as they are. */
export interface IContentTypeDelegate {
    findMany(args: { orderBy: { name: 'asc' } }): Promise<IContentTypeRecord[]>;
    findUnique(args: { where: { id: string } | { adminSlug: string } }): Promise<IContentTypeRecord | null>;
    update(args: { where: { id: string }; data: IContentTypeDraft & { updatedById: string } }): Promise<IContentTypeRecord>;
}

export interface ITagDelegate {
    findMany(args: { orderBy: { name: 'asc' } }): Promise<ITagRecord[]>;
    findUnique(args: { where: { id: string } }): Promise<ITagRecord | null>;
    create(args: { data: TTagDraft }): Promise<ITagRecord>;
    update(args: { where: { id: string }; data: TTagDraft }): Promise<ITagRecord>;
    delete(args: { where: { id: string } }): Promise<unknown>;
}

export interface IRedirectDelegate {
    findMany(args: { where?: IRedirectWhere; orderBy: { from: 'asc' }; skip?: number; take?: number }): Promise<TRedirectRow[]>;
    count(args: { where: IRedirectWhere }): Promise<number>;
    findUnique(args: { where: { id: string } }): Promise<TRedirectRow | null>;
    findFirst(args: { where: IRedirectWhere }): Promise<TRedirectRow | null>;
    create(args: { data: TRedirectDraft & { createdById: string; updatedById: string } }): Promise<TRedirectRow>;
    update(args: { where: { id: string }; data: TRedirectDraft & { updatedById: string } }): Promise<TRedirectRow>;
    delete(args: { where: { id: string } }): Promise<unknown>;
}

export interface IMediaFolderDelegate {
    findMany(args: { orderBy: { name: 'asc' } }): Promise<IMediaFolderRecord[]>;
    findUnique(args: { where: { id: string } }): Promise<IMediaFolderRecord | null>;
    create(args: { data: TMediaFolderDraft }): Promise<IMediaFolderRecord>;
    update(args: { where: { id: string }; data: TMediaFolderDraft }): Promise<IMediaFolderRecord>;
    delete(args: { where: { id: string } }): Promise<unknown>;
}

export function contentTypesOf(types: IContentTypeDelegate): Promise<IContentTypeRecord[]> {
    return types.findMany({ orderBy: { name: 'asc' } });
}

export function contentTypeOf(types: IContentTypeDelegate, contentTypeId: string): Promise<IContentTypeRecord | null> {
    return types.findUnique({ where: { id: contentTypeId } });
}

export function updateContentType(
    types: IContentTypeDelegate,
    contentTypeId: string,
    draft: IContentTypeDraft,
    updatedById: string
): Promise<IContentTypeRecord> {
    return types.update({ where: { id: contentTypeId }, data: { ...draft, updatedById } });
}

export function tagsOf(tags: ITagDelegate): Promise<ITagRecord[]> {
    return tags.findMany({ orderBy: { name: 'asc' } });
}

/** An empty id creates a record, a filled one edits it. */
export function saveTag(tags: ITagDelegate, tagId: string | null, draft: TTagDraft): Promise<ITagRecord> {
    return tagId === null ? tags.create({ data: draft }) : tags.update({ where: { id: tagId }, data: draft });
}

/** A page of the redirects by their source; the search looks at both addresses. */
export async function redirectPageOf(
    redirects: IRedirectDelegate,
    skip: number,
    take: number,
    search: string | null
): Promise<IRedirectPage> {
    const where: IRedirectWhere =
        search === null
            ? {}
            : { OR: [{ from: { contains: search, mode: 'insensitive' } }, { to: { contains: search, mode: 'insensitive' } }] };

    const [found, total]: [TRedirectRow[], number] = await Promise.all([
        redirects.findMany({ where, skip, take, orderBy: { from: 'asc' } }),
        redirects.count({ where }),
    ]);

    return { total, redirects: found.map(redirectRecordOf) };
}

/** Every redirect — for the site server, which compares the path of every request with them. */
export async function allRedirectsOf(redirects: IRedirectDelegate): Promise<IRedirectRecord[]> {
    return (await redirects.findMany({ orderBy: { from: 'asc' } })).map(redirectRecordOf);
}

export async function redirectOf(redirects: IRedirectDelegate, redirectId: string): Promise<IRedirectRecord | null> {
    const row: TRedirectRow | null = await redirects.findUnique({ where: { id: redirectId } });
    return row === null ? null : redirectRecordOf(row);
}

/** Whether another redirect holds the source. An edited redirect does not hold its own. */
export async function redirectFromTaken(redirects: IRedirectDelegate, from: string, exceptId: string | null): Promise<boolean> {
    const where: IRedirectWhere = exceptId === null ? { from } : { from, NOT: { id: exceptId } };
    return (await redirects.findFirst({ where })) !== null;
}

export async function saveRedirect(
    redirects: IRedirectDelegate,
    redirectId: string | null,
    draft: TRedirectDraft,
    callerId: string
): Promise<IRedirectRecord> {
    const row: TRedirectRow =
        redirectId === null
            ? await redirects.create({ data: { ...draft, createdById: callerId, updatedById: callerId } })
            : await redirects.update({ where: { id: redirectId }, data: { ...draft, updatedById: callerId } });
    return redirectRecordOf(row);
}

export function mediaFoldersOf(folders: IMediaFolderDelegate): Promise<IMediaFolderRecord[]> {
    return folders.findMany({ orderBy: { name: 'asc' } });
}

export function saveMediaFolder(
    folders: IMediaFolderDelegate,
    folderId: string | null,
    draft: TMediaFolderDraft
): Promise<IMediaFolderRecord> {
    return folderId === null ? folders.create({ data: draft }) : folders.update({ where: { id: folderId }, data: draft });
}
