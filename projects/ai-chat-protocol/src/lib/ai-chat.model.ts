import { EAiChatErrorKind, EAiChatFeedback, EAiChatRole, EAiChatRunResult, EAiChatRunStatus } from './ai-chat.enum.js';

export interface IAiChatToolCall {
    id: string;
    name: string;
    arguments: string;
}

export interface IAiChatMessage {
    id: string;
    role: EAiChatRole;
    content: string;
    toolCalls: IAiChatToolCall[];
    toolCallId: string | null;
    feedback: EAiChatFeedback | null;
    /** The server keeps the message: the next run does not send it. */
    isStored: boolean;
}

export interface IAiChatError {
    kind: EAiChatErrorKind;
    message: string;
    referenceId: string | null;
}

export interface IAiChatRunState {
    runId: string | null;
    status: EAiChatRunStatus;
    messages: IAiChatMessage[];
    step: string | null;
    referenceId: string | null;
    result: EAiChatRunResult | null;
    pendingToolCallIds: string[];
    error: IAiChatError | null;
}

export interface IAiChatThread {
    threadId: string;
    agentId: string;
    title: string;
    isArchived: boolean;
    lastActivityAt: string;
    unreadCount: number;
    activeRunId: string | null;
}

export interface IAiChatThreadPage {
    threads: IAiChatThread[];
    nextCursor: string | null;
}

export interface IAiChatFeedbackChange {
    threadId: string;
    messageId: string;
    next: EAiChatFeedback | null;
    previous: EAiChatFeedback | null;
}

export interface IAiChatRequestMessage {
    id: string;
    role: EAiChatRole;
    content: string;
    toolCallId?: string;
}

export interface IAiChatToolDefinition {
    name: string;
    description: string;
    parameters?: unknown;
}

export interface IAiChatContextItem {
    description: string;
    value: string;
}

export interface IAiChatRunRequest {
    threadId: string;
    runId: string;
    messages: IAiChatRequestMessage[];
    tools: IAiChatToolDefinition[];
    context: IAiChatContextItem[];
    state?: Record<string, unknown>;
    forwardedProps?: Record<string, unknown>;
}
