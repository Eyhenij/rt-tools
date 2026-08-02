import { initToday } from './init-today.js';

describe(initToday.name, () => {
    it('should return today at local midnight', () => {
        const now: Date = new Date();
        const result: Date = initToday();

        expect(result.getFullYear()).toBe(now.getFullYear());
        expect(result.getMonth()).toBe(now.getMonth());
        expect(result.getDate()).toBe(now.getDate());
        expect(result.getHours()).toBe(0);
        expect(result.getMinutes()).toBe(0);
        expect(result.getSeconds()).toBe(0);
        expect(result.getMilliseconds()).toBe(0);
    });

    it('should return a fresh instance every call', () => {
        expect(initToday()).not.toBe(initToday());
    });
});
