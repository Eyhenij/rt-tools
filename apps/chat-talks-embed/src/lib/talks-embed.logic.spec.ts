import { CHAT_PAGE_SIGNATURE_ASKED, CHAT_PAGE_SIGNATURE_KIND, IChatPageSignature } from '@rt/message-bus-common';
import { describe, expect, it } from 'vitest';

import {
    ITalksEmbed,
    ITalksEmbedAttrs,
    TALKS_PAGE_PATH,
    talksEmbedAsksSignature,
    talksEmbedFrameSrc,
    talksEmbedOf,
    talksEmbedService,
    talksEmbedSignatureMessage,
    talksEmbedSignatureOf,
} from './talks-embed.logic';

/** Ключ площадки, с которым раздел поставили в админку. */
const KEY: string = 'live-key';

/** Адрес админки потребителя: в ней стоит тег. */
const HOST: string = 'https://admin.shop.example';

/** Адрес сервиса и адрес скрипта, которым раздел приехал. */
const SERVICE: string = 'https://bus.example';
const SCRIPT: string = `${SERVICE}/talks.js`;

/** Точка потребителя, которая выдаёт подпись. */
const SIGN_URL: string = '/internal/chat-sign';

/** Целые признаки тега: случаи ниже портят их по одному. */
function attrs(fields: Partial<ITalksEmbedAttrs> = {}): ITalksEmbedAttrs {
    return { site: KEY, signUrl: SIGN_URL, service: '', page: '', ...fields };
}

describe('установка встраиваемой страницы', (): void => {
    it('SC-CH-92 — тег с ключом площадки и точкой подписи даёт установку, адрес сервиса берётся у скрипта', (): void => {
        expect(talksEmbedOf(attrs(), SCRIPT)).toEqual({ site: KEY, service: SERVICE, signUrl: SIGN_URL, page: TALKS_PAGE_PATH });
    });

    it('SC-CH-92 — тег без ключа площадки или без точки подписи установки не даёт вовсе', (): void => {
        // положительная пара: с обоими тот же разбор отвечает
        expect(talksEmbedOf(attrs(), SCRIPT)).not.toBeNull();
        expect(talksEmbedOf(attrs({ site: '  ' }), SCRIPT)).toBeNull();
        expect(talksEmbedOf(attrs({ signUrl: '' }), SCRIPT)).toBeNull();
        expect(talksEmbedOf(attrs(), 'не адрес')).toBeNull();
    });

    it('SC-CH-92 — названный адрес сервиса сильнее адреса скрипта, и хвостовая косая снимается', (): void => {
        expect(talksEmbedService('https://chat.shop.example/', SCRIPT)).toBe('https://chat.shop.example');
        expect(talksEmbedService('  ', SCRIPT)).toBe(SERVICE);
        expect(talksEmbedService('', 'не адрес')).toBe('');
    });

    it('SC-CH-92 — адрес рамки несёт ключ площадки и адрес встроившей админки, и больше ничего', (): void => {
        const embed: ITalksEmbed = { site: KEY, service: SERVICE, signUrl: SIGN_URL, page: TALKS_PAGE_PATH };
        const src: string = talksEmbedFrameSrc(embed, HOST);

        expect(src).toBe(`${SERVICE}/talks/?site=${KEY}&host=${encodeURIComponent(HOST)}`);
        expect(src).not.toContain('sign');
    });

    it('SC-CH-92 — путь страницы, названный признаком тега, берётся вместо умолчания', (): void => {
        const embed: ITalksEmbed | null = talksEmbedOf(attrs({ page: '/переписки/' }), SCRIPT);

        expect(embed?.page).toBe('/переписки/');
    });

    it('SC-CH-93 — просьбой о подписи считается сообщение своим словом и своим ключом площадки', (): void => {
        expect(talksEmbedAsksSignature({ kind: CHAT_PAGE_SIGNATURE_ASKED, site: KEY }, KEY)).toBe(true);
        // положительная пара к отрицаниям стоит выше: иначе проверка отсутствия пуста
        expect(talksEmbedAsksSignature({ kind: 'чужое', site: KEY }, KEY)).toBe(false);
        expect(talksEmbedAsksSignature({ kind: CHAT_PAGE_SIGNATURE_ASKED, site: 'чужой-ключ' }, KEY)).toBe(false);
        expect(talksEmbedAsksSignature('строка', KEY)).toBe(false);
        expect(talksEmbedAsksSignature(null, KEY)).toBe(false);
    });

    it('SC-CH-93 — ответ сервера потребителя читается минутой и знаком, ключ площадки ставит скрипт', (): void => {
        expect(talksEmbedSignatureOf({ at: 1_780_000_000_000, signature: ' подпись ' }, KEY)).toEqual({
            site: KEY,
            at: 1_780_000_000_000,
            signature: 'подпись',
        });
        expect(talksEmbedSignatureOf({ at: 'не минута', signature: 'подпись' }, KEY)).toBeNull();
        expect(talksEmbedSignatureOf({ at: 1_780_000_000_000, signature: '  ' }, KEY)).toBeNull();
        expect(talksEmbedSignatureOf(null, KEY)).toBeNull();
    });

    it('SC-CH-93 — сообщение с подписью собрано так, как его ждёт рамка', (): void => {
        const signature: IChatPageSignature = { site: KEY, at: 1_780_000_000_000, signature: 'подпись' };

        expect(talksEmbedSignatureMessage(signature)).toEqual({
            kind: CHAT_PAGE_SIGNATURE_KIND,
            site: KEY,
            at: 1_780_000_000_000,
            signature: 'подпись',
        });
    });
});
