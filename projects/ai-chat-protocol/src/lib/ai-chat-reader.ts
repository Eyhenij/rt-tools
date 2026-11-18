import { AI_CHAT_EVENT_TYPE, IAiChatSnapshotMessage, TAiChatEvent } from './ai-chat-event.model.js';
import { EAiChatRunResult } from './ai-chat.enum.js';
import { IAiChatToolCall } from './ai-chat.model.js';

type TRecord = Record<string, unknown>;

function isRecord(value: unknown): value is TRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(source: TRecord, key: string): string | null {
    const value: unknown = source[key];

    return typeof value === 'string' ? value : null;
}

function readStringArray(source: TRecord, key: string): string[] {
    const value: unknown = source[key];

    return Array.isArray(value) ? value.filter((item: unknown): item is string => typeof item === 'string') : [];
}

function readRunResult(value: string | null): EAiChatRunResult | null {
    return value === EAiChatRunResult.SUCCEEDED || value === EAiChatRunResult.AWAITING_FRONTEND_TOOLS ? value : null;
}

function readToolCalls(source: TRecord): IAiChatToolCall[] {
    const raw: unknown = source['toolCalls'];

    return Array.isArray(raw)
        ? raw.filter(isRecord).map((call: TRecord) => {
              const fn: unknown = call['function'];
              const detail: TRecord = isRecord(fn) ? fn : {};

              return {
                  id: readString(call, 'id') ?? '',
                  name: readString(detail, 'name') ?? '',
                  arguments: readString(detail, 'arguments') ?? '',
              };
          })
        : [];
}

function readSnapshotMessage(message: TRecord): IAiChatSnapshotMessage[] {
    const id: string | null = readString(message, 'id');
    const role: string | null = readString(message, 'role');

    return id !== null && role !== null
        ? [
              {
                  id,
                  role,
                  content: readString(message, 'content') ?? '',
                  toolCalls: readToolCalls(message),
                  toolCallId: readString(message, 'toolCallId'),
              },
          ]
        : [];
}

function readSnapshotMessages(source: TRecord): IAiChatSnapshotMessage[] {
    const raw: unknown = source['messages'];

    return Array.isArray(raw) ? raw.filter(isRecord).flatMap((message: TRecord) => readSnapshotMessage(message)) : [];
}

function readRunFinished(raw: TRecord): TAiChatEvent {
    const result: unknown = raw['result'];

    return {
        type: AI_CHAT_EVENT_TYPE.RUN_FINISHED,
        result: isRecord(result) ? readRunResult(readString(result, 'status')) : null,
        pendingToolCallIds: isRecord(result) ? readStringArray(result, 'pendingFrontendToolCallIds') : [],
    };
}

function readRunStarted(raw: TRecord): TAiChatEvent | null {
    const runId: string | null = readString(raw, 'runId');
    const threadId: string | null = readString(raw, 'threadId');

    return runId ? { type: AI_CHAT_EVENT_TYPE.RUN_STARTED, runId, ...(threadId ? { threadId } : {}) } : null;
}

function readRunError(raw: TRecord): TAiChatEvent {
    return { type: AI_CHAT_EVENT_TYPE.RUN_ERROR, code: readString(raw, 'code'), message: readString(raw, 'message') ?? '' };
}

function readTextStart(raw: TRecord): TAiChatEvent | null {
    const messageId: string | null = readString(raw, 'messageId');

    return messageId ? { type: AI_CHAT_EVENT_TYPE.TEXT_MESSAGE_START, messageId } : null;
}

function readTextContent(raw: TRecord): TAiChatEvent | null {
    const messageId: string | null = readString(raw, 'messageId');
    const delta: string | null = readString(raw, 'delta');

    return messageId && delta !== null ? { type: AI_CHAT_EVENT_TYPE.TEXT_MESSAGE_CONTENT, messageId, delta } : null;
}

function readTextEnd(raw: TRecord): TAiChatEvent | null {
    const messageId: string | null = readString(raw, 'messageId');

    return messageId ? { type: AI_CHAT_EVENT_TYPE.TEXT_MESSAGE_END, messageId } : null;
}

