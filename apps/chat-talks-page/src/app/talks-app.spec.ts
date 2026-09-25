/**
 * Экран переписок: список, лента выбранного разговора, ответ и закрытие.
 *
 * Компонент поднимается без рисования: части набора он зовёт готовые, и проверять их рисование
 * значило бы проверять набор. Здесь проверяется своё — что приезжает частям набора и какие
 * обращения уходят сервису. Как это выглядит, отвечают глаза в браузере, а не спека.
 *
 * Обращения идут настоящие, ответы подставляет проверочный слой запросов: подставленная служба
 * обращений проверяла бы саму подстановку, и адрес запроса — а в нём вся сцена о ключе площадки —
 * не проверялся бы вовсе.
 */
import { HttpRequest } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { EnvironmentInjector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IRtWorkspaceDetails } from '@rt-tools/ui-kit-v2';
import { IRtChat } from '@rt-tools/ui-kit-v2/rich-editor';
import { WINDOW } from '@rt-tools/core';
import { IChatKitTalkRow } from '@rt/message-bus-admin/chat/util';
import {
    CHAT_EMBEDDED_ENTRY_PATH,
    CHAT_EMBEDDED_PATH,
    CHAT_PAGE_SIGNATURE_KIND,
    EChatTalkState,
    IChatMessageRow,
    IChatTalkRow,
    IPage,
} from '@rt/message-bus-common';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { TalksApp } from './talks-app';
import { TALKS_WORDS } from './talks-words';

/** Ключ площадки, с которым страницу встроили. */
const KEY: string = 'live-key';

/** Адрес админки потребителя: оттуда приезжает подпись. */
const HOST: string = 'https://admin.shop.example';

/** Адрес сервиса: его называет адрес рамки. */
const SERVICE: string = 'https://bus.example';

/** Признак страницы: сервис даёт его в обмен на подпись. */
const SIGN: string = 'знак-страницы';

/** Разговор списка. */
function talkRow(fields: Partial<IChatTalkRow> = {}): IChatTalkRow {
    return {
        id: 'talk-1',
        siteId: 'site-1',
        state: EChatTalkState.Live,
        lastMessageAt: '2026-09-23T09:00:00.000Z',
        lastMessage: 'Доставка есть?',
        lastMessageSide: 'visitor',
        ...fields,
    };
}

/** Реплика ленты. */
function messageRow(fields: Partial<IChatMessageRow> = {}): IChatMessageRow {
    return { id: 'msg-1', side: 'visitor', text: 'Доставка есть?', takenAt: '2026-09-23T09:00:00.000Z', ...fields };
}

/** Страница ответа сервиса. */
function pageOf<T>(rows: readonly T[]): IPage<T> {
    return { rows: [...rows], total: rows.length, page: 1, size: rows.length };
}

