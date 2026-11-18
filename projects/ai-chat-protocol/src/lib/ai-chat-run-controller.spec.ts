import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createAiChatRunController, IAiChatRunController } from './ai-chat-run-controller';
import { AI_CHAT_EVENT_TYPE, TAiChatEvent } from './ai-chat-event.model';
import { readAiChatEvent } from './ai-chat-reader';
import { createAiChatToolRegistry, IAiChatToolRegistry } from './ai-chat-tool-registry';
import { EAiChatErrorKind, EAiChatRole, EAiChatRunResult, EAiChatRunStatus } from './ai-chat.enum';
import { IAiChatContextItem, IAiChatRunRequest, IAiChatRunState } from './ai-chat.model';
import { IAiChatRunOptions, IAiChatRunPort } from './ai-chat.ports';

type TScript = (request: IAiChatRunRequest, options?: IAiChatRunOptions) => AsyncIterable<TAiChatEvent>;

function readFixture(file: string): TAiChatEvent[] {
    const stream: { events: unknown[] } = JSON.parse(readFileSync(join(__dirname, 'fixtures', file), 'utf8')) as { events: unknown[] };

    return stream.events
        .map((raw: unknown) => readAiChatEvent(raw))
        .filter((event: TAiChatEvent | null): event is TAiChatEvent => event !== null);
}

function replay(events: TAiChatEvent[]): TScript {
    return (): AsyncIterable<TAiChatEvent> => ({
        [Symbol.asyncIterator]: (): AsyncIterator<TAiChatEvent> => {
            let index: number = 0;

            return {
                next: (): Promise<IteratorResult<TAiChatEvent>> =>
                    Promise.resolve(index < events.length ? { value: events[index++], done: false } : { value: undefined, done: true }),
            };
        },
    });
}

function failing(error: unknown): TScript {
    return (): AsyncIterable<TAiChatEvent> => ({
        [Symbol.asyncIterator]: (): AsyncIterator<TAiChatEvent> => ({
            next: (): Promise<IteratorResult<TAiChatEvent>> => Promise.reject(error),
        }),
    });
}

function failingAfter(events: TAiChatEvent[], error: unknown): TScript {
    return (): AsyncIterable<TAiChatEvent> => ({
        [Symbol.asyncIterator]: (): AsyncIterator<TAiChatEvent> => {
            let index: number = 0;

            return {
                next: (): Promise<IteratorResult<TAiChatEvent>> =>
                    index < events.length ? Promise.resolve({ value: events[index++], done: false }) : Promise.reject(error),
            };
        },
    });
}

/** Gives the first events, then waits for the cut of the stream. */
function untilAborted(events: TAiChatEvent[], throwOnAbort: boolean): TScript {
    return (_request: IAiChatRunRequest, options?: IAiChatRunOptions): AsyncIterable<TAiChatEvent> => ({
        [Symbol.asyncIterator]: (): AsyncIterator<TAiChatEvent> => {
            let index: number = 0;

            return {
                next: async (): Promise<IteratorResult<TAiChatEvent>> => {
                    if (index < events.length) {
                        return { value: events[index++], done: false };
                    }

                    await new Promise<void>((resolve: () => void) => options?.signal?.addEventListener('abort', () => resolve()));

                    if (throwOnAbort) {
                        throw new Error('aborted');
                    }

                    return { value: undefined, done: true };
                },
            };
        },
    });
}

interface IHarness {
    port: IAiChatRunPort;
    requests: IAiChatRunRequest[];
    stop: jest.Mock;
}

/** Each call of `run` takes the next script; the last one repeats. */
function harness(scripts: TScript[]): IHarness {
    const requests: IAiChatRunRequest[] = [];
    const stop: jest.Mock = jest.fn().mockResolvedValue(undefined);
    const port: IAiChatRunPort = {
        run: (request: IAiChatRunRequest, options?: IAiChatRunOptions): AsyncIterable<TAiChatEvent> => {
            const script: TScript = scripts[Math.min(requests.length, scripts.length - 1)];

            requests.push(request);

            return script(request, options);
        },
        stop,
    };

    return { port, requests, stop };
}

function counter(): () => string {
    let next: number = 0;

    return (): string => `id-${++next}`;
}

async function tick(): Promise<void> {
    await new Promise<void>((resolve: () => void) => setTimeout(resolve, 0));
}

const BROWSER_TOOL: TAiChatEvent[] = readFixture('browser-tool.json');
const PLAIN_ANSWER: TAiChatEvent[] = readFixture('plain-answer.json');

function chartRegistry(execute: jest.Mock): IAiChatToolRegistry {
    const registry: IAiChatToolRegistry = createAiChatToolRegistry();

    registry.register({ definition: { name: 'render_chart', description: 'Draws a chart' }, execute });

    return registry;
}

