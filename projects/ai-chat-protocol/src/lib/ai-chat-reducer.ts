import { createAiChatError, toRunErrorKind } from './ai-chat-errors';
import {
    AI_CHAT_EVENT_TYPE,
    IAiChatCustomEvent,
    IAiChatMessagesSnapshotEvent,
    IAiChatRunErrorEvent,
    IAiChatRunFinishedEvent,
    IAiChatRunStartedEvent,
    IAiChatSnapshotMessage,
    IAiChatStepStartedEvent,
    IAiChatTextContentEvent,
    IAiChatTextStartEvent,
    IAiChatToolCallArgsEvent,
    IAiChatToolCallResultEvent,
    IAiChatToolCallStartEvent,
    TAiChatEvent,
} from './ai-chat-event.model';
import { EAiChatRole, EAiChatRunStatus } from './ai-chat.enum';
import { IAiChatMessage, IAiChatRunState, IAiChatToolCall } from './ai-chat.model';

export const AI_CHAT_INITIAL_RUN: Readonly<IAiChatRunState> = Object.freeze({
    runId: null,
    status: EAiChatRunStatus.IDLE,
    messages: [],
    step: null,
    referenceId: null,
    result: null,
    pendingToolCallIds: [],
    error: null,
});

const ROLES: ReadonlyMap<string, EAiChatRole> = new Map<string, EAiChatRole>(
    Object.values(EAiChatRole).map((role: EAiChatRole) => [role, role])
);

export function createAiChatMessage(id: string, role: EAiChatRole, content: string, isStored: boolean): IAiChatMessage {
    return { id, role, content, isStored, toolCalls: [], toolCallId: null, feedback: null };
}

/** The messages the next run sends: the ones the server does not keep yet. */
export function selectUnsentMessages(messages: IAiChatMessage[]): IAiChatMessage[] {
    return messages.filter((message: IAiChatMessage) => !message.isStored);
}

function upsertMessage(messages: IAiChatMessage[], id: string, update: (message: IAiChatMessage) => IAiChatMessage): IAiChatMessage[] {
    const index: number = messages.findIndex((message: IAiChatMessage) => message.id === id);

    if (index === -1) {
        return [...messages, update(createAiChatMessage(id, EAiChatRole.ASSISTANT, '', true))];
    }

    return messages.map((message: IAiChatMessage, position: number) => (position === index ? update(message) : message));
}

function appendToolCallArgs(messages: IAiChatMessage[], toolCallId: string, delta: string): IAiChatMessage[] {
    return messages.map((message: IAiChatMessage) =>
        message.toolCalls.some((call: IAiChatToolCall) => call.id === toolCallId)
            ? {
                  ...message,
                  toolCalls: message.toolCalls.map((call: IAiChatToolCall) =>
                      call.id === toolCallId ? { ...call, arguments: call.arguments + delta } : call
                  ),
              }
            : message
    );
}

function fromSnapshot(messages: IAiChatSnapshotMessage[]): IAiChatMessage[] {
    return messages.flatMap((raw: IAiChatSnapshotMessage) => {
        const role: EAiChatRole | undefined = ROLES.get(raw.role);

        return role
            ? [{ ...createAiChatMessage(raw.id, role, raw.content, true), toolCalls: raw.toolCalls, toolCallId: raw.toolCallId }]
            : [];
    });
}

function readReferenceId(value: unknown): string | null {
    const referenceId: unknown = typeof value === 'object' && value !== null ? Reflect.get(value, 'referenceId') : null;

    return typeof referenceId === 'string' && referenceId ? referenceId : null;
}

type TEventType = TAiChatEvent['type'];
type TEventOf<T extends TEventType> = Extract<TAiChatEvent, { type: T }>;
type THandler<T extends TEventType> = (state: IAiChatRunState, event: TEventOf<T>) => IAiChatRunState;

function onRunStarted(state: IAiChatRunState, event: IAiChatRunStartedEvent): IAiChatRunState {
    return { ...state, runId: event.runId, step: null, result: null, pendingToolCallIds: [], error: null };
}

function onCustom(state: IAiChatRunState, event: IAiChatCustomEvent): IAiChatRunState {
    return { ...state, referenceId: readReferenceId(event.value) ?? state.referenceId };
}

function onStepStarted(state: IAiChatRunState, event: IAiChatStepStartedEvent): IAiChatRunState {
    return { ...state, step: event.stepName };
}

function onStepFinished(state: IAiChatRunState): IAiChatRunState {
    return { ...state, step: null };
}