function readToolCallStart(raw: TRecord): TAiChatEvent | null {
    const toolCallId: string | null = readString(raw, 'toolCallId');
    const toolCallName: string | null = readString(raw, 'toolCallName');

    return toolCallId && toolCallName
        ? { toolCallId, toolCallName, type: AI_CHAT_EVENT_TYPE.TOOL_CALL_START, parentMessageId: readString(raw, 'parentMessageId') }
        : null;
}

function readToolCallArgs(raw: TRecord): TAiChatEvent | null {
    const toolCallId: string | null = readString(raw, 'toolCallId');
    const delta: string | null = readString(raw, 'delta');

    return toolCallId && delta !== null ? { type: AI_CHAT_EVENT_TYPE.TOOL_CALL_ARGS, toolCallId, delta } : null;
}

function readToolCallEnd(raw: TRecord): TAiChatEvent | null {
    const toolCallId: string | null = readString(raw, 'toolCallId');

    return toolCallId ? { type: AI_CHAT_EVENT_TYPE.TOOL_CALL_END, toolCallId } : null;
}

function readToolCallResult(raw: TRecord): TAiChatEvent | null {
    const messageId: string | null = readString(raw, 'messageId');
    const toolCallId: string | null = readString(raw, 'toolCallId');

    return messageId && toolCallId
        ? { messageId, toolCallId, type: AI_CHAT_EVENT_TYPE.TOOL_CALL_RESULT, content: readString(raw, 'content') ?? '' }
        : null;
}

function readStepStarted(raw: TRecord): TAiChatEvent | null {
    const stepName: string | null = readString(raw, 'stepName');

    return stepName ? { type: AI_CHAT_EVENT_TYPE.STEP_STARTED, stepName } : null;
}

function readStepFinished(raw: TRecord): TAiChatEvent {
    const stepName: string | null = readString(raw, 'stepName');

    return { type: AI_CHAT_EVENT_TYPE.STEP_FINISHED, ...(stepName ? { stepName } : {}) };
}

function readMessagesSnapshot(raw: TRecord): TAiChatEvent {
    return { type: AI_CHAT_EVENT_TYPE.MESSAGES_SNAPSHOT, messages: readSnapshotMessages(raw) };
}

function readCustom(raw: TRecord): TAiChatEvent | null {
    const name: string | null = readString(raw, 'name');

    return name ? { name, type: AI_CHAT_EVENT_TYPE.CUSTOM, value: raw['value'] } : null;
}

const READERS: ReadonlyMap<string, (raw: TRecord) => TAiChatEvent | null> = new Map<string, (raw: TRecord) => TAiChatEvent | null>([
    [AI_CHAT_EVENT_TYPE.RUN_STARTED, readRunStarted],
    [AI_CHAT_EVENT_TYPE.RUN_FINISHED, readRunFinished],
    [AI_CHAT_EVENT_TYPE.RUN_ERROR, readRunError],
    [AI_CHAT_EVENT_TYPE.STEP_STARTED, readStepStarted],
    [AI_CHAT_EVENT_TYPE.STEP_FINISHED, readStepFinished],
    [AI_CHAT_EVENT_TYPE.TEXT_MESSAGE_START, readTextStart],
    [AI_CHAT_EVENT_TYPE.TEXT_MESSAGE_CONTENT, readTextContent],
    [AI_CHAT_EVENT_TYPE.TEXT_MESSAGE_END, readTextEnd],
    [AI_CHAT_EVENT_TYPE.TOOL_CALL_START, readToolCallStart],
    [AI_CHAT_EVENT_TYPE.TOOL_CALL_ARGS, readToolCallArgs],
    [AI_CHAT_EVENT_TYPE.TOOL_CALL_END, readToolCallEnd],
    [AI_CHAT_EVENT_TYPE.TOOL_CALL_RESULT, readToolCallResult],
    [AI_CHAT_EVENT_TYPE.MESSAGES_SNAPSHOT, readMessagesSnapshot],
    [AI_CHAT_EVENT_TYPE.CUSTOM, readCustom],
]);

/**
 * Brings one parsed AG-UI record to an event of the package. It returns `null` for a record that is
 * not an object, has no type, lacks a required field or carries a type the package does not read.
 * It knows nothing about frames: the transport cuts the stream into records.
 */
export function readAiChatEvent(raw: unknown): TAiChatEvent | null {
    if (!isRecord(raw)) {
        return null;
    }

    const type: string | null = readString(raw, 'type');

    return type === null ? null : (READERS.get(type)?.(raw) ?? null);
}
