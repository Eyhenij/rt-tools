export enum EAiChatRole {
    USER = 'user',
    ASSISTANT = 'assistant',
    TOOL = 'tool',
    SYSTEM = 'system',
    DEVELOPER = 'developer',
}

export enum EAiChatRunStatus {
    IDLE = 'idle',
    RUNNING = 'running',
}

export enum EAiChatRunResult {
    SUCCEEDED = 'succeeded',
    AWAITING_FRONTEND_TOOLS = 'awaitingFrontendTools',
}

export enum EAiChatFeedback {
    LIKED = 'liked',
    DISLIKED = 'disliked',
}

export enum EAiChatErrorKind {
    SESSION_EXPIRED = 'session-expired',
    ACCESS_DENIED = 'access-denied',
    ALREADY_RUNNING = 'already-running',
    BUSY = 'busy',
    ARCHIVED = 'archived',
    NO_INPUT = 'no-input',
    UNAVAILABLE = 'unavailable',
    INTERRUPTED = 'interrupted',
    SUPERSEDED = 'superseded',
    RUN_FAILED = 'run-failed',
}
