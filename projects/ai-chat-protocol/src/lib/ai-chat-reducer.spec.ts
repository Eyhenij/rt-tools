import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { AI_CHAT_EVENT_TYPE, TAiChatEvent } from './ai-chat-event.model';
import { readAiChatEvent } from './ai-chat-reader';
import { AI_CHAT_INITIAL_RUN, applyAiChatEvent, createAiChatMessage, selectUnsentMessages } from './ai-chat-reducer';
import { EAiChatErrorKind, EAiChatRole, EAiChatRunResult, EAiChatRunStatus } from './ai-chat.enum';
import { IAiChatMessage, IAiChatRunState } from './ai-chat.model';

interface IRecordedStream {
    description: string;
    initialMessages: IAiChatMessage[];
    events: unknown[];
    expected: IAiChatRunState;
    expectedUnsent: string[];
}

const FIXTURES_DIR: string = join(__dirname, 'fixtures');

function readStream(file: string): IRecordedStream {
    return JSON.parse(readFileSync(join(FIXTURES_DIR, file), 'utf8')) as IRecordedStream;
}

function run(events: TAiChatEvent[], initial: IAiChatRunState = AI_CHAT_INITIAL_RUN): IAiChatRunState {
    return events.reduce(applyAiChatEvent, { ...initial, status: EAiChatRunStatus.RUNNING });
}

function replay(stream: IRecordedStream): IAiChatRunState {
    const events: TAiChatEvent[] = stream.events
        .map((raw: unknown) => readAiChatEvent(raw))
        .filter((event: TAiChatEvent | null): event is TAiChatEvent => event !== null);

    return run(events, { ...AI_CHAT_INITIAL_RUN, messages: stream.initialMessages });
}

describe('ai-chat reducer — recorded streams', () => {
    const files: string[] = readdirSync(FIXTURES_DIR).filter((file: string) => file.endsWith('.json'));

    it('SC-ACP-1 — the recorded streams cover the flows the applications meet', () => {
        expect([...files].sort()).toEqual([
            'browser-tool.json',
            'cut-stream.json',
            'interrupted-run.json',
            'plain-answer.json',
            'run-error.json',
            'server-tool.json',
        ]);
    });

    it.each(files)('SC-ACP-1 — %s gives the state the reference reducer gave', (file: string) => {
        const stream: IRecordedStream = readStream(file);
        const state: IAiChatRunState = replay(stream);

        expect(state).toEqual(stream.expected);
        expect(selectUnsentMessages(state.messages).map((message: IAiChatMessage) => message.id)).toEqual(stream.expectedUnsent);
    });

    it('SC-ACP-1 — a plain answer lands in one message and is recorded', () => {
        const state: IAiChatRunState = replay(readStream('plain-answer.json'));

        expect(state.messages).toHaveLength(2);
        expect(state.messages[1]).toMatchObject({ id: 'a1', role: EAiChatRole.ASSISTANT, content: 'Total is 84.', isStored: true });
        expect(state.result).toBe(EAiChatRunResult.SUCCEEDED);
        expect(state.status).toBe(EAiChatRunStatus.IDLE);
    });

    it('SC-ACP-2 — a server tool keeps its call, arguments and result in place', () => {
        const state: IAiChatRunState = replay(readStream('server-tool.json'));

        expect(state.messages[1].toolCalls).toEqual([{ id: 'c1', name: 'query_revenue', arguments: '{"from":"2026-01"}' }]);
        expect(state.messages[2]).toMatchObject({ id: 'tool-1', role: EAiChatRole.TOOL, toolCallId: 'c1', content: '{"rows":12}' });
        expect(state.pendingToolCallIds).toEqual([]);
    });

    it('SC-ACP-3 — a browser tool ends the run awaiting the call', () => {
        const state: IAiChatRunState = replay(readStream('browser-tool.json'));

        expect(state.result).toBe(EAiChatRunResult.AWAITING_FRONTEND_TOOLS);
        expect(state.pendingToolCallIds).toEqual(['c1']);
        expect(state.messages[1].toolCalls[0]).toMatchObject({ name: 'render_chart', arguments: '{"title":"Revenue"}' });
    });

    it('SC-ACP-4 — a failed run keeps the question unsent and names the reference', () => {
        const state: IAiChatRunState = replay(readStream('run-error.json'));

        expect(state.error).toEqual({ kind: EAiChatErrorKind.RUN_FAILED, message: 'Could not complete.', referenceId: 'ref-1' });
        expect(selectUnsentMessages(state.messages).map((message: IAiChatMessage) => message.id)).toEqual(['u1']);
        expect(state.status).toBe(EAiChatRunStatus.IDLE);
    });

    it('SC-ACP-5 — a cut run closes with the interrupted kind and the default text', () => {
        const state: IAiChatRunState = replay(readStream('interrupted-run.json'));

        expect(state.error?.kind).toBe(EAiChatErrorKind.INTERRUPTED);
        expect(state.error?.message).toBe('The assistant was interrupted. Ask again.');
        expect(state.messages[1].content).toBe('The month was ');
    });

    it('SC-ACP-5 — a stream with no closing event leaves the run running', () => {
        const state: IAiChatRunState = replay(readStream('cut-stream.json'));

        expect(state.status).toBe(EAiChatRunStatus.RUNNING);
        expect(state.error).toBeNull();
        expect(state.messages[1]).toMatchObject({ content: 'The year ', isStored: true });
    });
});

