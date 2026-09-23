import { describe, expect, it } from 'vitest';

import { CHAT_PAGE_SIGNATURE_KIND, ERefusal, IChatPageSignature, refusalBody } from '@rt/message-bus-common';

import { chatPageEntryOf, chatPageNeedsSignature, chatPageRefusalWords, chatPageSignatureOf, IChatPageEntry } from './talks-entry.logic';

/** Ключ площадки, с которым страницу встроили. */
const KEY: string = 'live-key';

/** Адрес админки потребителя: с ним страница обменивается сообщениями. */
const HOST: string = 'https://admin.shop.example';

/** Адрес рамки, с которым страницу открыли. */
const FRAME: string = `?site=${KEY}&host=${HOST}`;

/** Минута подписи: часы машины в спеке не читаются. */
const AT: number = 1_780_000_000_000;

/** Целое сообщение с подписью: случаи ниже портят его по одному полю. */
function said(fields: Record<string, unknown> = {}): Record<string, unknown> {
    return { kind: CHAT_PAGE_SIGNATURE_KIND, site: KEY, at: AT, signature: 'подпись', ...fields };
}

describe('вход страницы переписок', () => {
    it('SC-CH-83 — ключ площадки, адрес сервиса и адрес админки приезжают адресом рамки', () => {
        const entry: IChatPageEntry | null = chatPageEntryOf(`${FRAME}&service=https://bus.example`);

        expect(entry).toEqual({ site: KEY, host: HOST, service: 'https://bus.example' });
    });

    it('SC-CH-83 — не названный адрес сервиса берётся оттуда, откуда приехала страница', () => {
        const entry: IChatPageEntry | null = chatPageEntryOf(FRAME, 'https://own.example');

        expect(entry).toEqual({ site: KEY, host: HOST, service: 'https://own.example' });
    });

    it('SC-CH-86 — адрес без ключа площадки или без адреса админки не даёт входа вовсе', () => {
        // положительная пара: с обоими тот же разбор отвечает
        expect(chatPageEntryOf(FRAME)).not.toBeNull();
        expect(chatPageEntryOf(`?host=${HOST}`)).toBeNull();
        expect(chatPageEntryOf('?site=live-key')).toBeNull();
        expect(chatPageEntryOf(`?site=%20%20&host=${HOST}`)).toBeNull();
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

    it('SC-CH-88 — просроченный признак лечится новой подписью, прочие отказы — нет', () => {
        expect(chatPageNeedsSignature(refusalBody(ERefusal.ChatEntryExpired))).toBe(true);
        // положительная пара к отрицанию: разбор тела отказа вообще работает
        expect(chatPageNeedsSignature(refusalBody(ERefusal.ChatEntryRejected))).toBe(false);
        expect(chatPageNeedsSignature(refusalBody(ERefusal.ChatEntryStale))).toBe(false);
        expect(chatPageNeedsSignature('не тело отказа')).toBe(false);
    });

    it('SC-CH-88 — отказ входа виден человеку словами, а не кодом', () => {
        expect(chatPageRefusalWords(refusalBody(ERefusal.ChatEntryExpired))).toBe('Вход устарел, обновите страницу');
        expect(chatPageRefusalWords(refusalBody(ERefusal.ChatEntryRejected))).toBe('Страница переписок не открылась');
        expect(chatPageRefusalWords(refusalBody(ERefusal.ChatEntryStale))).toBe('Страница переписок не открылась');
        // код, которого страница не знает, тоже отвечает словами
        expect(chatPageRefusalWords(refusalBody(ERefusal.ChatThrottled, { limit: 1, after: 1 }))).toBe('Страница переписок не открылась');
        expect(chatPageRefusalWords(null)).toBe('Страница переписок не открылась');
    });
});
