import { Injector, runInInjectionContext, Signal, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CMS_LABELS_EN } from './cms-labels.en';
import { TCmsLabelKey, TCmsLabelMap, TCmsTranslator } from './cms-labels.model';
import { CMS_LABELS, cmsLabel, interpolateCmsLabel, provideCmsLabels } from './cms-labels.providers';

function setup(providers: unknown[] = []): Injector {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: providers as never[] });
    return TestBed.inject(Injector);
}

describe('the CMS labels', () => {
    it('SC-CMS-55 — without settings every key gives the English default, never a blank', () => {
        const labels: TCmsLabelMap = setup().get(CMS_LABELS)();

        expect(labels).toEqual(CMS_LABELS_EN);
        expect(Object.values(labels).filter((label: string) => label === '')).toEqual([]);
    });

    it('SC-CMS-55 — the application labels win, and a key it left blank stays English', () => {
        const translator: Signal<TCmsTranslator> = signal<TCmsTranslator>((key: TCmsLabelKey): string =>
            key === 'statusDraft' ? 'Черновик' : ''
        );
        const labels: TCmsLabelMap = setup([provideCmsLabels(translator)]).get(CMS_LABELS)();

        expect(labels.statusDraft).toBe('Черновик');
        expect(labels.statusPublished).toBe(CMS_LABELS_EN.statusPublished);

        const injector: Injector = setup([provideCmsLabels(translator)]);
        const blank: Signal<string> = runInInjectionContext(injector, (): Signal<string> => cmsLabel('statusPublished'));
        expect(blank()).toBe(CMS_LABELS_EN.statusPublished);
    });

    it('SC-CMS-55 — the labels recompute when the application changes the language on the fly', () => {
        const translator: WritableSignal<TCmsTranslator> = signal<TCmsTranslator>((): string => 'Draft');
        const injector: Injector = setup([provideCmsLabels(translator)]);
        const labels: Signal<TCmsLabelMap> = injector.get(CMS_LABELS);
        const one: Signal<string> = runInInjectionContext(injector, (): Signal<string> => cmsLabel('statusDraft'));
        expect(labels().statusDraft).toBe('Draft');

        translator.set((): string => 'Черновик');

        expect(labels().statusDraft).toBe('Черновик');
        expect(one()).toBe('Черновик');
    });

    it('SC-CMS-55 — one label follows a key and parameters given as signals', () => {
        const injector: Injector = setup();
        const key: WritableSignal<TCmsLabelKey> = signal<TCmsLabelKey>('statusDraft');

        const label: Signal<string> = runInInjectionContext(injector, (): Signal<string> => cmsLabel(key, signal({ n: 1 })));
        expect(label()).toBe(CMS_LABELS_EN.statusDraft);

        key.set('statusArchived');

        expect(label()).toBe(CMS_LABELS_EN.statusArchived);
    });

    it('SC-CMS-55 — a place without a parameter stays visible', () => {
        expect(interpolateCmsLabel('Page {{page}} of {{last}}', { page: 2 })).toBe('Page 2 of {{last}}');
        expect(interpolateCmsLabel('Plain', undefined)).toBe('Plain');
    });
});
