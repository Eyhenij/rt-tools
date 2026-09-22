/**
 * Сам виджет: элемент страницы с теневым деревом внутри.
 *
 * Разметку он держит руками, а не каркасом: каркас приехал бы в каждую страницу каждого
 * потребителя, а показать здесь надо приветствие, ленту и поле набора.
 *
 * Переписка заводится первой репликой, а не открытием: открытый и брошенный виджет не заводит
 * ничего, иначе список оператора набивается разговорами, которых никто не писал. Признак
 * посетителя лежит в хранилище браузера: вернувшийся человек попадает в свою переписку, а не
 * начинает вторую.
 *
 * Решения — годность реплики, адрес сервиса, слово о часах — лежат рядом чистыми функциями и
 * проверяются вызовом: внутри элемента их проверял бы только поднятый браузер.
 */
import { CHAT_SIDE_VISITOR, ERefusal, IChatMessageRow, IChatSiteLookRow, IPage } from '@rt/message-bus-common';

import { askOwnFeed, askSiteLook, IWidgetSigns, sendRemark, startTalk, streamAddress, WidgetRefusal } from './chat-widget.api';
import {
    EWidgetHoursWord,
    widgetHoursText,
    widgetHoursWord,
    widgetSendable,
    widgetServiceOrigin,
    widgetStorageKey,
} from './chat-widget.logic';
import { WIDGET_STYLES } from './chat-widget.styles';
import { WIDGET_WORDS } from './chat-widget.words';

/** Имя тега: им страница потребителя ставит виджет. */
export const WIDGET_TAG: string = 'rt-chat-widget';

/** Признак тега с ключом площадки и признак с адресом сервиса. */
const SITE_ATTRIBUTE: string = 'site';
const SERVICE_ATTRIBUTE: string = 'service';

/** Кнопка сворачивания: она стоит в обеих раскладках панели. */
function closeButton(): string {
    return `<button aria-label="${WIDGET_WORDS.close}" data-act="close" type="button">×</button>`;
}

/** Слово об отказе: предел длины называет сервис, и он приезжает в ответе. */
function faultWord(error: unknown): string {
    if (error instanceof WidgetRefusal && error.code === ERefusal.ChatTextTooLong) {
        return `${WIDGET_WORDS.tooLong} (${error.params?.['limit'] ?? ''})`;
    }

    return WIDGET_WORDS.sendFailed;
}

