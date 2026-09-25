import { pendingToRtMessage, IRtPendingMessage } from './to-rt-message';
import { ERtChatMessageStatus } from './rt-chat.model';

function pending(overrides: Partial<IRtPendingMessage> = {}): IRtPendingMessage {
    return {
        tempId: 'temp-1',
        text: 'Есть ли трансфер?',
        files: [],
        createdAt: '2026-07-25T10:00:00.000Z',
        status: ERtChatMessageStatus.Sending,
        ...overrides,
    };
}

describe('pendingToRtMessage', () => {
    it('неподтверждённое сообщение всегда своё', () => {
        expect(pendingToRtMessage(pending(), 'Мария').own).toBe(true);
    });

    it('ключом строки служит клиентский идентификатор', () => {
        expect(pendingToRtMessage(pending(), 'Мария').id).toBe('temp-1');
    });

    it('подписывается тем, кто отправляет', () => {
        expect(pendingToRtMessage(pending(), 'Owner').author).toBe('Owner');
    });

    it('статус очереди переносится без изменений', () => {
        expect(pendingToRtMessage(pending({ status: ERtChatMessageStatus.Failed }), 'Мария').status).toBe(ERtChatMessageStatus.Failed);
    });

    it('выбранные файлы показываются карточками ещё до загрузки', () => {
        const attached: File = new File(['x'], 'passport.pdf', { type: 'application/pdf' });

        expect(pendingToRtMessage(pending({ files: [attached] }), 'Мария').attachments?.[0]?.name).toBe('passport.pdf');
    });

    it('у ещё не загруженного файла нет идентификатора для скачивания', () => {
        const attached: File = new File(['x'], 'passport.pdf', { type: 'application/pdf' });

        expect(pendingToRtMessage(pending({ files: [attached] }), 'Мария').attachments?.[0]?.publicId).toBe('');
    });

    it('rich-тело переносится в строку ленты как есть', () => {
        const delta: { ops: { insert: string }[] } = { ops: [{ insert: 'Готово' }] };

        expect(pendingToRtMessage(pending({ delta }), 'Owner').delta).toEqual(delta);
    });

    it('сообщение без rich-тела показывается обычным текстом', () => {
        expect(pendingToRtMessage(pending(), 'Мария').delta).toBeNull();
    });

    it('неотправленное сообщение скрыть нельзя — его ещё нет на сервере', () => {
        expect(pendingToRtMessage(pending({ status: ERtChatMessageStatus.Failed }), 'Мария').canDelete).toBe(false);
    });
});
