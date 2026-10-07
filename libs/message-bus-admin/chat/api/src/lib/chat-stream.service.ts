/**
 * Поток событий оператора с токеном Keycloak.
 *
 * Средство браузера для потока событий заголовков не передаёт, а приёмник читает токен только из
 * `Authorization`. Поэтому поток читается обычным запросом с телом-потоком: токен берётся у модуля
 * входа перед каждым подключением, и продлённый токен едет со следующим.
 *
 * Оборванный поток подключается заново через паузу, как это делает средство браузера: ответ
 * приёмника кончается при его перезапуске, и экран без переподключения молча перестал бы видеть
 * новые реплики.
 */
import { inject, Injectable } from '@angular/core';
import { RtAuthService } from '@rt-tools/auth-angular';
import { WINDOW } from '@rt-tools/core';
import { Observable, Subscriber } from 'rxjs';

/** Пауза перед повторным подключением оборванного потока. */
const RECONNECT_MS: number = 3000;

/** Граница события в потоке: пустая строка. */
const EVENT_BREAK: RegExp = /\r?\n\r?\n/;

/** Данные одного события: строки `data:` склеиваются переводом строки, как у средства браузера. */
export function eventData(block: string): string | null {
    const lines: string[] = block
        .split(/\r?\n/)
        .filter((line: string): boolean => line.startsWith('data:'))
        .map((line: string): string => line.slice(5).replace(/^ /, ''));

    return lines.length ? lines.join('\n') : null;
}

@Injectable({ providedIn: 'root' })
export class ChatStreamService {
    readonly #auth: RtAuthService = inject(RtAuthService);
    readonly #window: Window & typeof globalThis = inject(WINDOW) as Window & typeof globalThis;

    /** Данные событий потока по адресу. Отписка обрывает чтение и снимает повторное подключение. */
    public events(path: string): Observable<string> {
        return new Observable<string>((subscriber: Subscriber<string>): (() => void) => {
            const abort: AbortController = new this.#window.AbortController();
            let retry: number | null = null;

            const connect: () => Promise<void> = async (): Promise<void> => {
                try {
                    await this.#read(path, abort.signal, subscriber);
                } catch {
                    // Обрыв связи или отказ: поток подключается заново, а не кончается
                }
                if (!abort.signal.aborted) {
                    retry = this.#window.setTimeout((): void => void connect(), RECONNECT_MS);
                }
            };
            void connect();

            return (): void => {
                abort.abort();
                if (retry !== null) {
                    this.#window.clearTimeout(retry);
                }
            };
        });
    }

    async #read(path: string, signal: AbortSignal, subscriber: Subscriber<string>): Promise<void> {
        const token: string | null = await this.#auth.token();
        const headers: Record<string, string> = token ? { ...this.#auth.requestHeaders(token), accept: 'text/event-stream' } : {};
        const answer: Response = await this.#window.fetch(path, { headers, signal });
        if (!answer.ok || !answer.body) {
            return;
        }
        const reader: ReadableStreamDefaultReader<Uint8Array> = answer.body.getReader();
        const decoder: TextDecoder = new this.#window.TextDecoder();
        let buffer: string = '';
        for (;;) {
            const { done, value }: ReadableStreamReadResult<Uint8Array> = await reader.read();
            if (done) {
                return;
            }
            buffer += decoder.decode(value, { stream: true });
            const blocks: string[] = buffer.split(EVENT_BREAK);
            buffer = blocks.pop() ?? '';
            for (const block of blocks) {
                const data: string | null = eventData(block);
                if (data !== null) {
                    subscriber.next(data);
                }
            }
        }
    }
}
