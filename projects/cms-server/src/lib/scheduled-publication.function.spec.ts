import { IScheduledPublicationSources, runScheduledPublication } from './scheduled-publication.function.js';

const NOW: Date = new Date('2026-10-07T10:00:00Z');

type TRecordedSources = IScheduledPublicationSources & { log: string[] };

function sourcesOf(publishDue: (now: Date) => Promise<number>): TRecordedSources {
    const log: string[] = [];
    return {
        log,
        now: (): Date => NOW,
        publishDue,
        onPublished: (count: number): void => {
            log.push(`published ${String(count)}`);
        },
        onFailed: (reason: string): void => {
            log.push(`failed ${reason}`);
        },
    };
}

describe('the scheduled publication', () => {
    it('SC-CMS-16 — the pass publishes the due drafts at the current moment and reports how many', async () => {
        const seen: Date[] = [];
        const sources: TRecordedSources = sourcesOf(async (now: Date): Promise<number> => {
            seen.push(now);
            return 2;
        });

        await expect(runScheduledPublication(sources)).resolves.toBe(2);
        expect(seen).toEqual([NOW]);
        expect(sources.log).toEqual(['published 2']);
    });

    it('SC-CMS-16 — a pass with nothing due reports nothing', async () => {
        const sources: TRecordedSources = sourcesOf(async (): Promise<number> => 0);

        await expect(runScheduledPublication(sources)).resolves.toBe(0);
        expect(sources.log).toEqual([]);
    });

    it('SC-CMS-16 — a storage failure is reported, not thrown', async () => {
        const failing: TRecordedSources = sourcesOf(async (): Promise<number> => {
            throw new Error('storage is down');
        });
        const rejecting: TRecordedSources = sourcesOf(() => Promise.reject('timeout'));

        await expect(runScheduledPublication(failing)).resolves.toBe(0);
        await expect(runScheduledPublication(rejecting)).resolves.toBe(0);
        expect(failing.log).toEqual(['failed storage is down']);
        expect(rejecting.log).toEqual(['failed timeout']);
    });
});
