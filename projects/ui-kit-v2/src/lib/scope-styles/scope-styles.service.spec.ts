import { ApplicationInitStatus, ErrorHandler, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { IRtScopeStylesOptions, RT_SCOPE_STYLES_MARK, RtScopeStylesService, provideRtScopeStyles } from './scope-styles.service';

const HREF: string = '/assets/tokens.scope.css';

function scopeLinks(): HTMLLinkElement[] {
    return Array.from(document.head.querySelectorAll<HTMLLinkElement>(`link[${RT_SCOPE_STYLES_MARK}]`));
}

/** jsdom не загружает таблицы стилей и событий `load` и `error` не шлёт: их подаёт спека. */
function finish(link: HTMLLinkElement, event: 'load' | 'error'): void {
    link.dispatchEvent(new Event(event));
}

function configure(options: IRtScopeStylesOptions | null, platform: string = 'browser'): RtScopeStylesService {
    TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: platform }, ...(options === null ? [] : [provideRtScopeStyles(options)])],
    });

    return TestBed.inject(RtScopeStylesService);
}

describe('SC-UKV-1781 — the scope styles are loaded by the word of the application', () => {
    afterEach((): void => {
        document.head.querySelectorAll('link').forEach((link: Element): void => link.remove());
        TestBed.resetTestingModule();
    });

    it('SC-UKV-1781 — one call puts one link at the end of the head and resolves on load', async () => {
        const service: RtScopeStylesService = configure({ href: HREF });
        const done: Promise<void> = service.ensure();
        const links: HTMLLinkElement[] = scopeLinks();

        expect(links).toHaveLength(1);
        expect(links[0].getAttribute('href')).toBe(HREF);
        expect(document.head.lastElementChild).toBe(links[0]);

        finish(links[0], 'load');
        await expect(done).resolves.toBeUndefined();
    });

    it('SC-UKV-1781 — a repeated call returns the same promise and adds no second link', async () => {
        const service: RtScopeStylesService = configure({ href: HREF });
        const first: Promise<void> = service.ensure();
        const second: Promise<void> = service.ensure();

        expect(second).toBe(first);
        expect(scopeLinks()).toHaveLength(1);
        finish(scopeLinks()[0], 'load');
        await first;
    });

    it('SC-UKV-1781 — the application link to the same address counts as loaded', async () => {
        const own: HTMLLinkElement = document.createElement('link');
        own.rel = 'stylesheet';
        own.setAttribute('href', HREF);
        document.head.appendChild(own);

        await expect(configure({ href: HREF }).ensure()).resolves.toBeUndefined();
        expect(scopeLinks()).toHaveLength(0);
    });

    it('SC-UKV-1781 — without a declared address nothing is loaded', async () => {
        await expect(configure(null).ensure()).resolves.toBeUndefined();
        expect(scopeLinks()).toHaveLength(0);
    });

    it('SC-UKV-1781 — on the server nothing is loaded and nothing fails', async () => {
        await expect(configure({ href: HREF }, 'server').ensure()).resolves.toBeUndefined();
        expect(scopeLinks()).toHaveLength(0);
    });

    it('SC-UKV-1781 — a failed load removes the link, rejects, and the next call tries again', async () => {
        const service: RtScopeStylesService = configure({ href: HREF });
        const failed: Promise<void> = service.ensure();

        finish(scopeLinks()[0], 'error');
        await expect(failed).rejects.toThrow(HREF);
        expect(scopeLinks()).toHaveLength(0);

        const again: Promise<void> = service.ensure();
        expect(scopeLinks()).toHaveLength(1);
        finish(scopeLinks()[0], 'load');
        await expect(again).resolves.toBeUndefined();
    });

    it('SC-UKV-1781 — eager loads at start and the start waits for it', async () => {
        configure({ href: HREF, eager: true });
        const started: Promise<void> = TestBed.inject(ApplicationInitStatus).donePromise;

        expect(scopeLinks()).toHaveLength(1);
        finish(scopeLinks()[0], 'load');
        await expect(started).resolves.toBeUndefined();
    });

    it('SC-UKV-1781 — a failed load at an eager start does not stop the application', async () => {
        const handled: Error[] = [];
        TestBed.configureTestingModule({
            providers: [{ provide: ErrorHandler, useValue: { handleError: (error: Error): number => handled.push(error) } }],
        });
        configure({ href: HREF, eager: true });
        const started: Promise<void> = TestBed.inject(ApplicationInitStatus).donePromise;

        finish(scopeLinks()[0], 'error');
        await expect(started).resolves.toBeUndefined();
        expect(handled).toHaveLength(1);
    });
});
