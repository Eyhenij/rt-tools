import {
    IRtChatThreadMetrics,
    isNearBottom,
    nextAtBottom,
    pinToBottomDeferred,
    RT_CHAT_NEAR_BOTTOM_THRESHOLD_PX,
    RT_CHAT_PIN_RETRY_DELAYS_MS,
} from './rt-chat-thread.logic';

function metrics(overrides: Partial<IRtChatThreadMetrics> = {}): IRtChatThreadMetrics {
    return { scrollTop: 900, scrollHeight: 1000, clientHeight: 100, ...overrides };
}

describe('isNearBottom', () => {
    it('лента, домотанная до конца, считается стоящей у нижнего края', () => {
        expect(isNearBottom(metrics())).toBe(true);
    });

    it('край зазора ещё считается нижним краем', () => {
        expect(isNearBottom(metrics({ scrollTop: 900 - RT_CHAT_NEAR_BOTTOM_THRESHOLD_PX }))).toBe(true);
    });

    it('уехавшая выше зазора лента у нижнего края не стоит', () => {
        expect(isNearBottom(metrics({ scrollTop: 900 - RT_CHAT_NEAR_BOTTOM_THRESHOLD_PX - 1 }))).toBe(false);
    });
});

describe('nextAtBottom', () => {
    it('читатель, уехавший вверх сам, снимает прилипание', () => {
        expect(nextAtBottom(true, 900, metrics({ scrollTop: 100 }))).toBe(false);
    });

    it('уехавший вверх, но оставшийся в зазоре, прилипание сохраняет', () => {
        expect(nextAtBottom(true, 900, metrics({ scrollTop: 880 }))).toBe(true);
    });

    it('рост содержимого при прежнем положении прилипания не снимает', () => {
        expect(nextAtBottom(true, 900, metrics({ scrollTop: 900, scrollHeight: 4000 }))).toBe(true);
    });

    it('прокрутка вниз до конца прилипание возвращает', () => {
        expect(nextAtBottom(false, 100, metrics())).toBe(true);
    });

    it('прокрутка вниз, не дошедшая до края, прилипания не даёт', () => {
        expect(nextAtBottom(false, 100, metrics({ scrollTop: 500 }))).toBe(false);
    });
});

describe('pinToBottomDeferred', () => {
    afterEach((): void => {
        jest.useRealTimers();
    });

    it('каждый тик дотягивает ленту к низу, пока читатель стоит у края', () => {
        jest.useFakeTimers();
        const el: HTMLElement = document.createElement('div');
        Object.defineProperty(el, 'scrollHeight', { configurable: true, value: 1000 });
        let atBottom: boolean = true;

        pinToBottomDeferred(
            (): HTMLElement => el,
            (): boolean => atBottom
        );
        jest.advanceTimersByTime(RT_CHAT_PIN_RETRY_DELAYS_MS[0]);
        expect(el.scrollTop).toBe(1000);

        el.scrollTop = 0;
        atBottom = false;
        jest.runAllTimers();
        expect(el.scrollTop).toBe(0);
    });
});
