import { messageHasAvailableActions } from './rt-chat-message-actions.logic';
import { IRtChat } from './rt-chat.model';

function message(patch: Partial<IRtChat.Message> = {}): IRtChat.Message {
    return {
        id: 1,
        author: 'Иванов',
        own: false,
        text: 'Здравствуйте',
        createdAt: '2026-03-15T10:00:00Z',
        ...patch,
    };
}

describe('messageHasAvailableActions', (): void => {
    it('SC-UKV-75 — реплика без доступных действий точки действий не показывает', (): void => {
        expect(messageHasAvailableActions(message({ own: true }), (candidate: IRtChat.Message): boolean => !candidate.own)).toBe(false);
    });

    it('SC-UKV-75 — реплика хотя бы с одним доступным действием точку действий показывает', (): void => {
        expect(messageHasAvailableActions(message(), (candidate: IRtChat.Message): boolean => !candidate.own)).toBe(true);
    });

    it('SC-UKV-76 — без предиката действия считаются доступными', (): void => {
        expect(messageHasAvailableActions(message({ own: true }), null)).toBe(true);
    });
});
