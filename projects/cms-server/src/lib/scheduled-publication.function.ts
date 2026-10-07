/**
 * What the scheduled publication pass takes. The server calls the pass once a minute; a storage
 * failure does not take the server down: the pass reports it and waits for the next time instead
 * of throwing it into the timer.
 */
export interface IScheduledPublicationSources {
    readonly now: () => Date;
    readonly publishDue: (now: Date) => Promise<number>;
    readonly onPublished: (count: number) => void;
    readonly onFailed: (reason: string) => void;
}

/** Drafts whose publication date has come become published; the answer is how many. */
export async function runScheduledPublication(sources: IScheduledPublicationSources): Promise<number> {
    try {
        const count: number = await sources.publishDue(sources.now());
        if (count > 0) {
            sources.onPublished(count);
        }
        return count;
    } catch (error: unknown) {
        sources.onFailed(error instanceof Error ? error.message : String(error));
        return 0;
    }
}
