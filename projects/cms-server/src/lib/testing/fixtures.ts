import { EContentItemStatus } from '@rt-tools/cms-contract';

import type { IContentItemRecord } from '../cms-records.model.js';

/** The moment every test of the package takes as now. */
export const NOW: Date = new Date('2026-10-07T10:00:00Z');

/** A published page with a main image, an image, a tag and a connection. */
export const ITEM: IContentItemRecord = {
    id: 'i1',
    contentTypeId: 't1',
    name: 'Pine stairs',
    status: EContentItemStatus.Published,
    isFeatured: true,
    toBePublishedAt: null,
    publishedAt: NOW,
    mainImageId: 'f1',
    link: '',
    locale: 'en',
    slug: 'pine-stairs',
    title: 'Pine stairs',
    description: 'About pine',
    metaTitle: '',
    metaDescription: '',
    previewToken: 'secret',
    contentBody: '[]',
    lockedById: null,
    lockedAt: null,
    createdById: 'u1',
    updatedById: null,
    createdAt: NOW,
    updatedAt: NOW,
    tags: [{ tagId: 'g1' }],
    connections: [{ toId: 'i2', to: { name: 'Oak', contentTypeId: 't1', contentType: { name: 'Articles' } } }],
    images: [{ mediaFileId: 'f2', caption: 'c', altText: 'a', orderIndex: 0, labels: ['cover'] }],
};