describe('ai-chat reducer — events', () => {
    it('SC-ACP-6 — shows the step until text arrives', () => {
        const stepped: IAiChatRunState = run([{ type: AI_CHAT_EVENT_TYPE.STEP_STARTED, stepName: 'Reading the briefing' }]);
        const answered: IAiChatRunState = applyAiChatEvent(stepped, {
            type: AI_CHAT_EVENT_TYPE.TEXT_MESSAGE_CONTENT,
            messageId: 'a1',
            delta: 'x',
        });
        const started: IAiChatRunState = applyAiChatEvent(stepped, { type: AI_CHAT_EVENT_TYPE.TEXT_MESSAGE_START, messageId: 'a1' });
        const finished: IAiChatRunState = applyAiChatEvent(stepped, { type: AI_CHAT_EVENT_TYPE.STEP_FINISHED });

        expect(stepped.step).toBe('Reading the briefing');
        expect(answered.step).toBeNull();
        expect(started.step).toBeNull();
        expect(finished.step).toBeNull();
    });

    it('SC-ACP-7 — only messages the server has not stored go into the next run', () => {
        const question: IAiChatMessage = createAiChatMessage('u1', EAiChatRole.USER, 'Hi', false);
        const finished: IAiChatRunState = run(
            [{ type: AI_CHAT_EVENT_TYPE.RUN_FINISHED, result: EAiChatRunResult.SUCCEEDED, pendingToolCallIds: [] }],
            {
                ...AI_CHAT_INITIAL_RUN,
                messages: [question, createAiChatMessage('a0', EAiChatRole.ASSISTANT, 'Old', true)],
            }
        );
        const next: IAiChatMessage = createAiChatMessage('u2', EAiChatRole.USER, 'More', false);

        expect(selectUnsentMessages([question])).toEqual([question]);
        expect(selectUnsentMessages([...finished.messages, next])).toEqual([next]);
        expect(finished.messages.every((message: IAiChatMessage) => message.isStored)).toBe(true);
    });

    it('SC-ACP-8 — a snapshot replaces the stored messages and keeps the unsent ones last', () => {
        const unsent: IAiChatMessage = createAiChatMessage('u9', EAiChatRole.USER, 'Typed while reconnecting', false);
        const stale: IAiChatMessage = createAiChatMessage('old', EAiChatRole.ASSISTANT, 'Stale', true);
        const state: IAiChatRunState = run(
            [
                {
                    type: AI_CHAT_EVENT_TYPE.MESSAGES_SNAPSHOT,
                    messages: [
                        { id: 'u1', role: 'user', content: 'Hi', toolCalls: [], toolCallId: null },
                        {
                            id: 'a1',
                            role: 'assistant',
                            content: '',
                            toolCalls: [{ id: 'c1', name: 'render_chart', arguments: '{}' }],
                            toolCallId: null,
                        },
                        { id: 't1', role: 'tool', content: 'ok', toolCalls: [], toolCallId: 'c1' },
                        { id: 'x1', role: 'unknown-role', content: 'dropped', toolCalls: [], toolCallId: null },
                    ],
                },
            ],
            { ...AI_CHAT_INITIAL_RUN, step: 'Waiting', messages: [stale, unsent] }
        );

        expect(state.messages.map((message: IAiChatMessage) => message.id)).toEqual(['u1', 'a1', 't1', 'u9']);
        expect(state.messages[1].toolCalls).toEqual([{ id: 'c1', name: 'render_chart', arguments: '{}' }]);
        expect(state.messages[2]).toMatchObject({ role: EAiChatRole.TOOL, toolCallId: 'c1' });
        expect(state.messages.slice(0, 3).every((message: IAiChatMessage) => message.isStored)).toBe(true);
        expect(state.messages[3].isStored).toBe(false);
        expect(state.step).toBeNull();
    });

    it('SC-ACP-1 — does not change the state it is given', () => {
        const before: IAiChatRunState = { ...AI_CHAT_INITIAL_RUN, messages: [createAiChatMessage('u1', EAiChatRole.USER, 'Hi', false)] };
        const snapshot: string = JSON.stringify(before);

        applyAiChatEvent(before, { type: AI_CHAT_EVENT_TYPE.TEXT_MESSAGE_CONTENT, messageId: 'u1', delta: '!' });
        applyAiChatEvent(before, { type: AI_CHAT_EVENT_TYPE.RUN_FINISHED, result: null, pendingToolCallIds: [] });

        expect(JSON.stringify(before)).toBe(snapshot);
    });

    it('SC-ACP-4 — restarting the run clears step, result, awaited calls and error', () => {
        const state: IAiChatRunState = run([{ type: AI_CHAT_EVENT_TYPE.RUN_STARTED, runId: 'r2' }], {
            ...AI_CHAT_INITIAL_RUN,
            runId: 'r1',
            step: 'Old',
            result: EAiChatRunResult.AWAITING_FRONTEND_TOOLS,
            pendingToolCallIds: ['c1'],
            error: { kind: EAiChatErrorKind.RUN_FAILED, message: 'x', referenceId: null },
        });

        expect(state).toMatchObject({ runId: 'r2', step: null, result: null, pendingToolCallIds: [], error: null });
    });

    it('SC-ACP-4 — a custom event sets the reference only when it carries one', () => {
        const withReference: IAiChatRunState = run([{ type: AI_CHAT_EVENT_TYPE.CUSTOM, name: 'a', value: { referenceId: 'ref-9' } }]);
        const others: TAiChatEvent[] = [
            { type: AI_CHAT_EVENT_TYPE.CUSTOM, name: 'a', value: { code: 'x' } },
            { type: AI_CHAT_EVENT_TYPE.CUSTOM, name: 'a', value: { referenceId: '' } },
            { type: AI_CHAT_EVENT_TYPE.CUSTOM, name: 'a', value: { referenceId: 5 } },
            { type: AI_CHAT_EVENT_TYPE.CUSTOM, name: 'a', value: 'text' },
            { type: AI_CHAT_EVENT_TYPE.CUSTOM, name: 'a', value: null },
        ];

        expect(withReference.referenceId).toBe('ref-9');
        expect(others.map((event: TAiChatEvent) => applyAiChatEvent(withReference, event).referenceId)).toEqual(others.map(() => 'ref-9'));
    });

    it('SC-ACP-1 — the end of text and the end of a tool call change nothing', () => {
        const before: IAiChatRunState = run([{ type: AI_CHAT_EVENT_TYPE.TEXT_MESSAGE_CONTENT, messageId: 'a1', delta: 'x' }]);

        expect(applyAiChatEvent(before, { type: AI_CHAT_EVENT_TYPE.TEXT_MESSAGE_END, messageId: 'a1' })).toBe(before);
        expect(applyAiChatEvent(before, { type: AI_CHAT_EVENT_TYPE.TOOL_CALL_END, toolCallId: 'c1' })).toBe(before);
    });

    it('SC-ACP-2 — a tool call with no parent message gets a message of its own', () => {
        const state: IAiChatRunState = run([
            { type: AI_CHAT_EVENT_TYPE.TEXT_MESSAGE_CONTENT, messageId: 'a1', delta: 'Hi' },
            { type: AI_CHAT_EVENT_TYPE.TOOL_CALL_START, toolCallId: 'c1', toolCallName: 'one', parentMessageId: null },
            { type: AI_CHAT_EVENT_TYPE.TOOL_CALL_START, toolCallId: 'c2', toolCallName: 'two', parentMessageId: 'a1' },
            { type: AI_CHAT_EVENT_TYPE.TOOL_CALL_ARGS, toolCallId: 'c2', delta: '{}' },
            { type: AI_CHAT_EVENT_TYPE.TOOL_CALL_START, toolCallId: 'c3', toolCallName: 'three', parentMessageId: 'a1' },
            { type: AI_CHAT_EVENT_TYPE.TOOL_CALL_ARGS, toolCallId: 'c3', delta: '1' },
        ]);

        expect(state.messages.map((message: IAiChatMessage) => message.id)).toEqual(['a1', 'c1']);
        expect(state.messages[0].toolCalls).toEqual([
            { id: 'c2', name: 'two', arguments: '{}' },
            { id: 'c3', name: 'three', arguments: '1' },
        ]);
        expect(state.messages[1].toolCalls).toEqual([{ id: 'c1', name: 'one', arguments: '' }]);
    });

    it('SC-ACP-7 — a message already stored stays stored when the run ends', () => {
        const state: IAiChatRunState = run([{ type: AI_CHAT_EVENT_TYPE.RUN_FINISHED, result: null, pendingToolCallIds: [] }], {
            ...AI_CHAT_INITIAL_RUN,
            messages: [createAiChatMessage('a0', EAiChatRole.ASSISTANT, 'Old', true)],
        });

        expect(state.messages[0].isStored).toBe(true);
        expect(state.result).toBeNull();
    });
});
