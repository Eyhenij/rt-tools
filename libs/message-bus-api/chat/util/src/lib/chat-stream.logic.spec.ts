import { describe, expect, it } from 'vitest';

import { eventReaches, IChatSubscription } from './chat-stream.logic';

describe('eventReaches', () => {
    it('подписка посетителя видит свою переписку и не видит соседнюю', () => {
        const visitor: IChatSubscription = { conversationId: 'talk-1', siteIds: [] };

        expect(eventReaches(visitor, { conversationId: 'talk-1', siteId: 'site-1' })).toBe(true);
        expect(eventReaches(visitor, { conversationId: 'talk-2', siteId: 'site-1' })).toBe(false);
    });

    it('подписка оператора видит события своих сайтов', () => {
        const operator: IChatSubscription = { conversationId: null, siteIds: ['site-1', 'site-3'] };

        expect(eventReaches(operator, { conversationId: 'talk-1', siteId: 'site-1' })).toBe(true);
        expect(eventReaches(operator, { conversationId: 'talk-2', siteId: 'site-2' })).toBe(false);
    });

    it('пустой набор сайтов не пропускает ни одного события', () => {
        const nobody: IChatSubscription = { conversationId: null, siteIds: [] };

        expect(eventReaches(nobody, { conversationId: 'talk-1', siteId: 'site-1' })).toBe(false);
    });

    it('признак переписки решает даже там, где сайт совпал', () => {
        const visitor: IChatSubscription = { conversationId: 'talk-1', siteIds: ['site-1'] };

        expect(eventReaches(visitor, { conversationId: 'talk-2', siteId: 'site-1' })).toBe(false);
    });
});
