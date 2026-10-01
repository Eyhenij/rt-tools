import { IChatMessageRow, IChatSiteLookRow, IChatVisitorTalkListRow } from '@rt/message-bus-common';
import { describe, expect, it } from 'vitest';

import {
    EWidgetHoursWord,
    widgetClosedTalks,
    widgetDayText,
    widgetFirstName,
    widgetHoursText,
    widgetHoursWord,
    widgetInitials,
    widgetLastAuthor,
    widgetSendable,
    widgetServiceOrigin,
    widgetStorageKey,
    widgetTimeText,
    widgetUnread,
} from './chat-widget.logic';

/** Площадка с названными часами: девять утра — шесть вечера. */
const WITH_HOURS: IChatSiteLookRow = { greeting: 'Здравствуйте', answering: true, answerFrom: 9 * 60, answerTo: 18 * 60 };

describe('решения виджета', () => {
    it('SC-CH-55 — пустая реплика не уходит, а непустая уходит', () => {
        expect(widgetSendable('')).toBe(false);
        expect(widgetSendable('   ')).toBe(false);
        expect(widgetSendable(' здравствуйте ')).toBe(true);
    });

    it('SC-CH-49 — адрес сервиса берётся у признака тега, а без него — у адреса скрипта', () => {
        expect(widgetServiceOrigin('https://bus.example', '')).toBe('https://bus.example');
        expect(widgetServiceOrigin('https://bus.example/', '')).toBe('https://bus.example');
        expect(widgetServiceOrigin('', 'https://bus.example/widget.js')).toBe('https://bus.example');
        expect(widgetServiceOrigin('', 'не адрес')).toBe('');
    });

    it('SC-CH-51 — признак посетителя лежит под именем своей площадки', () => {
        expect(widgetStorageKey('shop')).toBe('rt-chat:shop');
        expect(widgetStorageKey('shop')).not.toBe(widgetStorageKey('blog'));
    });

    it('SC-CH-58 — слово о часах: отвечаем, ответим позже или молчим', () => {
        expect(widgetHoursWord(WITH_HOURS)).toBe(EWidgetHoursWord.Answering);
        expect(widgetHoursWord({ ...WITH_HOURS, answering: false })).toBe(EWidgetHoursWord.Later);
        expect(widgetHoursWord({ ...WITH_HOURS, answerFrom: 0, answerTo: 0, answering: true })).toBe(EWidgetHoursWord.Silent);
        expect(widgetHoursText(WITH_HOURS)).toBe('09:00–18:00');
    });

    it('SC-CH-100 — пузырь называет время приёма часами и минутами в поясе посетителя', () => {
        expect(widgetTimeText(new Date(2026, 8, 19, 12, 40).toISOString())).toBe('12:40');
        expect(widgetTimeText(new Date(2026, 8, 19, 9, 5).toISOString())).toBe('09:05');
        expect(widgetTimeText('не время')).toBe('');
    });

    it('SC-CH-110 — ответ свежее минуты просмотра ставит точку, своя реплика — нет', () => {
        const answered: IChatVisitorTalkListRow = {
            id: 'talk-1',
            state: 'live',
            lastMessageAt: '2026-09-20T10:30:00.000Z',
            lastMessage: 'отвечаю',
            lastMessageSide: 'operator',
            operatorName: 'Анна Смирнова',
            closedAt: null,
        };

        expect(widgetUnread(answered, '')).toBe(true);
        expect(widgetUnread(answered, '2026-09-20T10:00:00.000Z')).toBe(true);
        expect(widgetUnread(answered, '2026-09-20T10:30:00.000Z')).toBe(false);
        expect(widgetUnread({ ...answered, lastMessageSide: 'visitor' }, '')).toBe(false);
    });

    it('SC-CH-111 — шапка и пузырь называют сотрудника: инициалы, первое слово, последний названный', () => {
        const feed: IChatMessageRow[] = [
            { id: '1', side: 'visitor', text: 'вопрос', takenAt: '2026-09-20T10:00:00.000Z' },
            { id: '2', side: 'operator', text: 'ответ', takenAt: '2026-09-20T10:01:00.000Z', authorName: 'Анна Смирнова' },
            { id: '3', side: 'operator', text: 'со встраиваемой страницы', takenAt: '2026-09-20T10:02:00.000Z', authorName: '' },
        ];

        expect(widgetInitials('Анна Смирнова')).toBe('АС');
        expect(widgetInitials('  игорь  ')).toBe('И');
        expect(widgetFirstName('Анна Смирнова')).toBe('Анна');
        expect(widgetLastAuthor(feed)).toBe('Анна Смирнова');
        expect(widgetLastAuthor(feed.slice(0, 1))).toBe('');
    });

    it('SC-CH-107 — строка списка называет день: сегодня часами, вчера словом, раньше числом', () => {
        const now: Date = new Date(2026, 8, 30, 15, 0);

        expect(widgetDayText(new Date(2026, 8, 30, 12, 42).toISOString(), now, 'Вчера')).toBe('12:42');
        expect(widgetDayText(new Date(2026, 8, 29, 23, 0).toISOString(), now, 'Вчера')).toBe('Вчера');
        expect(widgetDayText(new Date(2026, 8, 24, 9, 0).toISOString(), now, 'Вчера')).toBe('24 сент.');
        expect(widgetDayText('не время', now, 'Вчера')).toBe('');
    });

    it('SC-CH-112 — закрытие помечает строку своего обращения и не трогает остальные', () => {
        const row: (id: string) => IChatVisitorTalkListRow = (id: string): IChatVisitorTalkListRow => ({
            id,
            state: 'live',
            lastMessageAt: '2026-09-20T10:30:00.000Z',
            lastMessage: 'вопрос',
            lastMessageSide: 'visitor',
            operatorName: '',
            closedAt: null,
        });
        const talks: IChatVisitorTalkListRow[] = widgetClosedTalks([row('talk-1'), row('talk-2')], 'talk-1', '2026-09-20T10:50:00.000Z');

        expect(talks[0]).toMatchObject({ id: 'talk-1', state: 'closed', closedAt: '2026-09-20T10:50:00.000Z' });
        expect(talks[1]).toEqual(row('talk-2'));
        expect(widgetClosedTalks([row('talk-2')], 'talk-9', '2026-09-20T10:50:00.000Z')).toEqual([row('talk-2')]);
    });
});
