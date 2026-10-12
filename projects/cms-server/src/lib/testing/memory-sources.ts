import { create } from '@bufbuild/protobuf';
import {
    Code,
    ConnectError,
    type ContextValues,
    createContextValues,
    createHandlerContext,
    type HandlerContext,
} from '@connectrpc/connect';
import type { ICaller } from '@rt-tools/auth-contract';
import { CONNECT_CALLER } from '@rt-tools/auth-server';
import { CmsService, EContentItemStatus, ERedirectType, type MediaFile, MediaFileSchema } from '@rt-tools/cms-contract';

import type {
    IContentItemDraft,
    IContentItemFilter,
    IContentItemPage,
    IContentItemRecord,
    IContentTypeDraft,
    IContentTypeRecord,
    IMediaFolderRecord,
    IRedirectPage,
    IRedirectRecord,
    ITagRecord,
    TMediaFolderDraft,
    TRedirectDraft,
    TTagDraft,
} from '../cms-records.model.js';
import type { ICmsSources } from '../cms-sources.model.js';
import { ITEM, NOW } from './fixtures.js';

/** A caller; the subject is the id the storage records. */
export function callerOf(subject: string): ICaller {
    return { subject, email: null, emailVerified: false, name: null, permissions: new Set() };
}

/** A handler context as the auth interceptor leaves it: with the caller, or without one. */
export function contextOf(caller: ICaller | null): HandlerContext {
    const values: ContextValues = createContextValues();
    if (caller !== null) {
        values.set(CONNECT_CALLER, caller);
    }
    return createHandlerContext({
        service: CmsService,
        method: CmsService.method.getContentItem,
        protocolName: 'connect',
        requestMethod: 'POST',
        url: 'http://localhost/rt.cms.v1.CmsService/GetContentItem',
        contextValues: values,
    });
}

/** The code of the refusal a call ends with, or none when it went through. Any other failure is thrown on. */
export async function refusalOf(call: Promise<unknown>): Promise<Code | null> {
    try {
        await call;
    } catch (error: unknown) {
        if (error instanceof ConnectError) {
            return error.code;
        }
        throw error;
    }
    return null;
}

export const TYPE: IContentTypeRecord = {
    id: 't1',
    name: 'Articles',
    description: '',
    category: 'CONTENT',
    adminSlug: 'articles',
    layoutType: 'article',
    settings: {},
    createdAt: NOW,
    updatedAt: NOW,
};

interface IMemoryState {
    items: IContentItemRecord[];
    tags: ITagRecord[];
    redirects: IRedirectRecord[];
    folders: IMediaFolderRecord[];
}

/** The storage port over plain arrays, recording every write it took. */
export interface IMemorySources extends ICmsSources {
    readonly writes: string[];
    readonly state: IMemoryState;
}

function saved<T extends { id: string }>(list: T[], record: T): T {
    const index: number = list.findIndex((existing: T) => existing.id === record.id);
    if (index < 0) {
        list.push(record);
    } else {
        list[index] = record;
    }
    return record;
}

function stateOf(): IMemoryState {
    return {
        items: [ITEM, { ...ITEM, id: 'i3', slug: 'draft', status: EContentItemStatus.Draft, lockedById: 'u2', previewToken: 'tok' }],
        tags: [{ id: 'g1', name: 'Wood', isEnabled: true, parentTagId: null }],
        redirects: [{ id: 'r1', from: '/old', to: '/new', type: ERedirectType.MovedPermanently }],
        folders: [{ id: 'd1', name: 'Covers', parentId: null }],
    };
}

