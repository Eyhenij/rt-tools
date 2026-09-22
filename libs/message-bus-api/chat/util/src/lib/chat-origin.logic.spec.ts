import { describe, expect, it } from 'vitest';

import { CHAT_CORS_HEADERS, CHAT_CORS_METHODS, chatCorsHeaders, originAllowed, pageOrigin } from './chat-origin.logic';

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

describe('chatCorsHeaders', () => {
    it('SC-CH-74 — адрес из списка площадки получает позволение на обращение', () => {
        const given: Readonly<Record<string, string>> | null = chatCorsHeaders(['https://shop.example'], 'https://shop.example', false);

        expect(given).toEqual({ 'access-control-allow-origin': 'https://shop.example' });
    });

    it('SC-CH-75 — адрес вне списка не получает ни одного заголовка позволения', () => {
        expect(chatCorsHeaders(['https://shop.example'], 'https://foreign.example', false)).toBeNull();
        expect(chatCorsHeaders(['https://shop.example'], 'https://foreign.example', true)).toBeNull();
    });

    it('SC-CH-76 — предварительный запрос отвечается тем же списком и называет способы обращения', () => {
        const given: Readonly<Record<string, string>> | null = chatCorsHeaders(['https://shop.example'], 'https://shop.example', true);

        expect(given).toEqual({
            'access-control-allow-origin': 'https://shop.example',
            'access-control-allow-methods': CHAT_CORS_METHODS,
            'access-control-allow-headers': CHAT_CORS_HEADERS,
            'access-control-max-age': '600',
        });
    });

    it('SC-CH-77 — позволение называет один адрес, а не любой', () => {
        const first: Readonly<Record<string, string>> | null = chatCorsHeaders(
            ['https://shop.example', 'https://blog.example'],
            'https://shop.example',
            false
        );
        const second: Readonly<Record<string, string>> | null = chatCorsHeaders(
            ['https://shop.example', 'https://blog.example'],
            'https://blog.example',
            false
        );

        expect(first?.['access-control-allow-origin']).toBe('https://shop.example');
        expect(second?.['access-control-allow-origin']).toBe('https://blog.example');
        expect(Object.values(first ?? {})).not.toContain('*');
    });
});
