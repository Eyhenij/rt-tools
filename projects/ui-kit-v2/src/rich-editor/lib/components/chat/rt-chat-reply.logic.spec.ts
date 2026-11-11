import { FormControl } from '@angular/forms';

import { IRtChatReplyFields, rtChatReadDraft, rtChatSyncReplyDisabled, rtChatWriteDraft } from './rt-chat-reply.logic';

function fields(patch: Partial<IRtChatReplyFields> = {}): IRtChatReplyFields {
    return {
        messenger: false,
        rich: false,
        prompt: undefined,
        composer: undefined,
        message: new FormControl<string>('обычное поле', { nonNullable: true }),
        textarea: undefined,
        ...patch,
    };
}

describe('rtChatReadDraft', (): void => {
    it('читает обычное поле, когда вид не выбран', (): void => {
        expect(rtChatReadDraft(fields())).toBe('обычное поле');
    });

    it('читает поле вида мессенджера и отдаёт пустую строку без него', (): void => {
        const prompt: IRtChatReplyFields['prompt'] = { text: (): string => 'мессенджер', setDraft: jest.fn() };

        expect(rtChatReadDraft(fields({ messenger: true, prompt }))).toBe('мессенджер');
        expect(rtChatReadDraft(fields({ messenger: true }))).toBe('');
    });

    it('читает компактный композер и отдаёт пустую строку без него', (): void => {
        const composer: IRtChatReplyFields['composer'] = { draftText: (): string => 'композер', setDraft: jest.fn() };

        expect(rtChatReadDraft(fields({ rich: true, composer }))).toBe('композер');
        expect(rtChatReadDraft(fields({ rich: true }))).toBe('');
    });
});

describe('rtChatWriteDraft', (): void => {
    it('пишет в поле того вида, который на экране', (): void => {
        const setDraft: jest.Mock = jest.fn();

        rtChatWriteDraft(fields({ messenger: true, prompt: { text: (): string => '', setDraft } }), 'мессенджер');
        rtChatWriteDraft(fields({ rich: true, composer: { draftText: (): string => '', setDraft } }), 'композер');

        expect(setDraft.mock.calls).toEqual([['мессенджер'], ['композер']]);
    });

    it('меняет обычное поле и обходится без узла textarea', (): void => {
        const reply: IRtChatReplyFields = fields();

        rtChatWriteDraft(reply, 'новый текст');

        expect(reply.message.value).toBe('новый текст');
    });
});

describe('rtChatSyncReplyDisabled', (): void => {
    it('выключает форму на время блока и включает обратно без события', (): void => {
        const control: FormControl<string> = new FormControl<string>('', { nonNullable: true });
        const changes: jest.Mock = jest.fn();
        control.statusChanges.subscribe(changes);

        rtChatSyncReplyDisabled(control, true);
        expect(control.disabled).toBe(true);

        rtChatSyncReplyDisabled(control, false);
        expect(control.enabled).toBe(true);
        expect(changes).not.toHaveBeenCalled();
    });
});