export function memorySources(): IMemorySources {
    const writes: string[] = [];
    const state: IMemoryState = stateOf();
    const itemOf: ICmsSources['itemOf'] = async (id: string): Promise<IContentItemRecord | null> =>
        state.items.find((item: IContentItemRecord) => item.id === id) ?? null;
    const changed: (id: string, change: Partial<IContentItemRecord>) => IContentItemRecord = (
        id: string,
        change: Partial<IContentItemRecord>
    ): IContentItemRecord => {
        const item: IContentItemRecord = { ...(state.items.find((existing: IContentItemRecord) => existing.id === id) ?? ITEM), ...change };
        state.items = state.items.map((existing: IContentItemRecord) => (existing.id === id ? item : existing));
        return item;
    };

    const sources: IMemorySources = {
        writes,
        state,
        itemOf,
        now: (): Date => NOW,
        mediaFileOf: async (fileId: string): Promise<MediaFile | null> => (fileId === 'f1' ? create(MediaFileSchema, { id: 'f1' }) : null),

        contentTypes: async (): Promise<IContentTypeRecord[]> => [TYPE],
        contentTypeOf: async (id: string): Promise<IContentTypeRecord | null> => (id === TYPE.id ? TYPE : null),
        updateContentType: async (id: string, draft: IContentTypeDraft, callerId: string): Promise<IContentTypeRecord> => {
            writes.push(`type ${id} by ${callerId}`);
            return { ...TYPE, ...draft };
        },

        itemPageOf: async (filter: IContentItemFilter, skip: number, take: number): Promise<IContentItemPage> => {
            writes.push(`page ${JSON.stringify(filter)} ${String(skip)}/${String(take)}`);
            return { items: state.items, total: state.items.length };
        },
        slugTaken: async (slug: string, locale: string, exceptId: string | null): Promise<boolean> =>
            state.items.some((item: IContentItemRecord) => item.slug === slug && item.locale === locale && item.id !== exceptId),
        createItem: async (contentTypeId: string, draft: IContentItemDraft, callerId: string): Promise<IContentItemRecord> => {
            writes.push(`create ${draft.slug} by ${callerId}`);
            return saved(state.items, { ...ITEM, ...draft, id: 'new', contentTypeId, tags: [], connections: [], images: [] });
        },
        updateItem: async (id: string, draft: IContentItemDraft, callerId: string): Promise<IContentItemRecord> => {
            writes.push(`update ${id} by ${callerId}`);
            return changed(id, { ...draft, tags: [], connections: [], images: [] });
        },
        deleteItem: async (id: string): Promise<void> => {
            writes.push(`delete ${id}`);
        },
        setFeatured: async (id: string, isFeatured: boolean): Promise<IContentItemRecord> => changed(id, { isFeatured }),
        lockItem: async (id: string, callerId: string, at: Date): Promise<IContentItemRecord> => {
            writes.push(`lock ${id} by ${callerId}`);
            return changed(id, { lockedById: callerId, lockedAt: at });
        },
        unlockItem: async (id: string): Promise<IContentItemRecord> => {
            writes.push(`unlock ${id}`);
            return changed(id, { lockedById: null, lockedAt: null });
        },

        itemBySlugOf: async (slug: string, locale: string): Promise<IContentItemRecord | null> =>
            state.items.find((item: IContentItemRecord) => item.slug === slug && item.locale === locale) ?? null,
        publishedItemsOf: async (): Promise<IContentItemRecord[]> =>
            state.items.filter((item: IContentItemRecord) => item.status === EContentItemStatus.Published),
        publishedLocalesOf: async (): Promise<string[]> => ['en', 'de'],

        tags: async (): Promise<ITagRecord[]> => state.tags,
        tagOf: async (id: string): Promise<ITagRecord | null> => state.tags.find((tag: ITagRecord) => tag.id === id) ?? null,
        saveTag: async (id: string | null, draft: TTagDraft): Promise<ITagRecord> => saved(state.tags, { ...draft, id: id ?? 'g-new' }),
        deleteTag: async (id: string): Promise<void> => {
            writes.push(`delete tag ${id}`);
        },

        redirectPageOf: async (skip: number, take: number, search: string | null): Promise<IRedirectPage> => {
            writes.push(`redirects ${String(skip)}/${String(take)} ${String(search)}`);
            return { redirects: state.redirects, total: state.redirects.length };
        },
        allRedirects: async (): Promise<IRedirectRecord[]> => state.redirects,
        redirectOf: async (id: string): Promise<IRedirectRecord | null> =>
            state.redirects.find((redirect: IRedirectRecord) => redirect.id === id) ?? null,
        redirectFromTaken: async (from: string, exceptId: string | null): Promise<boolean> =>
            state.redirects.some((redirect: IRedirectRecord) => redirect.from === from && redirect.id !== exceptId),
        saveRedirect: async (id: string | null, draft: TRedirectDraft, callerId: string): Promise<IRedirectRecord> => {
            writes.push(`redirect by ${callerId}`);
            return saved(state.redirects, { ...draft, id: id ?? 'r-new' });
        },
        deleteRedirect: async (id: string): Promise<void> => {
            writes.push(`delete redirect ${id}`);
        },

        folders: async (): Promise<IMediaFolderRecord[]> => state.folders,
        folderOf: async (id: string): Promise<IMediaFolderRecord | null> =>
            state.folders.find((folder: IMediaFolderRecord) => folder.id === id) ?? null,
        saveFolder: async (id: string | null, draft: TMediaFolderDraft): Promise<IMediaFolderRecord> =>
            saved(state.folders, { ...draft, id: id ?? 'd-new' }),
        deleteFolder: async (id: string): Promise<void> => {
            writes.push(`delete folder ${id}`);
        },
    };
    return sources;
}
