import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { createRouterTransport, Transport } from '@connectrpc/connect';

import { CMS_LOCALES, CMS_SITE_ADDRESS, CMS_TRANSPORT, provideCms } from './cms.tokens';
import { CMS_LABELS_EN } from './i18n/cms-labels.en';
import { CMS_LABELS } from './i18n/cms-labels.providers';

const TRANSPORT: Transport = createRouterTransport(() => undefined);

describe('the CMS client settings', () => {
    it('SC-CMS-64 — one call gives the client the transport, the site address, the languages and the labels', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            providers: [
                provideCms({
                    transport: TRANSPORT,
                    siteAddress: { baseUrl: 'https://site.example', sectionRoot: '/blog' },
                    locales: ['en', 'de'],
                    translator: signal((): string => 'Entwurf'),
                }),
            ],
        });

        expect(TestBed.inject(CMS_TRANSPORT)).toBe(TRANSPORT);
        expect(TestBed.inject(CMS_SITE_ADDRESS).sectionRoot).toBe('/blog');
        expect(TestBed.inject(CMS_LOCALES)).toEqual(['en', 'de']);
        expect(TestBed.inject(CMS_LABELS)().statusDraft).toBe('Entwurf');
    });

    it('SC-CMS-64 — without a translator the client speaks English', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            providers: [provideCms({ transport: TRANSPORT, siteAddress: { baseUrl: '', sectionRoot: '' }, locales: ['en'] })],
        });

        expect(TestBed.inject(CMS_LABELS)().statusDraft).toBe(CMS_LABELS_EN.statusDraft);
    });
});
