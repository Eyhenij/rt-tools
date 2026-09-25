import { ERtChatMessageStatus } from '../components/chat/rt-chat.model';
import { RtChatStatusLabelPipe } from './rt-chat-status-label.pipe';

const pipe: RtChatStatusLabelPipe = new RtChatStatusLabelPipe();

describe('RtChatStatusLabelPipe', (): void => {
    it('каждому статусу отдаёт свой ключ подписи', (): void => {
        expect(pipe.transform(ERtChatMessageStatus.Sending)).toBe('rtKit.chatStatusSending');
        expect(pipe.transform(ERtChatMessageStatus.Sent)).toBe('rtKit.chatStatusSent');
        expect(pipe.transform(ERtChatMessageStatus.Read)).toBe('rtKit.chatStatusRead');
        expect(pipe.transform(ERtChatMessageStatus.Failed)).toBe('rtKit.chatStatusFailed');
    });

    it('ключи у статусов разные — иначе доставленное и прочитанное звучали бы одинаково', (): void => {
        const keys: string[] = Object.values(ERtChatMessageStatus).map((status: ERtChatMessageStatus): string => pipe.transform(status));

        expect(new Set(keys).size).toBe(keys.length);
    });
});
