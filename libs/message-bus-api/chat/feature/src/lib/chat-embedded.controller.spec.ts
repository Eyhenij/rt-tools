import { ForbiddenException, HttpException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';

import { OPERATION_ACCESS } from '@rt/message-bus-api/access/util';
import { IChatConversationListRow, IChatMessageListRow } from '@rt/message-bus-api/chat/data-access';
import {
    CHAT_ENTRY_SIGN_LIFETIME_MS,
    CHAT_ENTRY_SIGNATURE_SPREAD_MS,
    chatEntrySignature,
    chatEntrySignFits,
    chatEntrySignRead,
    IChatEntrySign,
} from '@rt/message-bus-api/chat/util';
import { EChatTalkState, ERefusal, IChatEntryOpened, IPage } from '@rt/message-bus-common';

import { ChatEmbeddedController, IChatEmbeddedRequest } from './chat-embedded.controller';
import { ChatHookSpy } from './chat-hook.double';
import { ChatSubscribersService } from './chat-subscribers.service';
import { ChatTalkService } from './chat-talk.service';
import { ChatPrismaDouble } from './chat.double';

/** Минута, от которой считаются все остальные: часы машины в спеке не читаются. */
const AT: Date = new Date('2026-09-20T10:00:00.000Z');

/** Тайна площадки и её ключ: ими потребитель подписывает вход. */
const SECRET: string = 'тайна площадки';
const KEY: string = 'live-key';

/** Обращение из админки потребителя: её адрес стоит в списке площадки. */
const ADMIN: IChatEmbeddedRequest = { headers: { origin: 'https://admin.shop.example' } };

/** Отказ вызова: принятый ответ превращается в исключение, чтобы обе дороги читались одинаково. */
async function refusalOf(call: Promise<unknown>): Promise<HttpException> {
    return call.then((): HttpException => new HttpException('вход открыт', 200)).catch((fault: HttpException): HttpException => fault);
}

/** Код отказа из тела ответа. */
function codeOf(refusal: HttpException): string {
    return String((refusal.getResponse() as Record<string, unknown>)['code']);
}

describe('ChatEmbeddedController', () => {
    let store: ChatPrismaDouble;
    let entry: ChatEmbeddedController;
    let hooks: ChatHookSpy;

    /** Переписка с последней репликой в названную минуту. */
    function talk(id: string, siteId: string, text: string, state: string = 'live'): void {
        store.conversations.push({ id, siteId, visitorId: `visitor-of-${id}`, lastMessageAt: AT, state });
        store.messages.push({ id: `message-of-${id}`, conversationId: id, side: 'visitor', text, takenAt: AT });
    }

    /** Признак страницы своего сайта, выданный в названную минуту. */
    async function signOf(at: Date = AT): Promise<string> {
        const opened: IChatEntryOpened = await entry.entry(
            { site: KEY, at: at.getTime(), signature: chatEntrySignature(SECRET, KEY, at.getTime()) },
            ADMIN,
            at
        );

        return opened.sign;
    }

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
        store.sites.push({ id: 'site-2', spaceId: 'space-1', key: 'other-key', origins: [], enabled: true, hookSecret: 'тайна соседа' });
        hooks = new ChatHookSpy();

        const subscribers: ChatSubscribersService = new ChatSubscribersService();

        entry = new ChatEmbeddedController(store.asPrisma(), new ChatTalkService(store.asPrisma(), subscribers, hooks));
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
    it('SC-CH-87 — под признаком страницы видны переписки своего сайта и не видны соседские', async (): Promise<void> => {
        talk('own', 'site-1', 'своя');
        talk('foreign', 'site-2', 'соседская');

        const page: IPage<IChatConversationListRow> = await entry.page({ sign: await signOf() }, AT);

        expect(page.rows.map((row: IChatConversationListRow): string => row.id)).toEqual(['own']);
        expect(page.total).toBe(1);
    });

    it('SC-CH-87 — переписка соседнего сайта отвечает как ненайденная', async (): Promise<void> => {
        talk('own', 'site-1', 'своя');
        talk('foreign', 'site-2', 'соседская');
        const sign: string = await signOf();

        // положительная пара: своя переписка тем же признаком читается
        await expect(entry.messages('own', { sign }, AT)).resolves.toBeTruthy();
        await expect(entry.messages('foreign', { sign }, AT)).rejects.toThrow(NotFoundException);
        await expect(entry.answer('foreign', { sign, text: 'чужому' }, AT)).rejects.toThrow(NotFoundException);
        expect(store.messages.filter((row: { conversationId: string }): boolean => row.conversationId === 'foreign')).toHaveLength(1);
    });

    it('SC-CH-87 — испорченный признак и подпись чужой тайной отвечают отказом входа', async (): Promise<void> => {
        const refusal: HttpException = await refusalOf(entry.page({ sign: 'только-тело' }, AT));

        expect(refusal).toBeInstanceOf(UnauthorizedException);
        expect(codeOf(refusal)).toBe(ERefusal.ChatEntryRejected);
    });

    it('SC-CH-87 — ответ со встраиваемой страницы пишется стороной оператора', async (): Promise<void> => {
        talk('own', 'site-1', 'вопрос посетителя');

        const answer: IChatMessageListRow = await entry.answer('own', { sign: await signOf(), text: 'ответ потребителя' }, AT);

        expect(answer.side).toBe('operator');
        expect(answer.text).toBe('ответ потребителя');
    });

    it('SC-CH-87 — закрытие разговора со страницы меняет состояние и уходит вызовом наружу', async (): Promise<void> => {
        talk('own', 'site-1', 'вопрос посетителя');

        await entry.state('own', { sign: await signOf(), state: EChatTalkState.Closed }, AT);
        // вызов уходит вслед за ответом: он его не держит
        await new Promise<void>((done: () => void): void => {
            setTimeout(done, 0);
        });

        expect(store.conversations.find((row: { id: string }): boolean => row.id === 'own')?.state).toBe(EChatTalkState.Closed);
        expect(hooks.said.map((call: { kind: string }): string => call.kind)).toEqual(['closing']);
    });

    it('SC-CH-88 — просроченный признак отвечает своим отказом, по которому страница берёт новый', async (): Promise<void> => {
        talk('own', 'site-1', 'своя');
        const sign: string = await signOf();
        const later: Date = new Date(AT.getTime() + CHAT_ENTRY_SIGN_LIFETIME_MS);

        // положительная пара: до своей минуты тот же признак работает
        await expect(entry.page({ sign }, AT)).resolves.toBeTruthy();

        const refusal: HttpException = await refusalOf(entry.page({ sign }, later));

        expect(codeOf(refusal)).toBe(ERefusal.ChatEntryExpired);
    });

    it('SC-CH-88 — просроченный признак закрывает и чтение сообщений, и ответ, и закрытие', async (): Promise<void> => {
        talk('own', 'site-1', 'своя');
        const sign: string = await signOf();
        const later: Date = new Date(AT.getTime() + CHAT_ENTRY_SIGN_LIFETIME_MS);

        await expect(entry.messages('own', { sign }, later)).rejects.toThrow(UnauthorizedException);
        await expect(entry.answer('own', { sign, text: 'поздний ответ' }, later)).rejects.toThrow(UnauthorizedException);
        await expect(entry.state('own', { sign, state: EChatTalkState.Closed }, later)).rejects.toThrow(UnauthorizedException);
        expect(store.messages).toHaveLength(1);
    });

    it('SC-CH-87 — названный в запросе чужой сайт признака не перебивает', async (): Promise<void> => {
        talk('own', 'site-1', 'своя');
        talk('foreign', 'site-2', 'соседская');

        // названный в запросе чужой сайт признак не перебивает: отбор идёт по нему одному
        const page: IPage<IChatConversationListRow> = await entry.page({ sign: await signOf(), site: 'site-2' }, AT);

        expect(page.rows.map((row: IChatConversationListRow): string => row.id)).toEqual(['own']);
    });
});
