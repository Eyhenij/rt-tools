import { createAiChatError, isRetryableBeforeStream } from './ai-chat-errors.js';
import { AI_CHAT_INITIAL_RUN, applyAiChatEvent, createAiChatMessage, selectUnsentMessages } from './ai-chat-reducer.js';
import { IAiChatToolRegistry, TAiChatContextProvider } from './ai-chat-tool-registry.js';
import { EAiChatErrorKind, EAiChatRole, EAiChatRunResult, EAiChatRunStatus } from './ai-chat.enum.js';
import { IAiChatMessage, IAiChatRequestMessage, IAiChatRunRequest, IAiChatRunState, IAiChatToolCall } from './ai-chat.model.js';
import { IAiChatRunPort } from './ai-chat.ports.js';

export interface IAiChatRunControllerOptions {
    port: IAiChatRunPort;
    /** Makes the ids of runs and of the messages the controller adds. */
    createId: () => string;
    /** Without a registry the run never waits for the browser: the result `awaitingFrontendTools` stays as the final one. */
    registry?: IAiChatToolRegistry;
    contextProviders?: TAiChatContextProvider[];
    onState?: (state: IAiChatRunState) => void;
    /** How many times a request is sent before the first event. */
    maxAttempts?: number;
    retryDelayMs?: number;
    /** How many times the browser answers within one send. */
    maxToolRounds?: number;
    wait?: (ms: number) => Promise<void>;
}

export interface IAiChatRunController {
    getState: () => IAiChatRunState;
    /** Adds the user message and runs until the assistant has nothing left to ask of the browser. */
    send: (threadId: string, content: string) => Promise<IAiChatRunState>;
    /** Stops the run that is going, if any: the stream is cut and the port is told. */
    stop: () => Promise<void>;
}

interface IActiveRun {
    threadId: string;
    runId: string;
    abort: AbortController;
}

const DEFAULT_ATTEMPTS: number = 3;
const DEFAULT_RETRY_DELAY_MS: number = 500;
const DEFAULT_TOOL_ROUNDS: number = 8;

function toRequestMessage(message: IAiChatMessage): IAiChatRequestMessage {
    const base: IAiChatRequestMessage = { id: message.id, role: message.role, content: message.content };

    return message.toolCallId ? { ...base, toolCallId: message.toolCallId } : base;
}

function readErrorKind(error: unknown): EAiChatErrorKind {
    const kind: unknown = typeof error === 'object' && error !== null ? Reflect.get(error, 'kind') : null;

    return Object.values(EAiChatErrorKind).find((known: EAiChatErrorKind) => known === kind) ?? EAiChatErrorKind.UNAVAILABLE;
}

function findPendingCalls(state: IAiChatRunState): IAiChatToolCall[] {
    return state.messages
        .flatMap((message: IAiChatMessage) => message.toolCalls)
        .filter((call: IAiChatToolCall) => state.pendingToolCallIds.includes(call.id));
}

export function createAiChatRunController(options: IAiChatRunControllerOptions): IAiChatRunController {
    const maxAttempts: number = options.maxAttempts ?? DEFAULT_ATTEMPTS;
    const maxToolRounds: number = options.maxToolRounds ?? DEFAULT_TOOL_ROUNDS;
    const wait: (ms: number) => Promise<void> =
        options.wait ?? ((ms: number): Promise<void> => new Promise<void>((resolve: () => void) => setTimeout(resolve, ms)));
    let state: IAiChatRunState = { ...AI_CHAT_INITIAL_RUN };
    let active: IActiveRun | null = null;

    function setState(next: IAiChatRunState): void {
        state = next;
        options.onState?.(next);
    }

    async function buildRequest(threadId: string, runId: string): Promise<IAiChatRunRequest> {
        const context: IAiChatRunRequest['context'] = (
            await Promise.all((options.contextProviders ?? []).map((provider: TAiChatContextProvider) => provider()))
        ).flat();

        return {
            threadId,
            runId,
            context,
            messages: selectUnsentMessages(state.messages).map(toRequestMessage),
            tools: options.registry?.definitions() ?? [],
        };
    }

    /** One streaming attempt. Returns true once an event arrived: from then on the request is never sent again. */
    async function readStream(request: IAiChatRunRequest, run: IActiveRun): Promise<boolean> {
        let received: boolean = false;

        try {
            for await (const event of options.port.run(request, { signal: run.abort.signal })) {
                received = true;
                setState(applyAiChatEvent(state, event));
            }
        } catch (error: unknown) {
            if (run.abort.signal.aborted) {
                return true;
            }

            if (received) {
                setState({
                    ...state,
                    status: EAiChatRunStatus.IDLE,
                    error: createAiChatError(EAiChatErrorKind.INTERRUPTED, null, state.referenceId),
                });

                return true;
            }

            const kind: EAiChatErrorKind = readErrorKind(error);

            setState({ ...state, error: createAiChatError(kind, null, null) });

            return !isRetryableBeforeStream(kind);
        }

        return true;
    }

    async function runOnce(threadId: string): Promise<void> {
        const run: IActiveRun = { threadId, runId: options.createId(), abort: new AbortController() };
        active = run;
        const request: IAiChatRunRequest = await buildRequest(threadId, run.runId);

        for (let attempt: number = 1; attempt <= maxAttempts; attempt++) {
            setState({ ...state, status: EAiChatRunStatus.RUNNING, error: null, result: null, pendingToolCallIds: [] });

            if (await readStream(request, run)) {
                break;
            }

            if (attempt < maxAttempts) {
                await wait(options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS);
            }
        }

        if (state.status === EAiChatRunStatus.RUNNING) {
            setState({
                ...state,
                status: EAiChatRunStatus.IDLE,
                error: run.abort.signal.aborted
                    ? null
                    : (state.error ?? createAiChatError(EAiChatErrorKind.INTERRUPTED, null, state.referenceId)),
            });
        }

        active = null;
    }

    async function answerBrowser(registry: IAiChatToolRegistry): Promise<void> {
        const answers: IAiChatMessage[] = [];

        for (const call of findPendingCalls(state)) {
            const content: string = await registry.execute(call);

            answers.push({ ...createAiChatMessage(options.createId(), EAiChatRole.TOOL, content, false), toolCallId: call.id });
        }

        setState({ ...state, messages: [...state.messages, ...answers], result: null, pendingToolCallIds: [] });
    }

    function waitsForBrowser(): boolean {
        return Boolean(options.registry) && !state.error && state.result === EAiChatRunResult.AWAITING_FRONTEND_TOOLS;
    }

    async function send(threadId: string, content: string): Promise<IAiChatRunState> {
        if (active) {
            return state;
        }

        setState({ ...state, messages: [...state.messages, createAiChatMessage(options.createId(), EAiChatRole.USER, content, false)] });
        await runOnce(threadId);

        let round: number = 0;

        while (waitsForBrowser()) {
            if (round >= maxToolRounds) {
                setState({ ...state, error: createAiChatError(EAiChatErrorKind.RUN_FAILED, null, state.referenceId) });
                break;
            }

            round += 1;
            await answerBrowser(options.registry as IAiChatToolRegistry);
            await runOnce(threadId);
        }

        return state;
    }

    async function stop(): Promise<void> {
        const run: IActiveRun | null = active;

        if (!run) {
            return;
        }

        run.abort.abort();
        await options.port.stop(run.threadId, state.runId ?? run.runId);
    }

    return { getState: (): IAiChatRunState => state, send, stop };
}
