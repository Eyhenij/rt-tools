import { describe, expect, it } from 'vitest';

import { CHAT_PAGE_SIGNATURE_KIND, chatPageEntryOf, chatPageSignatureOf, IChatPageEntry, IChatPageSignature } from './talks-entry.logic';

/** Ключ площадки, с которым страницу встроили. */
const KEY: string = 'live-key';

/** Минута подписи: часы машины в спеке не читаются. */
const AT: number = 1_780_000_000_000;

/** Целое сообщение с подписью: случаи ниже портят его по одному полю. */
function said(fields: Record<string, unknown> = {}): Record<string, unknown> {
    return { kind: CHAT_PAGE_SIGNATURE_KIND, site: KEY, at: AT, signature: 'подпись', ...fields };
}

describe('вход страницы переписок', () => {
    it('SC-CH-83 — ключ площадки и адрес сервиса приезжают адресом рамки', () => {
        const entry: IChatPageEntry | null = chatPageEntryOf('?site=live-key&service=https://bus.example');

        expect(entry).toEqual({ site: KEY, service: 'https://bus.example' });
    });

    it('SC-CH-83 — не названный адрес сервиса берётся оттуда, откуда приехала страница', () => {
        const entry: IChatPageEntry | null = chatPageEntryOf('?site=live-key', 'https://own.example');

        expect(entry).toEqual({ site: KEY, service: 'https://own.example' });
    });

    it('SC-CH-86 — адрес без ключа площадки не даёт входа вовсе', () => {
        // положительная пара: с ключом тот же разбор отвечает
        expect(chatPageEntryOf('?site=live-key')).not.toBeNull();
        expect(chatPageEntryOf('?service=https://bus.example')).toBeNull();
        expect(chatPageEntryOf('?site=%20%20')).toBeNull();
    });

    it('SC-CH-83 — сообщение с подписью читается словом, ключом и видом полей', () => {
        const signature: IChatPageSignature | null = chatPageSignatureOf(said(), KEY);

        expect(signature).toEqual({ site: KEY, at: AT, signature: 'подпись' });
    });

    it('SC-CH-84 — чужое сообщение подписью не считается', () => {
        // положительная пара: целое сообщение читается — иначе проверка отсутствия пуста
        expect(chatPageSignatureOf(said(), KEY)).not.toBeNull();
        expect(chatPageSignatureOf(said({ kind: 'чужое' }), KEY)).toBeNull();
        expect(chatPageSignatureOf(said({ site: 'чужой-ключ' }), KEY)).toBeNull();
        expect(chatPageSignatureOf(said({ at: 'не минута' }), KEY)).toBeNull();
        expect(chatPageSignatureOf(said({ signature: '  ' }), KEY)).toBeNull();
        expect(chatPageSignatureOf('строка', KEY)).toBeNull();
        expect(chatPageSignatureOf(null, KEY)).toBeNull();
    });
});
