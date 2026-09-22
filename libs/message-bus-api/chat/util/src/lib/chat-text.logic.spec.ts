import { describe, expect, it } from 'vitest';

import { CHAT_TEXT_LIMIT } from './chat-limits';
import { chatTextFault, EChatTextFault } from './chat-text.logic';

describe('chatTextFault', () => {
    it('SC-CH-9 — текста нет: ни пустой строки, ни одних пробелов', () => {
        expect(chatTextFault('')).toBe(EChatTextFault.Empty);
        expect(chatTextFault('   \n  ')).toBe(EChatTextFault.Empty);
        expect(chatTextFault('здравствуйте')).toBeNull();
    });

    it('SC-CH-10 — знаков больше предела', () => {
        expect(chatTextFault('a'.repeat(CHAT_TEXT_LIMIT))).toBeNull();
        expect(chatTextFault('a'.repeat(CHAT_TEXT_LIMIT + 1))).toBe(EChatTextFault.TooLong);
    });

    it('предел приходит доводом, а не читается из настроек', () => {
        expect(chatTextFault('слово', 3)).toBe(EChatTextFault.TooLong);
    });
});
