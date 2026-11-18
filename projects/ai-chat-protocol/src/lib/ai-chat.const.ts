import { EAiChatErrorKind } from './ai-chat.enum.js';

/** The error codes of the assistant service. A run code arrives inside the stream, the rest before it. */
export const AI_CHAT_BACKEND_CODES: Readonly<
    Record<'ALREADY_RUNNING' | 'BUSY' | 'ARCHIVED' | 'NO_INPUT' | 'INTERRUPTED' | 'SUPERSEDED', string>
> = Object.freeze({
    ALREADY_RUNNING: 'Error_AiChat_Run_AlreadyRunning',
    BUSY: 'Error_AiChat_Run_Busy',
    ARCHIVED: 'Error_AiChat_Thread_Archived',
    NO_INPUT: 'Error_AiChat_Run_NoInput',
    INTERRUPTED: 'Error_AiChat_Run_Interrupted',
    SUPERSEDED: 'Error_AiChat_Run_Superseded',
});

/** The default texts. An application passes its own where it translates them. */
export const AI_CHAT_ERROR_TEXTS: Readonly<Record<EAiChatErrorKind, string>> = Object.freeze({
    [EAiChatErrorKind.SESSION_EXPIRED]: 'Your session has expired. Sign in again to continue.',
    [EAiChatErrorKind.ACCESS_DENIED]: 'You do not have access to the assistant.',
    [EAiChatErrorKind.ALREADY_RUNNING]: 'An answer is still being written in this conversation. Wait for it or stop it.',
    [EAiChatErrorKind.BUSY]: 'The assistant is busy with your other questions. Try again in a few seconds.',
    [EAiChatErrorKind.ARCHIVED]: 'This conversation is archived. Start a new one.',
    [EAiChatErrorKind.NO_INPUT]: 'The assistant already has this question.',
    [EAiChatErrorKind.UNAVAILABLE]: 'The assistant is unavailable right now.',
    [EAiChatErrorKind.INTERRUPTED]: 'The assistant was interrupted. Ask again.',
    [EAiChatErrorKind.SUPERSEDED]: 'This answer was replaced by a newer one. The conversation was reloaded.',
    [EAiChatErrorKind.RUN_FAILED]: 'The assistant could not finish this answer.',
});
