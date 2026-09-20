import { describe, expect, it } from 'vitest';

import { originAllowed } from './chat-origin.logic';

describe('originAllowed', () => {
    it('SC-CH-5 — адрес страницы вне списка сайта не проходит', () => {
        expect(originAllowed(['https://shop.example'], 'https://foreign.example')).toBe(false);
        expect(originAllowed(['https://shop.example'], 'https://shop.example')).toBe(true);
    });

    it('SC-CH-6 — пустой список отказывает любому адресу', () => {
        expect(originAllowed([], 'https://shop.example')).toBe(false);
    });

    it('хвостовой слэш и регистр разницей не считаются', () => {
        expect(originAllowed(['https://Shop.Example/'], 'https://shop.example')).toBe(true);
    });

    it('обращение без адреса страницы не проходит даже при заполненном списке', () => {
        expect(originAllowed(['https://shop.example'], '')).toBe(false);
    });
});
