import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { WINDOW } from '@rt-tools/core';
import { CHAT_EMBEDDED_ENTRY_PATH, CHAT_PAGE_SIGNATURE_ASKED, IChatEntryOpened, IChatPageSignature } from '@rt/message-bus-common';

import { chatPageNeedsSignature, chatPageRefusalWords, chatPageSignatureOf, ETalksEntry, IChatPageEntry } from './talks-entry.logic';

/**
 * Вход страницы: подпись потребителя меняется на признак страницы и живёт в памяти вкладки.
 *
 * Признак не кладётся ни в хранилище браузера, ни в адрес: закрытая вкладка кончает вход, так
 * сказано описанием, а адрес виден и в журналах, и в истории.
 *
 * Просроченный признак страница лечит сама: просит у встроившего свежую подпись тем же сообщением,
 * каким получила первую, и меняет её на новый признак. Человека при этом ни о чём не спрашивают —
 * он в это время читает переписку.
 *
 * Остальные отказы человеку и показываются словами: новая подпись их не исправит.
 */
@Injectable({ providedIn: 'root' })
export class TalksEntryService {
    readonly #http: HttpClient = inject(HttpClient);
    readonly #window: Window = inject(WINDOW);
    readonly #state: WritableSignal<ETalksEntry> = signal<ETalksEntry>(ETalksEntry.Going);
    readonly #sign: WritableSignal<string> = signal<string>('');
    readonly #words: WritableSignal<string> = signal<string>('');
    #entry: IChatPageEntry | null = null;

    /** Где стоит вход: идёт, открыт или отбит. */
    public readonly state: Signal<ETalksEntry> = this.#state.asReadonly();

    /** Признак страницы. Пусто — вход ещё не открыт или уже отбит. */
    public readonly sign: Signal<string> = this.#sign.asReadonly();

    /** Слова отказа для человека. Пусто — отказа не было. */
    public readonly refusalWords: Signal<string> = this.#words.asReadonly();

    /**
     * Начать вход: слушать сообщения встроившего и попросить первую подпись.
     *
     * Слушатель ставится раньше просьбы: ответ приходит сообщением, и поставленный после просьбы он
     * пропустил бы быстрый ответ. Чужой адрес отбивается сразу: сообщением с подписью иначе
     * прикинулась бы любая страница, открывшая рамку.
     */
    public start(entry: IChatPageEntry): void {
        this.#entry = entry;
        this.#window.addEventListener('message', (said: MessageEvent): void => {
            if (said.origin !== entry.host) {
                return;
            }

            const signature: IChatPageSignature | null = chatPageSignatureOf(said.data, entry.site);

            if (signature) {
                void this.open(signature);
            }
        });
        this.ask();
    }

    /** Попросить у встроившего свежую подпись. */
    public ask(): void {
        this.#state.set(ETalksEntry.Going);
        this.#window.parent.postMessage({ kind: CHAT_PAGE_SIGNATURE_ASKED, site: this.#entry?.site ?? '' }, this.#entry?.host ?? '');
    }

    /** Обменять подпись на признак страницы. */
    public async open(signature: IChatPageSignature): Promise<void> {
        const service: string = this.#entry?.service ?? '';

        try {
            const opened: IChatEntryOpened = await firstValueFrom(
                this.#http.post<IChatEntryOpened>(`${service}${CHAT_EMBEDDED_ENTRY_PATH}`, signature)
            );

            this.#sign.set(opened.sign);
            this.#words.set('');
            this.#state.set(ETalksEntry.Opened);
        } catch (fault: unknown) {
            this.refused((fault as HttpErrorResponse)?.error);
        }
    }

    /**
     * Отказ операции страницы: истёкший признак лечится новой подписью, остальное — словами.
     *
     * Зовут его и операции экрана: признак истекает посреди чтения, и тогда страница берёт новый, а
     * человек видит одну строку о том, что вход устарел.
     */
    public refused(body: unknown): void {
        this.#sign.set('');
        this.#words.set(chatPageRefusalWords(body));
        this.#state.set(ETalksEntry.Refused);

        if (chatPageNeedsSignature(body)) {
            this.ask();
        }
    }
}