function onTextStart(state: IAiChatRunState, event: IAiChatTextStartEvent): IAiChatRunState {
    return { ...state, step: null, messages: upsertMessage(state.messages, event.messageId, (message: IAiChatMessage) => message) };
}

function onTextContent(state: IAiChatRunState, event: IAiChatTextContentEvent): IAiChatRunState {
    return {
        ...state,
        step: null,
        messages: upsertMessage(state.messages, event.messageId, (message: IAiChatMessage) => ({
            ...message,
            content: message.content + event.delta,
        })),
    };
}

function onNothing(state: IAiChatRunState): IAiChatRunState {
    return state;
}

function onToolCallStart(state: IAiChatRunState, event: IAiChatToolCallStartEvent): IAiChatRunState {
    return {
        ...state,
        messages: upsertMessage(state.messages, event.parentMessageId ?? event.toolCallId, (message: IAiChatMessage) => ({
            ...message,
            toolCalls: [...message.toolCalls, { id: event.toolCallId, name: event.toolCallName, arguments: '' }],
        })),
    };
}

function onToolCallArgs(state: IAiChatRunState, event: IAiChatToolCallArgsEvent): IAiChatRunState {
    return { ...state, messages: appendToolCallArgs(state.messages, event.toolCallId, event.delta) };
}

function onToolCallResult(state: IAiChatRunState, event: IAiChatToolCallResultEvent): IAiChatRunState {
    return {
        ...state,
        messages: [
            ...state.messages,
            { ...createAiChatMessage(event.messageId, EAiChatRole.TOOL, event.content, true), toolCallId: event.toolCallId },
        ],
    };
}

function onMessagesSnapshot(state: IAiChatRunState, event: IAiChatMessagesSnapshotEvent): IAiChatRunState {
    return { ...state, step: null, messages: [...fromSnapshot(event.messages), ...selectUnsentMessages(state.messages)] };
}

function onRunFinished(state: IAiChatRunState, event: IAiChatRunFinishedEvent): IAiChatRunState {
    return {
        ...state,
        status: EAiChatRunStatus.IDLE,
        step: null,
        result: event.result,
        pendingToolCallIds: event.pendingToolCallIds,
        messages: state.messages.map((message: IAiChatMessage) => (message.isStored ? message : { ...message, isStored: true })),
    };
}

function onRunError(state: IAiChatRunState, event: IAiChatRunErrorEvent): IAiChatRunState {
    return {
        ...state,
        status: EAiChatRunStatus.IDLE,
        step: null,
        error: createAiChatError(toRunErrorKind(event.code), event.message, state.referenceId),
    };
}

/** One handler per event type: a new event type does not compile until it has one. */
const HANDLERS: Readonly<{ [T in TEventType]: THandler<T> }> = {
    [AI_CHAT_EVENT_TYPE.RUN_STARTED]: onRunStarted,
    [AI_CHAT_EVENT_TYPE.CUSTOM]: onCustom,
    [AI_CHAT_EVENT_TYPE.STEP_STARTED]: onStepStarted,
    [AI_CHAT_EVENT_TYPE.STEP_FINISHED]: onStepFinished,
    [AI_CHAT_EVENT_TYPE.TEXT_MESSAGE_START]: onTextStart,
    [AI_CHAT_EVENT_TYPE.TEXT_MESSAGE_CONTENT]: onTextContent,
    [AI_CHAT_EVENT_TYPE.TEXT_MESSAGE_END]: onNothing,
    [AI_CHAT_EVENT_TYPE.TOOL_CALL_START]: onToolCallStart,
    [AI_CHAT_EVENT_TYPE.TOOL_CALL_ARGS]: onToolCallArgs,
    [AI_CHAT_EVENT_TYPE.TOOL_CALL_END]: onNothing,
    [AI_CHAT_EVENT_TYPE.TOOL_CALL_RESULT]: onToolCallResult,
    [AI_CHAT_EVENT_TYPE.MESSAGES_SNAPSHOT]: onMessagesSnapshot,
    [AI_CHAT_EVENT_TYPE.RUN_FINISHED]: onRunFinished,
    [AI_CHAT_EVENT_TYPE.RUN_ERROR]: onRunError,
};

/** The only place a run state changes on an event. The input state is never mutated. */
export function applyAiChatEvent(state: IAiChatRunState, event: TAiChatEvent): IAiChatRunState {
    const handler: THandler<TEventType> = HANDLERS[event.type] as THandler<TEventType>;

    return handler(state, event);
}