/** Текст человека в разметку: страница потребителя чужая, и реплика в ней — чужой ввод. */
function escaped(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Адрес скрипта, которым виджет приехал на страницу. */
function scriptSource(): string {
    const current: HTMLOrSVGScriptElement | null = document.currentScript;

    if (current instanceof HTMLScriptElement && current.src) {
        return current.src;
    }

    return document.querySelector<HTMLScriptElement>('script[src*="widget"]')?.src ?? '';
}

/**
 * Адрес скрипта запоминается на выполнении файла, а не при встрече тега.
 *
 * `document.currentScript` называет скрипт виджета только в эту минуту. Когда тег ставит своим
 * скриптом сама страница — а так его и ставят, — тот же вопрос называет уже её скрипт, у
 * которого адреса нет вовсе: адрес сервиса свёлся бы к адресу страницы, и обращения ушли бы в
 * страницу. Пока сервис и страница стоят на одном адресе, разницы не видно.
 */
const SCRIPT_SOURCE: string = scriptSource();

/** Чтение хранилища браузера: закрытое хранилище — не отказ, а посетитель без признака. */
function read(key: string): string {
    try {
        return localStorage.getItem(key) ?? '';
    } catch {
        return '';
    }
}

/** Запись признака. Не записалась — разговор живёт до перезагрузки страницы, и это не отказ. */
function write(key: string, value: string): void {
    try {
        localStorage.setItem(key, value);
    } catch {
        return;
    }
}

export class ChatWidgetElement extends HTMLElement {
    readonly #root: ShadowRoot = this.attachShadow({ mode: 'open' });

    #signs: IWidgetSigns = { service: '', site: '', visitor: '', conversation: '' };
    #look: IChatSiteLookRow | null = null;
    #messages: IChatMessageRow[] = [];
    #open: boolean = false;
    #live: boolean = true;
    #fault: string = '';
    #stream: EventSource | null = null;

    public connectedCallback(): void {
        this.#signs = {
            service: widgetServiceOrigin(this.getAttribute(SERVICE_ATTRIBUTE) ?? '', SCRIPT_SOURCE),
            site: this.getAttribute(SITE_ATTRIBUTE) ?? '',
            visitor: read(widgetStorageKey(this.getAttribute(SITE_ATTRIBUTE) ?? '')),
            conversation: '',
        };

        this.#draw();
        void this.#look_up();
    }

    public disconnectedCallback(): void {
        this.#stream?.close();
        this.#stream = null;
    }

    /** Площадка: приветствие и часы. Отказ означает, что чата на этой странице нет. */
    async #look_up(): Promise<void> {
        try {
            this.#look = await askSiteLook(this.#signs.service, this.#signs.site);
            await this.#mine();
        } catch {
            this.#live = false;
        }

        this.#draw();
    }

    /** Своя переписка вернувшегося посетителя. Признака нет — читать нечего. */
    async #mine(): Promise<void> {
        if (!this.#signs.visitor) {
            return;
        }

        const talk: { conversationId: string; visitorToken: string } = await startTalk(
            this.#signs.service,
            this.#signs.site,
            this.#signs.visitor
        );

        this.#signs = { ...this.#signs, conversation: talk.conversationId, visitor: talk.visitorToken };

        const page: IPage<IChatMessageRow> = await askOwnFeed(this.#signs);

        this.#messages = [...page.rows];
        this.#listen();
    }

    /** Первая реплика заводит переписку, следующие идут в неё. */
    async #say(text: string): Promise<void> {
        if (!widgetSendable(text) || !this.#live) {
            return;
        }

        this.#fault = '';

        try {
            if (!this.#signs.conversation) {
                const talk: { conversationId: string; visitorToken: string } = await startTalk(
                    this.#signs.service,
                    this.#signs.site,
                    this.#signs.visitor
                );

                this.#signs = { ...this.#signs, conversation: talk.conversationId, visitor: talk.visitorToken };
                write(widgetStorageKey(this.#signs.site), talk.visitorToken);
                this.#listen();
            }

            const taken: { messageId: string; takenAt: string } = await sendRemark(this.#signs, text);

            this.#put({ text, id: taken.messageId, side: CHAT_SIDE_VISITOR, takenAt: taken.takenAt });
        } catch (error: unknown) {
            this.#fault = faultWord(error);
        }

        this.#draw();
    }

    /** Поток событий своей переписки: ответ оператора встаёт в ленту без перезагрузки. */
    #listen(): void {
        if (this.#stream || !this.#signs.conversation) {
            return;
        }

        this.#stream = new EventSource(streamAddress(this.#signs));
        this.#stream.addEventListener('message', (event: MessageEvent<string>): void => this.#arrived(event.data));
    }

    /** Пришедшая потоком реплика. */
    #arrived(raw: string): void {
        const event: IChatMessageRow & { messageId?: string } = JSON.parse(raw) as IChatMessageRow & { messageId?: string };

        this.#put({ id: event.messageId ?? event.id, side: event.side, text: event.text, takenAt: event.takenAt });
        this.#draw();
    }

    /**
     * Реплика в ленту, если её там ещё нет.
     *
     * Своя реплика приходит дважды: ответом операции и событием потока — сервис рассылает его
     * раньше, чем отвечает отправителю. Обе дороги ведут сюда, и лента остаётся одна.
     */
    #put(message: IChatMessageRow): void {
        if (this.#messages.some((one: IChatMessageRow): boolean => one.id === message.id)) {
            return;
        }

        this.#messages = [...this.#messages, message];
    }

    /** Разметка целиком: она короткая, и собирать её кусками дороже, чем нарисовать заново. */
    #draw(): void {
        this.#root.innerHTML = `<style>${WIDGET_STYLES}</style>${this.#open ? this.#panel() : this.#bubble()}`;
        this.#bind();
    }

    #bubble(): string {
        return `<button class="bubble" data-act="open" qa-dataid="widget-bubble" type="button">${WIDGET_WORDS.bubble}</button>`;
    }

    #panel(): string {
        if (!this.#live) {
            return `<div class="panel" qa-dataid="widget-panel"><div class="head"><span qa-dataid="widget-unavailable">${WIDGET_WORDS.unavailable}</span>${closeButton()}</div></div>`;
        }

        return `<div class="panel" qa-dataid="widget-panel">
            <div class="head">
                <span class="hours" qa-dataid="widget-hours">${this.#hours()}</span>
                ${closeButton()}
            </div>
            <div class="feed" data-part="feed" qa-dataid="widget-feed">${this.#feed()}</div>
            ${this.#fault ? `<div class="fault" data-part="fault" qa-dataid="widget-fault">${this.#fault}</div>` : ''}
            <form class="send" data-act="send">
                <input aria-label="${WIDGET_WORDS.placeholder}" data-part="text" placeholder="${WIDGET_WORDS.placeholder}" qa-dataid="widget-text" />
                <button qa-dataid="widget-send" type="submit">${WIDGET_WORDS.send}</button>
            </form>
        </div>`;
    }

    /** Лента или приветствие: до первой реплики показывать нечего, кроме слов площадки. */
    #feed(): string {
        if (this.#messages.length === 0) {
            return `<p class="greeting" data-part="greeting" qa-dataid="widget-greeting">${escaped(this.#look?.greeting ?? '')}</p>`;
        }

        return this.#messages
            .map(
                (message: IChatMessageRow): string => `<div class="message" data-side="${message.side}">
                    <span class="side">${message.side === CHAT_SIDE_VISITOR ? WIDGET_WORDS.sideVisitor : WIDGET_WORDS.sideOperator}</span>
                    <span data-part="text" qa-dataid="widget-message">${escaped(message.text)}</span>
                </div>`
            )
            .join('');
    }

    /** Слово о часах ответа: часы не названы — виджет о них молчит. */
    #hours(): string {
        if (!this.#look) {
            return '';
        }

        const word: EWidgetHoursWord = widgetHoursWord(this.#look);

        if (word === EWidgetHoursWord.Silent) {
            return '';
        }

        return `${word === EWidgetHoursWord.Answering ? WIDGET_WORDS.answering : WIDGET_WORDS.later} · ${widgetHoursText(this.#look)}`;
    }

    /** Нажатия: свернуть, развернуть и отправить. */
    #bind(): void {
        this.#root.querySelector('[data-act="open"]')?.addEventListener('click', (): void => {
            this.#open = true;
            this.#draw();
        });

        this.#root.querySelector('[data-act="close"]')?.addEventListener('click', (): void => {
            this.#open = false;
            this.#draw();
        });

        this.#root.querySelector('[data-act="send"]')?.addEventListener('submit', (event: Event): void => {
            event.preventDefault();

            const field: HTMLInputElement | null = this.#root.querySelector('[data-part="text"]');

            if (field) {
                void this.#say(field.value);
            }
        });
    }
}
