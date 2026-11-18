import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { AI_CHAT_EVENT_TYPE } from './ai-chat-event.model';
import { readAiChatEvent } from './ai-chat-reader';
import { EAiChatRunResult } from './ai-chat.enum';

describe('ai-chat reader', () => {
    it('SC-ACP-10 — reads every recorded event without dropping one', () => {
        const dir: string = join(__dirname, 'fixtures');

        for (const file of readdirSync(dir)) {
            const events: unknown[] = (JSON.parse(readFileSync(join(dir, file), 'utf8')) as { events: unknown[] }).events;

            expect(events.map((raw: unknown) => readAiChatEvent(raw))).not.toContain(null);
        }
    });

    it('SC-ACP-10 — reads the text and tool events', () => {
        expect(readAiChatEvent({ type: 'RUN_STARTED', runId: 'r1', threadId: 't1' })).toEqual({
            type: AI_CHAT_EVENT_TYPE.RUN_STARTED,
            runId: 'r1',
            threadId: 't1',
        });
        expect(readAiChatEvent({ type: 'RUN_STARTED', runId: 'r1' })).toEqual({ type: AI_CHAT_EVENT_TYPE.RUN_STARTED, runId: 'r1' });
        expect(readAiChatEvent({ type: 'TEXT_MESSAGE_START', messageId: 'm1' })).toEqual({
            type: AI_CHAT_EVENT_TYPE.TEXT_MESSAGE_START,
            messageId: 'm1',
        });
        expect(readAiChatEvent({ type: 'TEXT_MESSAGE_CONTENT', messageId: 'm1', delta: '' })).toEqual({
            type: AI_CHAT_EVENT_TYPE.TEXT_MESSAGE_CONTENT,
            messageId: 'm1',
            delta: '',
        });
        expect(readAiChatEvent({ type: 'TEXT_MESSAGE_END', messageId: 'm1' })).toEqual({
            type: AI_CHAT_EVENT_TYPE.TEXT_MESSAGE_END,
            messageId: 'm1',
        });
        expect(readAiChatEvent({ type: 'TOOL_CALL_START', toolCallId: 'c1', toolCallName: 'render_chart', parentMessageId: 'm1' })).toEqual(
            {
                type: AI_CHAT_EVENT_TYPE.TOOL_CALL_START,
                toolCallId: 'c1',
                toolCallName: 'render_chart',
                parentMessageId: 'm1',
            }
        );
        expect(readAiChatEvent({ type: 'TOOL_CALL_START', toolCallId: 'c1', toolCallName: 'x' })).toMatchObject({ parentMessageId: null });
        expect(readAiChatEvent({ type: 'TOOL_CALL_ARGS', toolCallId: 'c1', delta: '{}' })).toEqual({
            type: AI_CHAT_EVENT_TYPE.TOOL_CALL_ARGS,
            toolCallId: 'c1',
            delta: '{}',
        });
        expect(readAiChatEvent({ type: 'TOOL_CALL_END', toolCallId: 'c1' })).toEqual({
            type: AI_CHAT_EVENT_TYPE.TOOL_CALL_END,
            toolCallId: 'c1',
        });
        expect(readAiChatEvent({ type: 'TOOL_CALL_RESULT', messageId: 'm2', toolCallId: 'c1', content: 'ok' })).toEqual({
            type: AI_CHAT_EVENT_TYPE.TOOL_CALL_RESULT,
            messageId: 'm2',
            toolCallId: 'c1',
            content: 'ok',
        });
        expect(readAiChatEvent({ type: 'TOOL_CALL_RESULT', messageId: 'm2', toolCallId: 'c1' })).toMatchObject({ content: '' });
    });

    it('SC-ACP-10 — reads steps, errors and custom events', () => {
        expect(readAiChatEvent({ type: 'STEP_STARTED', stepName: 'Reading' })).toEqual({
            type: AI_CHAT_EVENT_TYPE.STEP_STARTED,
            stepName: 'Reading',
        });
        expect(readAiChatEvent({ type: 'STEP_FINISHED', stepName: 'Reading' })).toEqual({
            type: AI_CHAT_EVENT_TYPE.STEP_FINISHED,
            stepName: 'Reading',
        });
        expect(readAiChatEvent({ type: 'STEP_FINISHED' })).toEqual({ type: AI_CHAT_EVENT_TYPE.STEP_FINISHED });
        expect(readAiChatEvent({ type: 'RUN_ERROR', code: 'Error_X', message: 'No.' })).toEqual({
            type: AI_CHAT_EVENT_TYPE.RUN_ERROR,
            code: 'Error_X',
            message: 'No.',
        });
        expect(readAiChatEvent({ type: 'RUN_ERROR' })).toEqual({ type: AI_CHAT_EVENT_TYPE.RUN_ERROR, code: null, message: '' });
        expect(readAiChatEvent({ type: 'CUSTOM', name: 'any.name', value: { referenceId: 'r1' } })).toEqual({
            type: AI_CHAT_EVENT_TYPE.CUSTOM,
            name: 'any.name',
            value: { referenceId: 'r1' },
        });
    });

    it('SC-ACP-10 — reads the result of a finished run and the awaited calls', () => {
        expect(readAiChatEvent({ type: 'RUN_FINISHED', result: { status: 'succeeded' } })).toEqual({
            type: AI_CHAT_EVENT_TYPE.RUN_FINISHED,
            result: EAiChatRunResult.SUCCEEDED,
            pendingToolCallIds: [],
        });
        expect(
            readAiChatEvent({
                type: 'RUN_FINISHED',
                result: { status: 'awaitingFrontendTools', pendingFrontendToolCallIds: ['c1', 5, 'c2'] },
            })
        ).toEqual({
            type: AI_CHAT_EVENT_TYPE.RUN_FINISHED,
            result: EAiChatRunResult.AWAITING_FRONTEND_TOOLS,
            pendingToolCallIds: ['c1', 'c2'],
        });
        expect(readAiChatEvent({ type: 'RUN_FINISHED', result: { status: 'odd' } })).toMatchObject({ result: null });
        expect(readAiChatEvent({ type: 'RUN_FINISHED', result: { pendingFrontendToolCallIds: 'c1' } })).toMatchObject({
            pendingToolCallIds: [],
        });
        expect(readAiChatEvent({ type: 'RUN_FINISHED' })).toEqual({
            type: AI_CHAT_EVENT_TYPE.RUN_FINISHED,
            result: null,
            pendingToolCallIds: [],
        });
    });

    it('SC-ACP-10 — reads a messages snapshot with its tool calls and skips malformed messages', () => {
        expect(
            readAiChatEvent({
                type: 'MESSAGES_SNAPSHOT',
                messages: [
                    {
                        id: 'a1',
                        role: 'assistant',
                        content: 'Hi',
                        toolCalls: [
                            { id: 'c1', type: 'function', function: { name: 'render_chart', arguments: '{}' } },
                            'junk',
                            { id: 'c2' },
                            { function: { name: 'n' } },
                        ],
                    },
                    { id: 't1', role: 'tool', toolCallId: 'c1', toolCalls: 'nope' },
                    { role: 'user', content: 'no id' },
                    { id: 'no-role' },
                    'junk',
                ],
            })
        ).toEqual({
            type: AI_CHAT_EVENT_TYPE.MESSAGES_SNAPSHOT,
            messages: [
                {
                    id: 'a1',
                    role: 'assistant',
                    content: 'Hi',
                    toolCalls: [
                        { id: 'c1', name: 'render_chart', arguments: '{}' },
                        { id: 'c2', name: '', arguments: '' },
                        { id: '', name: 'n', arguments: '' },
                    ],
                    toolCallId: null,
                },
                { id: 't1', role: 'tool', content: '', toolCalls: [], toolCallId: 'c1' },
            ],
        });
        expect(readAiChatEvent({ type: 'MESSAGES_SNAPSHOT', messages: 'nope' })).toEqual({
            type: AI_CHAT_EVENT_TYPE.MESSAGES_SNAPSHOT,
            messages: [],
        });
    });

    it('SC-ACP-10 — drops broken and unknown events', () => {
        const broken: unknown[] = [
            null,
            'text',
            42,
            [],
            {},
            { type: 5 },
            { type: 'STATE_SNAPSHOT' },
            { type: 'RUN_STARTED' },
            { type: 'TEXT_MESSAGE_START' },
            { type: 'TEXT_MESSAGE_CONTENT', messageId: 'm1' },
            { type: 'TEXT_MESSAGE_CONTENT', delta: 'x' },
            { type: 'TEXT_MESSAGE_END' },
            { type: 'TOOL_CALL_START', toolCallId: 'c1' },
            { type: 'TOOL_CALL_START', toolCallName: 'x' },
            { type: 'TOOL_CALL_ARGS', toolCallId: 'c1' },
            { type: 'TOOL_CALL_ARGS', delta: 'x' },
            { type: 'TOOL_CALL_END' },
            { type: 'TOOL_CALL_RESULT', messageId: 'm1' },
            { type: 'TOOL_CALL_RESULT', toolCallId: 'c1' },
            { type: 'STEP_STARTED' },
            { type: 'CUSTOM', value: {} },
        ];

        expect(broken.map((raw: unknown) => readAiChatEvent(raw))).toEqual(broken.map(() => null));
    });
});
