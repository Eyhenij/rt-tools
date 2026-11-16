import { IRtAiChat } from '../rt-ai-chat.model';
import { blocksToPlainText, isMarkdownBlock, isNoticeBlock } from './rt-ai-chat-blocks.logic';

describe('rt-ai-chat-blocks logic', (): void => {
    it('SC-UKV-1308 — копия ответа склеивает тексты блоков по порядку, без знаков markdown', (): void => {
        const blocks: readonly IRtAiChat.Block[] = [
            { type: 'markdown', text: '**Итоги октября.** Подтверждено 42 брони.' },
            { type: 'notice', severity: 'warning', text: 'Данные за 31 октября ещё не закрыты.' },
            { type: 'markdown', text: 'Чаще всего — `апартаменты`.' },
        ];

        expect(blocksToPlainText(blocks)).toBe(
            'Итоги октября. Подтверждено 42 брони.\n\nДанные за 31 октября ещё не закрыты.\n\nЧаще всего — апартаменты.'
        );
    });

    it('SC-UKV-1309 — блок, которого кит не знает, в копию не попадает', (): void => {
        const blocks: readonly IRtAiChat.Block[] = [
            { type: 'markdown', text: 'До графика.' },
            { type: 'chart', option: { series: [] }, text: 'подпись графика' },
            { type: 'markdown', text: 'После графика.' },
        ];

        expect(blocksToPlainText(blocks)).toBe('До графика.\n\nПосле графика.');
    });

    it('SC-UKV-1309 — пустой ответ и ответ из одних неизвестных блоков дают пустую строку', (): void => {
        const one: readonly IRtAiChat.Block[] = [{ type: 'markdown', text: 'есть' }];
        expect(blocksToPlainText(one)).toBe('есть');
        expect(blocksToPlainText([])).toBe('');
        expect(blocksToPlainText([{ type: 'chart' }])).toBe('');
    });

    it('SC-UKV-1309 — блок известного типа без строки text кит своим не считает', (): void => {
        const markdown: IRtAiChat.Block = { type: 'markdown', text: '' };
        const notice: IRtAiChat.Block = { type: 'notice', severity: 'info', text: 'x' };
        expect(isMarkdownBlock(markdown)).toBe(true);
        expect(isNoticeBlock(notice)).toBe(true);
        expect(isMarkdownBlock({ type: 'markdown' })).toBe(false);
        expect(isNoticeBlock({ type: 'notice' })).toBe(false);
    });
});
