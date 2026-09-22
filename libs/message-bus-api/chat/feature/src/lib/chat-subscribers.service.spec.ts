import { Subscription } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IChatMessageEvent } from '@rt/message-bus-api/chat/api';
import { IChatSubscription } from '@rt/message-bus-api/chat/util';

import { ChatSubscribersService, IChatFrame } from './chat-subscribers.service';

/** Минута, от которой считаются все остальные: часы машины в спеке не читаются. */
const AT: Date = new Date('2026-09-20T10:00:00.000Z');

/** Сколько ждёт сердцебиение в спеке: полминуты приёмника здесь ничего не проверяет. */
const BEAT_MS: number = 50;

/** Кадр сердцебиения, каким его ждёт экран. */
const BEAT: IChatFrame = { type: 'beat', data: '' };

/** Реплика, какой она уходит подписчикам. */
function remark(conversationId: string, text: string): IChatMessageEvent {
    return { conversationId, messageId: `message-of-${conversationId}`, side: 'visitor', text, takenAt: AT.toISOString() };
}

/** Открытый поток и всё, что в него пришло: спека читает кадры списком. */
interface IWatched {
    readonly frames: IChatFrame[];
    readonly open: Subscription;
}

describe('ChatSubscribersService', () => {
    let subscribers: ChatSubscribersService;

    /** Подписаться и складывать кадры. */
    function watch(subscription: IChatSubscription): IWatched {
        const frames: IChatFrame[] = [];
        const open: Subscription = subscribers.stream(subscription, BEAT_MS).subscribe((frame: IChatFrame): void => {
            frames.push(frame);
        });

        return { frames, open };
    }

    beforeEach((): void => {
        vi.useFakeTimers();
        subscribers = new ChatSubscribersService();
    });

    afterEach((): void => {
        vi.useRealTimers();
    });

    it('реплика доходит до подписки своей переписки и не доходит до соседней', () => {
        const own: IWatched = watch({ conversationId: 'talk-1', siteIds: [] });
        const foreign: IWatched = watch({ conversationId: 'talk-2', siteIds: [] });

        subscribers.send({ conversationId: 'talk-1', siteId: 'site-1' }, remark('talk-1', 'здравствуйте'));

        expect(own.frames).toEqual([{ data: remark('talk-1', 'здравствуйте') }]);
        expect(foreign.frames).toEqual([]);

        own.open.unsubscribe();
        foreign.open.unsubscribe();
    });

    it('SC-CH-33 — пока событий нет, служба шлёт сердцебиение', () => {
        const watched: IWatched = watch({ conversationId: 'talk-1', siteIds: [] });

        vi.advanceTimersByTime(BEAT_MS * 2);

        expect(watched.frames).toEqual([BEAT, BEAT]);
        expect(watched.open.closed).toBe(false);
        expect(subscribers.openCount).toBe(1);

        watched.open.unsubscribe();
    });

    it('SC-CH-34 — закрытый поток событий больше не получает, и подписчик не хранится', () => {
        const watched: IWatched = watch({ conversationId: 'talk-1', siteIds: [] });

        subscribers.send({ conversationId: 'talk-1', siteId: 'site-1' }, remark('talk-1', 'до закрытия'));

        // положительная пара к утверждению об отсутствии: до закрытия кадры доходили
        expect(watched.frames).toHaveLength(1);
        expect(subscribers.openCount).toBe(1);

        watched.open.unsubscribe();
        subscribers.send({ conversationId: 'talk-1', siteId: 'site-1' }, remark('talk-1', 'после закрытия'));

        expect(watched.frames).toHaveLength(1);
        expect(subscribers.openCount).toBe(0);
    });

    it('оператор получает события своих сайтов, а не оператор — ни одного', () => {
        const operator: IWatched = watch({ conversationId: null, siteIds: ['site-1'] });
        const nobody: IWatched = watch({ conversationId: null, siteIds: [] });

        subscribers.send({ conversationId: 'talk-1', siteId: 'site-1' }, remark('talk-1', 'своя'));
        subscribers.send({ conversationId: 'talk-2', siteId: 'site-2' }, remark('talk-2', 'соседская'));

        expect(operator.frames).toEqual([{ data: remark('talk-1', 'своя') }]);
        expect(nobody.frames).toEqual([]);

        operator.open.unsubscribe();
        nobody.open.unsubscribe();
    });
});
