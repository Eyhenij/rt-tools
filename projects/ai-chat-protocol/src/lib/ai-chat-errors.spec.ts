import { createAiChatError, isRetryableBeforeStream, toHttpErrorKind, toRunErrorKind } from './ai-chat-errors';
import { AI_CHAT_BACKEND_CODES, AI_CHAT_ERROR_TEXTS } from './ai-chat.const';
import { EAiChatErrorKind } from './ai-chat.enum';

describe('ai-chat errors', () => {
    it('SC-ACP-5 — names a cut run and a replaced run, and any other run code is a failure', () => {
        expect(toRunErrorKind(AI_CHAT_BACKEND_CODES.INTERRUPTED)).toBe(EAiChatErrorKind.INTERRUPTED);
        expect(toRunErrorKind(AI_CHAT_BACKEND_CODES.SUPERSEDED)).toBe(EAiChatErrorKind.SUPERSEDED);
        expect(toRunErrorKind('Error_AiChat_Run_AgentFailed')).toBe(EAiChatErrorKind.RUN_FAILED);
        expect(toRunErrorKind(null)).toBe(EAiChatErrorKind.RUN_FAILED);
    });

    it('SC-ACP-9 — maps refusals before the stream to their own kinds', () => {
        expect(toHttpErrorKind(401, null)).toBe(EAiChatErrorKind.SESSION_EXPIRED);
        expect(toHttpErrorKind(403, 'Error_Access_Denied')).toBe(EAiChatErrorKind.ACCESS_DENIED);
        expect(toHttpErrorKind(409, AI_CHAT_BACKEND_CODES.ALREADY_RUNNING)).toBe(EAiChatErrorKind.ALREADY_RUNNING);
        expect(toHttpErrorKind(400, AI_CHAT_BACKEND_CODES.BUSY)).toBe(EAiChatErrorKind.BUSY);
        expect(toHttpErrorKind(400, AI_CHAT_BACKEND_CODES.ARCHIVED)).toBe(EAiChatErrorKind.ARCHIVED);
        expect(toHttpErrorKind(400, AI_CHAT_BACKEND_CODES.NO_INPUT)).toBe(EAiChatErrorKind.NO_INPUT);
        expect(toHttpErrorKind(409, null)).toBe(EAiChatErrorKind.ALREADY_RUNNING);
        expect(toHttpErrorKind(0, null)).toBe(EAiChatErrorKind.UNAVAILABLE);
        expect(toHttpErrorKind(503, 'Error_Unknown')).toBe(EAiChatErrorKind.UNAVAILABLE);
    });

    it('SC-ACP-9 — retries only unavailable and busy', () => {
        expect(isRetryableBeforeStream(toHttpErrorKind(503, null))).toBe(true);
        expect(isRetryableBeforeStream(toHttpErrorKind(400, AI_CHAT_BACKEND_CODES.BUSY))).toBe(true);
        expect(isRetryableBeforeStream(toHttpErrorKind(409, AI_CHAT_BACKEND_CODES.ALREADY_RUNNING))).toBe(false);
        expect(isRetryableBeforeStream(toHttpErrorKind(403, null))).toBe(false);
    });

    it('SC-ACP-9 — the error carries the service text, else the default, else the text the application passes', () => {
        expect(createAiChatError(EAiChatErrorKind.RUN_FAILED, 'Could not complete.', 'ref-1')).toEqual({
            kind: EAiChatErrorKind.RUN_FAILED,
            message: 'Could not complete.',
            referenceId: 'ref-1',
        });
        expect(createAiChatError(EAiChatErrorKind.BUSY, null, null).message).toBe(AI_CHAT_ERROR_TEXTS[EAiChatErrorKind.BUSY]);
        expect(
            createAiChatError(EAiChatErrorKind.BUSY, '', null, { ...AI_CHAT_ERROR_TEXTS, [EAiChatErrorKind.BUSY]: 'Occupé' }).message
        ).toBe('Occupé');
    });

    it('has a default text for every kind', () => {
        for (const kind of Object.values(EAiChatErrorKind)) {
            expect(AI_CHAT_ERROR_TEXTS[kind].length).toBeGreaterThan(0);
        }
    });
});
