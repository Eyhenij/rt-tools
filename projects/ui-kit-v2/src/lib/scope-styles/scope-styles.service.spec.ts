import { ApplicationInitStatus, ErrorHandler, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
    IRtScopeStylesOptions,
    RT_SCOPE_STYLES_MARK,
    RT_SCOPE_STYLES_TIMEOUT,
    RtScopeStylesService,
    provideRtScopeStyles,
} from './scope-styles.service';

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
        TestBed.configureTestingModule({ providers: [{ provide: ErrorHandler, useValue: { handleError: (): void => undefined } }] });
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

    it('SC-UKV-1781 — eager loads at start and the start stays pending until the file loads', async () => {
        configure({ href: HREF, eager: true });
        const started: Promise<void> = TestBed.inject(ApplicationInitStatus).donePromise;
        let settled: boolean = false;
        void started.then((): void => {
            settled = true;
        });

        expect(scopeLinks()).toHaveLength(1);
        await Promise.resolve();
        await Promise.resolve();
        expect(settled).toBe(false);

        finish(scopeLinks()[0], 'load');
        await expect(started).resolves.toBeUndefined();
        expect(settled).toBe(true);
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

    it('SC-UKV-1781 — silence past the timeout removes the link and rejects', async () => {
        jest.useFakeTimers();
        try {
            const service: RtScopeStylesService = configure({ href: HREF });
            const silent: Promise<void> = service.ensure();
            const outcome: Promise<void> = expect(silent).rejects.toThrow(HREF);

            jest.advanceTimersByTime(RT_SCOPE_STYLES_TIMEOUT);
            await outcome;
            expect(scopeLinks()).toHaveLength(0);
        } finally {
            jest.useRealTimers();
        }
    });

    it('SC-UKV-1781 — a marked link that is still loading is waited for, not trusted', async () => {
        const foreign: HTMLLinkElement = document.createElement('link');
        foreign.rel = 'stylesheet';
        foreign.href = HREF;
        foreign.setAttribute(RT_SCOPE_STYLES_MARK, '');
        document.head.appendChild(foreign);

        const waiting: Promise<void> = configure({ href: HREF }).ensure();
        let settled: boolean = false;
        void waiting.then((): void => {
            settled = true;
        });
        await Promise.resolve();
        await Promise.resolve();

        expect(settled).toBe(false);
        expect(scopeLinks()).toHaveLength(1);
        finish(foreign, 'load');
        await waiting;
        expect(settled).toBe(true);
    });

    it('SC-UKV-1781 — a relative and an absolute address of the application link are the same address', async () => {
        const own: HTMLLinkElement = document.createElement('link');
        own.rel = 'stylesheet';
        own.setAttribute('href', `${document.baseURI.replace(/\/$/, '')}${HREF}`);
        document.head.appendChild(own);

        await expect(configure({ href: HREF }).ensure()).resolves.toBeUndefined();
        expect(scopeLinks()).toHaveLength(0);
    });

    it('SC-UKV-1781 — a link removed from the page after the load is put again by the next call', async () => {
        const service: RtScopeStylesService = configure({ href: HREF });
        const first: Promise<void> = service.ensure();
        finish(scopeLinks()[0], 'load');
        await first;

        scopeLinks()[0].remove();
        const again: Promise<void> = service.ensure();

        expect(scopeLinks()).toHaveLength(1);
        finish(scopeLinks()[0], 'load');
        await expect(again).resolves.toBeUndefined();
    });

    it('SC-UKV-1781 — a call without a declared address is reported to the error handler once in the development mode', async () => {
        const handled: Error[] = [];
        TestBed.configureTestingModule({
            providers: [{ provide: ErrorHandler, useValue: { handleError: (error: Error): number => handled.push(error) } }],
        });
        const service: RtScopeStylesService = configure(null);

        await service.ensure();
        await service.ensure();

        expect(handled).toHaveLength(1);
        expect(handled[0].message).toContain('provideRtScopeStyles');
    });
});
