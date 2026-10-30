import { IRtChat } from './rt-chat.model';
import { rtChatDayLabel, rtChatDayLabels } from './rt-chat-days.logic';

/** Полдень 15 марта по местному времени: от него считаются «сегодня» и «вчера» */
const NOW: Date = new Date(2026, 2, 15, 12, 0);

function at(id: number, date: Date): IRtChat.Message {
    return { id: id, author: 'Гость', own: false, text: 'Здравствуйте', createdAt: date.toISOString() };
}

describe('rtChatDayLabel', (): void => {
    it('SC-UKV-1066 — сегодня и вчера пишутся словами языка ленты, раньше — датой', (): void => {
        expect(rtChatDayLabel(new Date(2026, 2, 15, 0, 5), NOW, 'ru')).toBe('сегодня');
        expect(rtChatDayLabel(new Date(2026, 2, 14, 23, 55), NOW, 'ru')).toBe('вчера');
        expect(rtChatDayLabel(new Date(2026, 2, 14, 9, 0), NOW, 'en')).toBe('yesterday');
        expect(rtChatDayLabel(new Date(2026, 2, 10, 9, 0), NOW, 'ru')).toBe('10 марта');
    });

    it('SC-UKV-1066 — год пишется только у прошлых лет', (): void => {
        expect(rtChatDayLabel(new Date(2025, 11, 31, 9, 0), NOW, 'ru')).toBe('31 декабря 2025 г.');
    });
});

describe('rtChatDayLabels', (): void => {
    it('SC-UKV-1066 — подпись стоит только у первого сообщения каждого дня', (): void => {
        const labels: ReadonlyMap<number | string, string> = rtChatDayLabels(
            [
                at(1, new Date(2026, 2, 14, 9, 0)),
                at(2, new Date(2026, 2, 14, 18, 0)),
                at(3, new Date(2026, 2, 15, 8, 0)),
                at(4, new Date(2026, 2, 15, 9, 0)),
            ],
            NOW,
            'ru'
        );

        expect([...labels.entries()]).toEqual([
            [1, 'вчера'],
            [3, 'сегодня'],
        ]);
    });
});