describe('экран встраиваемой страницы переписок', (): void => {
    let http: HttpTestingController;
    let app: TalksApp;
    /** Слушатель сообщений встроившей админки: его ставит служба входа. */
    let heard: ((said: MessageEvent) => void) | null = null;

    /** Окно страницы: адрес рамки и обмен сообщениями с встроившей админкой. */
    function windowOf(): Window {
        return {
            location: { search: `?site=${KEY}&host=${HOST}&service=${SERVICE}`, origin: SERVICE },
            parent: { postMessage: (): void => undefined },
            addEventListener: (kind: string, listener: (said: MessageEvent) => void): void => {
                if (kind === 'message') {
                    heard = listener;
                }
            },
        } as unknown as Window;
    }

    /** Дождаться обещаний входа: обмен подписи идёт обещанием, а не потоком. */
    async function settled(): Promise<void> {
        await new Promise<void>((done: () => void): void => {
            setTimeout(done);
        });
        TestBed.tick();
    }

    /** Подпись приезжает сообщением встроившей админки и меняется на признак страницы. */
    async function signedIn(): Promise<void> {
        heard?.({
            origin: HOST,
            data: { kind: CHAT_PAGE_SIGNATURE_KIND, site: KEY, at: 1_780_000_000_000, signature: 'подпись' },
        } as MessageEvent);
        http.expectOne(`${SERVICE}${CHAT_EMBEDDED_ENTRY_PATH}`).flush({ sign: SIGN, expiresAt: '2026-09-23T10:00:00.000Z' });
        await settled();
    }

    /** Ушедшее чтение списка переписок. */
    function talksRead(): TestRequest {
        return http.expectOne(
            (request: HttpRequest<unknown>): boolean => request.method === 'GET' && request.url === `${SERVICE}${CHAT_EMBEDDED_PATH}`
        );
    }

    /** Ушедшее чтение ленты разговора. */
    function feedRead(talkId: string): TestRequest {
        return http.expectOne(
            (request: HttpRequest<unknown>): boolean => request.url === `${SERVICE}${CHAT_EMBEDDED_PATH}/${talkId}/messages`
        );
    }

    beforeEach((): void => {
        heard = null;
        TestBed.configureTestingModule({
            providers: [
                provideZonelessChangeDetection(),
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: WINDOW, useValue: windowOf() },
            ],
        });

        http = TestBed.inject(HttpTestingController);
        app = runInInjectionContext(TestBed.inject(EnvironmentInjector), (): TalksApp => new TalksApp());
        app.ngOnInit();
    });

    afterEach((): void => {
        http.verify();
        TestBed.resetTestingModule();
    });

    it('SC-CH-91 — чтение списка едет признаком страницы, площадка в запросе не названа', async (): Promise<void> => {
        await signedIn();

        const read: TestRequest = talksRead();

        expect(read.request.params.get('sign')).toBe(SIGN);
        expect(read.request.params.get('site')).toBeNull();
        expect(read.request.urlWithParams).not.toContain(KEY);
        read.flush(pageOf([talkRow()]));
    });

    it('SC-CH-89 — под живым признаком встают список, лента выбранного разговора и ответ', async (): Promise<void> => {
        await signedIn();
        talksRead().flush(pageOf([talkRow(), talkRow({ id: 'talk-2', lastMessage: 'Где заказ?' })]));

        expect(app.talkRows().map((row: IChatKitTalkRow): string => row.id)).toEqual(['talk-1', 'talk-2']);
        // положительная пара к ленте: до выбора разговора её нет вовсе
        expect(app.thread()).toEqual([]);

        app.choose('talk-1');
        feedRead('talk-1').flush(pageOf([messageRow()]));

        expect(app.thread().map((message: IRtChat.Message): string => message.text)).toEqual(['Доставка есть?']);

        app.send({ text: 'Да, привезём завтра' });

        const spoken: TestRequest = http.expectOne(`${SERVICE}${CHAT_EMBEDDED_PATH}/talk-1/messages`);

        expect(spoken.request.body).toEqual({ sign: SIGN, text: 'Да, привезём завтра' });
        spoken.flush(messageRow({ id: 'msg-2', side: 'operator', text: 'Да, привезём завтра' }));

        expect(app.thread().map((message: IRtChat.Message): boolean => message.own)).toEqual([false, true]);
        expect(app.thread()[1].author).toBe(TALKS_WORDS.sideOperator);
    });

    it('SC-CH-90 — закрытие разговора уходит операцией, и список перечитывается закрытым', async (): Promise<void> => {
        await signedIn();
        talksRead().flush(pageOf([talkRow()]));
        app.choose('talk-1');
        feedRead('talk-1').flush(pageOf([messageRow()]));

        // действие живого разговора зовёт закрыть его, и стоит оно в подробностях
        expect(app.talkActions().map((action: IRtWorkspaceDetails.Action): string => action.label)).toEqual([TALKS_WORDS.close]);

        app.changeState(app.talkActions()[0].id);

        const changed: TestRequest = http.expectOne(`${SERVICE}${CHAT_EMBEDDED_PATH}/talk-1/state`);

        expect(changed.request.body).toEqual({ sign: SIGN, state: EChatTalkState.Closed });
        changed.flush({ state: EChatTalkState.Closed });
        talksRead().flush(pageOf([talkRow({ state: EChatTalkState.Closed })]));

        expect(app.talk()?.state).toBe(EChatTalkState.Closed);
        expect(app.talkActions().map((action: IRtWorkspaceDetails.Action): string => action.label)).toEqual([TALKS_WORDS.reopen]);
    });
});