describe('ai-chat run controller', () => {
    it('SC-ACP-10 — a run waits for the browser answer, then the next run starts with it', async () => {
        const execute: jest.Mock = jest.fn().mockResolvedValue('{"drawn":true}');
        const { port, requests } = harness([replay(BROWSER_TOOL), replay(PLAIN_ANSWER)]);
        const states: IAiChatRunState[] = [];
        const controller: IAiChatRunController = createAiChatRunController({
            port,
            createId: counter(),
            registry: chartRegistry(execute),
            onState: (state: IAiChatRunState) => states.push(state),
        });

        const final: IAiChatRunState = await controller.send('t1', 'Draw the revenue');

        expect(execute).toHaveBeenCalledWith({ title: 'Revenue' });
        expect(requests).toHaveLength(2);
        expect(requests[0].tools.map((tool) => tool.name)).toEqual(['render_chart']);
        expect(requests[0].messages.map((message) => message.role)).toEqual([EAiChatRole.USER]);
        expect(requests[1].messages).toEqual([{ id: 'id-3', role: EAiChatRole.TOOL, content: '{"drawn":true}', toolCallId: 'c1' }]);
        expect(final.status).toBe(EAiChatRunStatus.IDLE);
        expect(final.result).toBe(EAiChatRunResult.SUCCEEDED);
        expect(final.error).toBeNull();
        expect(controller.getState()).toBe(final);
        expect(states.length).toBeGreaterThan(4);
    });

    it('SC-ACP-11 — without a registry the answer of the browser is not awaited', async () => {
        const { port, requests } = harness([replay(BROWSER_TOOL)]);
        const controller: IAiChatRunController = createAiChatRunController({ port, createId: counter() });

        const final: IAiChatRunState = await controller.send('t1', 'Draw the revenue');

        expect(requests).toHaveLength(1);
        expect(requests[0].tools).toEqual([]);
        expect(requests[0].context).toEqual([]);
        expect(final.result).toBe(EAiChatRunResult.AWAITING_FRONTEND_TOOLS);
    });

    it('SC-ACP-12 — the context providers are read before the run', async () => {
        const first: IAiChatContextItem = { description: 'Page', value: 'orders' };
        const second: IAiChatContextItem = { description: 'User', value: 'admin' };
        const { port, requests } = harness([replay(PLAIN_ANSWER)]);
        const controller: IAiChatRunController = createAiChatRunController({
            port,
            createId: counter(),
            contextProviders: [(): IAiChatContextItem[] => [first], (): Promise<IAiChatContextItem[]> => Promise.resolve([second])],
        });

        await controller.send('t1', 'Hi');

        expect(requests[0].context).toEqual([first, second]);
    });

    it('SC-ACP-13 — the request is repeated until the first event, then the run goes on', async () => {
        const wait: jest.Mock = jest.fn().mockResolvedValue(undefined);
        const { port, requests } = harness([failing(new Error('offline')), failing({ kind: EAiChatErrorKind.BUSY }), replay(PLAIN_ANSWER)]);
        const controller: IAiChatRunController = createAiChatRunController({ port, createId: counter(), wait, retryDelayMs: 7 });

        const final: IAiChatRunState = await controller.send('t1', 'Hi');

        expect(requests).toHaveLength(3);
        expect(wait).toHaveBeenCalledTimes(2);
        expect(wait).toHaveBeenCalledWith(7);
        expect(final.error).toBeNull();
        expect(final.result).toBe(EAiChatRunResult.SUCCEEDED);
    });

    it('SC-ACP-14 — a request that never gets an event ends with the error, after the last attempt', async () => {
        const wait: jest.Mock = jest.fn().mockResolvedValue(undefined);
        const { port, requests } = harness([failing('offline')]);
        const controller: IAiChatRunController = createAiChatRunController({ port, createId: counter(), wait, maxAttempts: 2 });

        const final: IAiChatRunState = await controller.send('t1', 'Hi');

        expect(requests).toHaveLength(2);
        expect(wait).toHaveBeenCalledTimes(1);
        expect(final.status).toBe(EAiChatRunStatus.IDLE);
        expect(final.error?.kind).toBe(EAiChatErrorKind.UNAVAILABLE);
    });

    it('SC-ACP-15 — a refusal that repeating cannot cure is not repeated', async () => {
        const { port, requests } = harness([failing({ kind: EAiChatErrorKind.ACCESS_DENIED }), failing(null)]);
        const controller: IAiChatRunController = createAiChatRunController({ port, createId: counter() });

        const final: IAiChatRunState = await controller.send('t1', 'Hi');

        expect(requests).toHaveLength(1);
        expect(final.error?.kind).toBe(EAiChatErrorKind.ACCESS_DENIED);
    });

    it('SC-ACP-16 — an unknown kind of the failure counts as unavailable, with the default wait', async () => {
        const { port, requests } = harness([failing({ kind: 'strange' })]);
        const controller: IAiChatRunController = createAiChatRunController({ port, createId: counter(), maxAttempts: 2, retryDelayMs: 0 });

        const final: IAiChatRunState = await controller.send('t1', 'Hi');

        expect(requests).toHaveLength(2);
        expect(final.error?.kind).toBe(EAiChatErrorKind.UNAVAILABLE);
    });

    it('SC-ACP-17 — a stream cut after the first event is interrupted and never sent again', async () => {
        const { port, requests } = harness([failingAfter(PLAIN_ANSWER.slice(0, 2), new Error('cut'))]);
        const controller: IAiChatRunController = createAiChatRunController({ port, createId: counter() });

        const final: IAiChatRunState = await controller.send('t1', 'Hi');

        expect(requests).toHaveLength(1);
        expect(final.status).toBe(EAiChatRunStatus.IDLE);
        expect(final.error?.kind).toBe(EAiChatErrorKind.INTERRUPTED);
    });

    it('SC-ACP-18 — a stream that ends without the finish is interrupted', async () => {
        const { port } = harness([replay(PLAIN_ANSWER.slice(0, 1))]);
        const controller: IAiChatRunController = createAiChatRunController({ port, createId: counter() });

        const final: IAiChatRunState = await controller.send('t1', 'Hi');

        expect(final.status).toBe(EAiChatRunStatus.IDLE);
        expect(final.error?.kind).toBe(EAiChatErrorKind.INTERRUPTED);
    });

    it('SC-ACP-19 — stop cuts the going run and tells the port which run it was', async () => {
        const started: TAiChatEvent[] = [{ type: AI_CHAT_EVENT_TYPE.RUN_STARTED, runId: 'server-run', threadId: 't1' }];
        const { port, stop } = harness([untilAborted(started, true)]);
        const controller: IAiChatRunController = createAiChatRunController({ port, createId: counter() });

        const sending: Promise<IAiChatRunState> = controller.send('t1', 'Hi');
        await tick();
        await controller.stop();
        const final: IAiChatRunState = await sending;

        expect(stop).toHaveBeenCalledWith('t1', 'server-run');
        expect(final.status).toBe(EAiChatRunStatus.IDLE);
        expect(final.error).toBeNull();
    });

    it('SC-ACP-20 — stop before the stream started names the run the controller made, and a quiet cut is no error', async () => {
        const { port, stop } = harness([untilAborted([], false)]);
        const controller: IAiChatRunController = createAiChatRunController({ port, createId: counter() });

        const sending: Promise<IAiChatRunState> = controller.send('t1', 'Hi');
        await tick();
        await controller.stop();
        const final: IAiChatRunState = await sending;

        expect(stop).toHaveBeenCalledWith('t1', 'id-2');
        expect(final.error).toBeNull();
    });

    it('SC-ACP-21 — stop with no run going does nothing, and a second send while a run goes changes nothing', async () => {
        const { port, requests, stop } = harness([untilAborted([], false)]);
        const controller: IAiChatRunController = createAiChatRunController({ port, createId: counter() });

        await controller.stop();
        const sending: Promise<IAiChatRunState> = controller.send('t1', 'Hi');
        await tick();
        const ignored: IAiChatRunState = await controller.send('t1', 'Again');
        await controller.stop();
        await sending;

        expect(requests).toHaveLength(1);
        expect(ignored.messages).toHaveLength(1);
        expect(stop).toHaveBeenCalledTimes(1);
    });

    it('SC-ACP-22 — a run that asks the browser again and again ends with the error after the limit of rounds', async () => {
        const execute: jest.Mock = jest.fn().mockResolvedValue('{}');
        const { port, requests } = harness([replay(BROWSER_TOOL)]);
        const controller: IAiChatRunController = createAiChatRunController({
            port,
            createId: counter(),
            registry: chartRegistry(execute),
            maxToolRounds: 2,
        });

        const final: IAiChatRunState = await controller.send('t1', 'Draw');

        expect(requests).toHaveLength(3);
        expect(final.error?.kind).toBe(EAiChatErrorKind.RUN_FAILED);
    });

    it('SC-ACP-23 — a run that ends with an error does not wait for the browser', async () => {
        const failed: TAiChatEvent[] = [
            ...BROWSER_TOOL.slice(0, -1),
            { type: AI_CHAT_EVENT_TYPE.RUN_ERROR, code: null, message: 'broken' },
        ];
        const { port, requests } = harness([replay(failed)]);
        const controller: IAiChatRunController = createAiChatRunController({
            port,
            createId: counter(),
            registry: chartRegistry(jest.fn()),
        });

        const final: IAiChatRunState = await controller.send('t1', 'Draw');

        expect(requests).toHaveLength(1);
        expect(final.error?.message).toBe('broken');
    });
});
