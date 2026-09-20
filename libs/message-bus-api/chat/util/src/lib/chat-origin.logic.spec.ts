import { describe, expect, it } from 'vitest';

import { originAllowed, pageOrigin } from './chat-origin.logic';

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

    it('SC-CH-56 — адрес страницы берётся из «откуда пришёл», когда заголовка адреса нет', () => {
        expect(pageOrigin('https://shop.example', 'https://foreign.example/page')).toBe('https://shop.example');
        expect(pageOrigin('', 'https://shop.example/catalog?page=2')).toBe('https://shop.example');
        expect(pageOrigin('', '')).toBe('');
        expect(pageOrigin('', 'не адрес')).toBe('');
    });
});
