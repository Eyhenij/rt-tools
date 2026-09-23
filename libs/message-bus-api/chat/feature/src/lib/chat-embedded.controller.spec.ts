import { ForbiddenException, HttpException, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';

import { OPERATION_ACCESS } from '@rt/message-bus-api/access/util';
import { IChatEntryOpened } from '@rt/message-bus-api/chat/api';
import {
    CHAT_ENTRY_SIGN_LIFETIME_MS,
    CHAT_ENTRY_SIGNATURE_SPREAD_MS,
    chatEntrySignature,
    chatEntrySignFits,
    chatEntrySignRead,
    IChatEntrySign,
} from '@rt/message-bus-api/chat/util';
import { ERefusal } from '@rt/message-bus-common';

import { ChatEmbeddedController, IChatEmbeddedRequest } from './chat-embedded.controller';
import { ChatPrismaDouble } from './chat.double';

/** Минута, от которой считаются все остальные: часы машины в спеке не читаются. */
const AT: Date = new Date('2026-09-20T10:00:00.000Z');

/** Тайна площадки и её ключ: ими потребитель подписывает вход. */
const SECRET: string = 'тайна площадки';
const KEY: string = 'live-key';

/** Обращение из админки потребителя: её адрес стоит в списке площадки. */
const ADMIN: IChatEmbeddedRequest = { headers: { origin: 'https://admin.shop.example' } };

/** Отказ вызова: принятый ответ превращается в исключение, чтобы обе дороги читались одинаково. */
async function refusalOf(call: Promise<IChatEntryOpened>): Promise<HttpException> {
    return call.then((): HttpException => new HttpException('вход открыт', 200)).catch((fault: HttpException): HttpException => fault);
}

/** Код отказа из тела ответа. */
function codeOf(refusal: HttpException): string {
    return String((refusal.getResponse() as Record<string, unknown>)['code']);
}

describe('ChatEmbeddedController', () => {
    let store: ChatPrismaDouble;
    let entry: ChatEmbeddedController;

    beforeEach((): void => {
        store = new ChatPrismaDouble();
        store.sites.push({
            id: 'site-1',
            spaceId: 'space-1',
            key: KEY,
            origins: ['https://shop.example', 'https://admin.shop.example'],
            enabled: true,
            hookSecret: SECRET,
        });
        entry = new ChatEmbeddedController(store.asPrisma());
    });

    it('SC-CH-83 — сошедшаяся подпись открывает страницу и отвечает признаком своего сайта', async (): Promise<void> => {
        const signature: string = chatEntrySignature(SECRET, KEY, AT.getTime());

        const opened: IChatEntryOpened = await entry.entry({ site: KEY, at: AT.getTime(), signature }, ADMIN, AT);
        const read: IChatEntrySign | null = chatEntrySignRead(opened.sign);

        expect(read).toEqual({ siteId: 'site-1', expiresAt: AT.getTime() + CHAT_ENTRY_SIGN_LIFETIME_MS });
        expect(chatEntrySignFits(SECRET, opened.sign)).toBe(true);
        expect(opened.expiresAt).toBe(new Date(AT.getTime() + CHAT_ENTRY_SIGN_LIFETIME_MS).toISOString());
    });

    it('SC-CH-83 — обращение без ключа площадки отвечает отказом о ключе', async (): Promise<void> => {
        const refusal: HttpException = await refusalOf(entry.entry({ at: AT.getTime(), signature: 'подпись' }, ADMIN, AT));

        expect(codeOf(refusal)).toBe(ERefusal.ChatSiteKeyEmpty);
    });

    it('SC-CH-83 — операция входа объявлена открытой: учётной записи приёмника у потребителя нет', () => {
        const declared: string | undefined = Reflect.getMetadata(OPERATION_ACCESS, entry.entry);

        // положительная пара к утверждению о метке: она читается вообще
        expect(declared).toBeDefined();
        expect(declared).toBe('public');
    });

    it('SC-CH-84 — подпись чужой тайной отвечает отказом входа и признака не выдаёт', async (): Promise<void> => {
        const alien: string = chatEntrySignature('чужая тайна', KEY, AT.getTime());

        const refusal: HttpException = await refusalOf(entry.entry({ site: KEY, at: AT.getTime(), signature: alien }, ADMIN, AT));

        expect(refusal).toBeInstanceOf(UnauthorizedException);
        expect(codeOf(refusal)).toBe(ERefusal.ChatEntryRejected);
    });

    it('SC-CH-84 — обращение без подписи вовсе отвечает тем же отказом', async (): Promise<void> => {
        // положительная пара: то же обращение с подписью проходит — иначе отказ нечем объяснить
        await expect(
            entry.entry({ site: KEY, at: AT.getTime(), signature: chatEntrySignature(SECRET, KEY, AT.getTime()) }, ADMIN, AT)
        ).resolves.toBeTruthy();

        const refusal: HttpException = await refusalOf(entry.entry({ site: KEY, at: AT.getTime() }, ADMIN, AT));

        expect(codeOf(refusal)).toBe(ERefusal.ChatEntryRejected);
    });

    it('SC-CH-85 — минута вне допуска отвечает отказом о возрасте подписи', async (): Promise<void> => {
        const stale: number = AT.getTime() - CHAT_ENTRY_SIGNATURE_SPREAD_MS - 1000;
        const signature: string = chatEntrySignature(SECRET, KEY, stale);

        const refusal: HttpException = await refusalOf(entry.entry({ site: KEY, at: stale, signature }, ADMIN, AT));

        expect(codeOf(refusal)).toBe(ERefusal.ChatEntryStale);
        // минута внутри допуска той же подписью проходит: отказ считает возраст, а не подпись
        const fresh: number = AT.getTime() - CHAT_ENTRY_SIGNATURE_SPREAD_MS;

        await expect(
            entry.entry({ site: KEY, at: fresh, signature: chatEntrySignature(SECRET, KEY, fresh) }, ADMIN, AT)
        ).resolves.toBeTruthy();
    });

    it('SC-CH-86 — неизвестный ключ отвечает тем же отказом, что и чужая подпись', async (): Promise<void> => {
        const key: string = 'нет-такого-ключа';
        const signature: string = chatEntrySignature(SECRET, key, AT.getTime());

        const refusal: HttpException = await refusalOf(entry.entry({ site: key, at: AT.getTime(), signature }, ADMIN, AT));

        expect(codeOf(refusal)).toBe(ERefusal.ChatEntryRejected);
    });

    it('SC-CH-86 — выключенная площадка отвечает так же, как неизвестный ключ', async (): Promise<void> => {
        store.sites.push({ id: 'site-off', spaceId: 'space-1', key: 'off-key', origins: [], enabled: false, hookSecret: SECRET });
        const signature: string = chatEntrySignature(SECRET, 'off-key', AT.getTime());

        const refusal: HttpException = await refusalOf(entry.entry({ site: 'off-key', at: AT.getTime(), signature }, ADMIN, AT));

        expect(codeOf(refusal)).toBe(ERefusal.ChatEntryRejected);
    });

    it('SC-CH-86 — площадка без тайны на страницу не пускает', async (): Promise<void> => {
        store.sites.push({ id: 'site-bare', spaceId: 'space-1', key: 'bare-key', origins: [], enabled: true, hookSecret: '' });
        const signature: string = chatEntrySignature('', 'bare-key', AT.getTime());

        const refusal: HttpException = await refusalOf(entry.entry({ site: 'bare-key', at: AT.getTime(), signature }, ADMIN, AT));

        expect(codeOf(refusal)).toBe(ERefusal.ChatEntryRejected);
    });

    it('SC-CH-83 — адрес не из списка площадки отбивается, а не названный вовсе проходит', async (): Promise<void> => {
        const signature: string = chatEntrySignature(SECRET, KEY, AT.getTime());
        const alien: IChatEmbeddedRequest = { headers: { origin: 'https://foreign.example' } };

        const refusal: HttpException = await refusalOf(entry.entry({ site: KEY, at: AT.getTime(), signature }, alien, AT));

        expect(refusal).toBeInstanceOf(ForbiddenException);
        expect(codeOf(refusal)).toBe(ERefusal.ChatOriginRejected);
        // обращение с сервера потребителя заголовка адреса не несёт, и отвечает за него подпись
        await expect(entry.entry({ site: KEY, at: AT.getTime(), signature }, {}, AT)).resolves.toBeTruthy();
    });
});
