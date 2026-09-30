import { describe, expect, it } from 'vitest';

import { eventReaches, IChatSubscription } from './chat-stream.logic';

describe('eventReaches', () => {
    it('подписка посетителя видит все свои обращения и не видит чужие', () => {
        const visitor: IChatSubscription = { visitorId: 'visitor-1', siteIds: [] };

        expect(eventReaches(visitor, { conversationId: 'talk-1', visitorId: 'visitor-1', siteId: 'site-1' })).toBe(true);
        expect(eventReaches(visitor, { conversationId: 'talk-2', visitorId: 'visitor-1', siteId: 'site-1' })).toBe(true);
        expect(eventReaches(visitor, { conversationId: 'talk-3', visitorId: 'visitor-2', siteId: 'site-1' })).toBe(false);
    });

    it('подписка оператора видит события своих сайтов', () => {
        const operator: IChatSubscription = { visitorId: null, siteIds: ['site-1', 'site-3'] };

        expect(eventReaches(operator, { conversationId: 'talk-1', visitorId: 'visitor-1', siteId: 'site-1' })).toBe(true);
        expect(eventReaches(operator, { conversationId: 'talk-2', visitorId: 'visitor-2', siteId: 'site-2' })).toBe(false);
    });

    it('пустой набор сайтов не пропускает ни одного события', () => {
        const nobody: IChatSubscription = { visitorId: null, siteIds: [] };

        expect(eventReaches(nobody, { conversationId: 'talk-1', visitorId: 'visitor-1', siteId: 'site-1' })).toBe(false);
    });

    it('признак посетителя решает даже там, где сайт совпал', () => {
        const visitor: IChatSubscription = { visitorId: 'visitor-1', siteIds: ['site-1'] };

        expect(eventReaches(visitor, { conversationId: 'talk-2', visitorId: 'visitor-2', siteId: 'site-1' })).toBe(false);
    });
});
