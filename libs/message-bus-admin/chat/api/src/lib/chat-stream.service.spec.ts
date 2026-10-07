import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RtAuthService } from '@rt-tools/auth-angular';
import { WINDOW } from '@rt-tools/core';
import { Subscription } from 'rxjs';

import { ChatStreamService, eventData } from './chat-stream.service';

describe('eventData', (): void => {
    it('склеивает строки данных одного события и пропускает служебные строки', (): void => {
        expect(eventData('event: message\ndata: {"a":1}')).toBe('{"a":1}');
        expect(eventData('data: первая\ndata: вторая')).toBe('первая\nвторая');
        expect(eventData(': живой')).toBeNull();
    });
});

describe('ChatStreamService', (): void => {
    /**
     * Ответ приёмника: тело-поток, отданное двумя кусками, граница события — посреди куска. Чтение
     * тела подменено: окружение спеки не держит потоков браузера.
     */
    function answerOf(chunks: readonly string[]): Response {
        const left: Uint8Array[] = chunks.map((chunk: string): Uint8Array => new TextEncoder().encode(chunk));
        const reader: Pick<ReadableStreamDefaultReader<Uint8Array>, 'read'> = {
            read: (): Promise<ReadableStreamReadResult<Uint8Array>> => {
                const value: Uint8Array | undefined = left.shift();

                return Promise.resolve(value ? { done: false, value } : { done: true, value: undefined });
            },
        };

        return { ok: true, body: { getReader: () => reader } } as unknown as Response;
    }

    it('несёт токен входа в заголовке и отдаёт данные каждого события', async (): Promise<void> => {
        const calls: { path: string; headers: Record<string, string> }[] = [];
        const fetch: (path: string, init: { headers: Record<string, string> }) => Promise<Response> = (
            path: string,
            init: { headers: Record<string, string> }
        ): Promise<Response> => {
            calls.push({ path, headers: init.headers });

            return Promise.resolve(answerOf(['data: {"n":1}\n\nda', 'ta: {"n":2}\n\n']));
        };
        TestBed.configureTestingModule({
            providers: [
                provideZonelessChangeDetection(),
                {
                    provide: WINDOW,
                    useValue: {
                        fetch,
                        AbortController,
                        TextDecoder: class {
                            public decode(value: Uint8Array): string {
                                return Buffer.from(value).toString('utf8');
                            }
                        },
                        setTimeout: (): number => 0,
                        clearTimeout: (): void => undefined,
                    },
                },
                {
                    provide: RtAuthService,
                    useValue: {
                        token: (): Promise<string> => Promise.resolve('jwt'),
                        requestHeaders: (token: string): Record<string, string> => ({ authorization: `Bearer ${token}` }),
                    },
                },
            ],
        });
        const seen: string[] = [];
        const subscription: Subscription = TestBed.inject(ChatStreamService)
            .events('/api/chat/conversations/stream')
            .subscribe((data: string): number => seen.push(data));

        await new Promise((resolve: (value: unknown) => void): void => void setTimeout(resolve, 20));
        subscription.unsubscribe();

        expect(calls[0]).toEqual({
            path: '/api/chat/conversations/stream',
            headers: { authorization: 'Bearer jwt', accept: 'text/event-stream' },
        });
        expect(seen).toEqual(['{"n":1}', '{"n":2}']);
    });
});
