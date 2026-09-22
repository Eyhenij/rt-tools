import { IChatSiteLookRow } from '@rt/message-bus-common';
import { describe, expect, it } from 'vitest';

import {
    EWidgetHoursWord,
    widgetHoursText,
    widgetHoursWord,
    widgetSendable,
    widgetServiceOrigin,
    widgetStorageKey,
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
});
