import { AI_CHAT_BACKEND_CODES, AI_CHAT_ERROR_TEXTS } from './ai-chat.const';
import { EAiChatErrorKind } from './ai-chat.enum';
import { IAiChatError } from './ai-chat.model';

/** The kind of an error the stream reports in `RUN_ERROR`. */
export function toRunErrorKind(code: string | null): EAiChatErrorKind {
    switch (code) {
        case AI_CHAT_BACKEND_CODES.INTERRUPTED:
            return EAiChatErrorKind.INTERRUPTED;
        case AI_CHAT_BACKEND_CODES.SUPERSEDED:
            return EAiChatErrorKind.SUPERSEDED;
        default:
            return EAiChatErrorKind.RUN_FAILED;
    }
}

/** The kind of a refusal that came before the stream started: an HTTP status and a service code. */
export function toHttpErrorKind(status: number, code: string | null): EAiChatErrorKind {
    if (status === 401) {
        return EAiChatErrorKind.SESSION_EXPIRED;
    }

    if (status === 403) {
        return EAiChatErrorKind.ACCESS_DENIED;
    }

    switch (code) {
        case AI_CHAT_BACKEND_CODES.ALREADY_RUNNING:
            return EAiChatErrorKind.ALREADY_RUNNING;
        case AI_CHAT_BACKEND_CODES.BUSY:
            return EAiChatErrorKind.BUSY;
        case AI_CHAT_BACKEND_CODES.ARCHIVED:
            return EAiChatErrorKind.ARCHIVED;
        case AI_CHAT_BACKEND_CODES.NO_INPUT:
            return EAiChatErrorKind.NO_INPUT;
        default:
            return status === 409 ? EAiChatErrorKind.ALREADY_RUNNING : EAiChatErrorKind.UNAVAILABLE;
    }
}

/** A request is repeated before the stream only after unavailable and busy; a started answer is never resent. */
export function isRetryableBeforeStream(kind: EAiChatErrorKind): boolean {
    return kind === EAiChatErrorKind.UNAVAILABLE || kind === EAiChatErrorKind.BUSY;
}

export function createAiChatError(
    kind: EAiChatErrorKind,
    message: string | null,
    referenceId: string | null,
    texts: Readonly<Record<EAiChatErrorKind, string>> = AI_CHAT_ERROR_TEXTS
): IAiChatError {
    return { kind, referenceId, message: message || texts[kind] };
}
