import { EAiChatRunResult } from './ai-chat.enum';
import { IAiChatToolCall } from './ai-chat.model';

/** The AG-UI event types the package reads. The values are the wire names. */
export const AI_CHAT_EVENT_TYPE: Readonly<{
    RUN_STARTED: 'RUN_STARTED';
    RUN_FINISHED: 'RUN_FINISHED';
    RUN_ERROR: 'RUN_ERROR';
    STEP_STARTED: 'STEP_STARTED';
    STEP_FINISHED: 'STEP_FINISHED';
    TEXT_MESSAGE_START: 'TEXT_MESSAGE_START';
    TEXT_MESSAGE_CONTENT: 'TEXT_MESSAGE_CONTENT';
    TEXT_MESSAGE_END: 'TEXT_MESSAGE_END';
    TOOL_CALL_START: 'TOOL_CALL_START';
    TOOL_CALL_ARGS: 'TOOL_CALL_ARGS';
    TOOL_CALL_END: 'TOOL_CALL_END';
    TOOL_CALL_RESULT: 'TOOL_CALL_RESULT';
    MESSAGES_SNAPSHOT: 'MESSAGES_SNAPSHOT';
    CUSTOM: 'CUSTOM';
}> = Object.freeze({
    RUN_STARTED: 'RUN_STARTED',
    RUN_FINISHED: 'RUN_FINISHED',
    RUN_ERROR: 'RUN_ERROR',
    STEP_STARTED: 'STEP_STARTED',
    STEP_FINISHED: 'STEP_FINISHED',
    TEXT_MESSAGE_START: 'TEXT_MESSAGE_START',
    TEXT_MESSAGE_CONTENT: 'TEXT_MESSAGE_CONTENT',
    TEXT_MESSAGE_END: 'TEXT_MESSAGE_END',
    TOOL_CALL_START: 'TOOL_CALL_START',
    TOOL_CALL_ARGS: 'TOOL_CALL_ARGS',
    TOOL_CALL_END: 'TOOL_CALL_END',
    TOOL_CALL_RESULT: 'TOOL_CALL_RESULT',
    MESSAGES_SNAPSHOT: 'MESSAGES_SNAPSHOT',
    CUSTOM: 'CUSTOM',
} as const);

export interface IAiChatRunStartedEvent {
    type: typeof AI_CHAT_EVENT_TYPE.RUN_STARTED;
    runId: string;
    threadId?: string;
}

/** `pendingToolCallIds` names the browser tool calls the run waits for. */
export interface IAiChatRunFinishedEvent {
    type: typeof AI_CHAT_EVENT_TYPE.RUN_FINISHED;
    result: EAiChatRunResult | null;
    pendingToolCallIds: string[];
}

export interface IAiChatRunErrorEvent {
    type: typeof AI_CHAT_EVENT_TYPE.RUN_ERROR;
    code: string | null;
    message: string;
}

export interface IAiChatStepStartedEvent {
    type: typeof AI_CHAT_EVENT_TYPE.STEP_STARTED;
    stepName: string;
}

export interface IAiChatStepFinishedEvent {
    type: typeof AI_CHAT_EVENT_TYPE.STEP_FINISHED;
    stepName?: string;
}

export interface IAiChatTextStartEvent {
    type: typeof AI_CHAT_EVENT_TYPE.TEXT_MESSAGE_START;
    messageId: string;
}

export interface IAiChatTextContentEvent {
    type: typeof AI_CHAT_EVENT_TYPE.TEXT_MESSAGE_CONTENT;
    messageId: string;
    delta: string;
}

export interface IAiChatTextEndEvent {
    type: typeof AI_CHAT_EVENT_TYPE.TEXT_MESSAGE_END;
    messageId: string;
}

export interface IAiChatToolCallStartEvent {
    type: typeof AI_CHAT_EVENT_TYPE.TOOL_CALL_START;
    toolCallId: string;
    toolCallName: string;
    parentMessageId: string | null;
}

export interface IAiChatToolCallArgsEvent {
    type: typeof AI_CHAT_EVENT_TYPE.TOOL_CALL_ARGS;
    toolCallId: string;
    delta: string;
}

export interface IAiChatToolCallEndEvent {
    type: typeof AI_CHAT_EVENT_TYPE.TOOL_CALL_END;
    toolCallId: string;
}

export interface IAiChatToolCallResultEvent {
    type: typeof AI_CHAT_EVENT_TYPE.TOOL_CALL_RESULT;
    messageId: string;
    toolCallId: string;
    content: string;
}

/** One message of a snapshot, as the stream carries it. */
export interface IAiChatSnapshotMessage {
    id: string;
    role: string;
    content: string;
    toolCalls: IAiChatToolCall[];
    toolCallId: string | null;
}

export interface IAiChatMessagesSnapshotEvent {
    type: typeof AI_CHAT_EVENT_TYPE.MESSAGES_SNAPSHOT;
    messages: IAiChatSnapshotMessage[];
}

/**
 * An event the application names itself. A custom event whose `value` carries a string
 * `referenceId` sets the run reference; any other custom event leaves the state alone.
 */
export interface IAiChatCustomEvent {
    type: typeof AI_CHAT_EVENT_TYPE.CUSTOM;
    name: string;
    value: unknown;
}

export type TAiChatEvent =
    | IAiChatRunStartedEvent
    | IAiChatRunFinishedEvent
    | IAiChatRunErrorEvent
    | IAiChatStepStartedEvent
    | IAiChatStepFinishedEvent
    | IAiChatTextStartEvent
    | IAiChatTextContentEvent
    | IAiChatTextEndEvent
    | IAiChatToolCallStartEvent
    | IAiChatToolCallArgsEvent
    | IAiChatToolCallEndEvent
    | IAiChatToolCallResultEvent
    | IAiChatMessagesSnapshotEvent
    | IAiChatCustomEvent;
