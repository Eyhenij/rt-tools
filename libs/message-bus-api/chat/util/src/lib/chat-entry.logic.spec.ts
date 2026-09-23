import { describe, expect, it } from 'vitest';

import {
    CHAT_ENTRY_SIGN_LIFETIME_MS,
    CHAT_ENTRY_SIGNATURE_SPREAD_MS,
    chatEntryMinuteFits,
    chatEntrySignature,
    chatEntrySignatureFits,
    chatEntrySignExpired,
    chatEntrySignFits,
    chatEntrySignMake,
    chatEntrySignRead,
    IChatEntrySign,
} from './chat-entry.logic';

/** Тайна площадки, её ключ и номер: от них отличаются все случаи ниже. */
const SECRET: string = 'тайна площадки';
const KEY: string = 'site-key-один';
const SITE: string = 'site-один';

/** Минута, от которой считаются все случаи. Твёрдая: и подпись, и проверка берут её же. */
const NOW: number = 1_780_000_000_000;

describe('вход встраиваемой страницы', () => {
    it('SC-CH-83 — подпись сходится с той же тайной, ключом и минутой', () => {
        const made: string = chatEntrySignature(SECRET, KEY, NOW);

        expect(made).toMatch(/^[0-9a-f]{64}$/);
        expect(chatEntrySignatureFits(SECRET, KEY, NOW, made)).toBe(true);
    });

    it('SC-CH-84 — подпись чужой тайной не сходится', () => {
        const alien: string = chatEntrySignature('чужая тайна', KEY, NOW);

        expect(chatEntrySignatureFits(SECRET, KEY, NOW, alien)).toBe(false);
        // подпись другой длины отбивается тем же местом: сравнение постоянным временем ждёт равных
        expect(chatEntrySignatureFits(SECRET, KEY, NOW, 'коротко')).toBe(false);
    });

    it('SC-CH-84 — подпись того же сайта за другую минуту не сходится', () => {
        const other: string = chatEntrySignature(SECRET, KEY, NOW + 1000);

        expect(chatEntrySignatureFits(SECRET, KEY, NOW, other)).toBe(false);
    });

    it('SC-CH-85 — минута внутри допуска годится, вне допуска — нет', () => {
        expect(chatEntryMinuteFits(NOW, NOW)).toBe(true);
        expect(chatEntryMinuteFits(NOW - CHAT_ENTRY_SIGNATURE_SPREAD_MS, NOW)).toBe(true);
        // часы потребителя могут спешить: допуск считается в обе стороны
        expect(chatEntryMinuteFits(NOW + CHAT_ENTRY_SIGNATURE_SPREAD_MS, NOW)).toBe(true);
        expect(chatEntryMinuteFits(NOW - CHAT_ENTRY_SIGNATURE_SPREAD_MS - 1, NOW)).toBe(false);
        expect(chatEntryMinuteFits(NOW + CHAT_ENTRY_SIGNATURE_SPREAD_MS + 1, NOW)).toBe(false);
    });

    it('SC-CH-87 — признак страницы несёт свой сайт и минуту конца', () => {
        const sign: string = chatEntrySignMake(SECRET, SITE, NOW);
        const read: IChatEntrySign | null = chatEntrySignRead(sign);

        expect(read).toEqual({ siteId: SITE, expiresAt: NOW + CHAT_ENTRY_SIGN_LIFETIME_MS });
        expect(chatEntrySignFits(SECRET, sign)).toBe(true);
        expect(chatEntrySignFits('чужая тайна', sign)).toBe(false);
    });

    it('SC-CH-87 — испорченный признак не читается и не сходится', () => {
        const noMinute: string = `${Buffer.from('без-минуты', 'utf8').toString('base64url')}.подпись`;

        // сначала положительная пара: целый признак читается — иначе проверка отсутствия пуста
        expect(chatEntrySignRead(chatEntrySignMake(SECRET, SITE, NOW))).not.toBeNull();
        expect(chatEntrySignRead('')).toBeNull();
        expect(chatEntrySignRead('только-тело')).toBeNull();
        expect(chatEntrySignRead(noMinute)).toBeNull();
        expect(chatEntrySignFits(SECRET, 'только-тело')).toBe(false);
    });

    it('SC-CH-88 — признак годен до своей минуты и истекает на ней', () => {
        const sign: IChatEntrySign | null = chatEntrySignRead(chatEntrySignMake(SECRET, SITE, NOW));

        expect(sign).not.toBeNull();
        expect(chatEntrySignExpired(sign as IChatEntrySign, NOW)).toBe(false);
        // край принадлежит отказу: равная минута уже истекла
        expect(chatEntrySignExpired(sign as IChatEntrySign, NOW + CHAT_ENTRY_SIGN_LIFETIME_MS)).toBe(true);
    });
});
