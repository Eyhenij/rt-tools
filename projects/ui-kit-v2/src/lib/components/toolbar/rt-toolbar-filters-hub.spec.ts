import { signal, TemplateRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { RtToolbarFiltersHub } from './rt-toolbar-filters-hub';
import { IRtToolbar } from './rt-toolbar.model';

function source(): IRtToolbar.IFiltersSource {
    return {
        template: {} as TemplateRef<IRtToolbar.IFiltersContext>,
        reset: (): void => undefined,
        apply: (): void => undefined,
        collapsed: signal(true),
        focusBar: (): void => undefined,
    };
}

describe('RtToolbarFiltersHub', (): void => {
    let hub: RtToolbarFiltersHub;

    beforeEach((): void => {
        hub = TestBed.inject(RtToolbarFiltersHub);
    });

    it('SC-UKV-1774: пока ни одна полоса не отдала отборы, отвечать некому', (): void => {
        expect(hub.current()).toBeNull();
    });

    it('SC-UKV-1774: отвечает полоса, отдавшая отборы последней', (): void => {
        const first: IRtToolbar.IFiltersSource = source();
        const second: IRtToolbar.IFiltersSource = source();

        hub.register(first);
        hub.register(second);

        expect(hub.current()).toBe(second);
    });

    it('SC-UKV-1774: снятие последней полосы возвращает ответ предыдущей', (): void => {
        const first: IRtToolbar.IFiltersSource = source();
        const second: IRtToolbar.IFiltersSource = source();

        hub.register(first);
        const release: () => void = hub.register(second);
        release();

        expect(hub.current()).toBe(first);
    });
});
