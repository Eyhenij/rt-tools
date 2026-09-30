/**
 * Сам виджет: элемент страницы с теневым деревом внутри.
 *
 * Разметку он держит руками, а не каркасом: каркас приехал бы в каждую страницу каждого
 * потребителя, а показать здесь надо список обращений, приветствие, ленту и поле набора.
 *
 * Переписка заводится первой репликой, а не открытием: открытый и брошенный виджет не заводит
 * ничего, иначе список оператора набивается разговорами, которых никто не писал. Признак
 * посетителя лежит в хранилище браузера: вернувшийся человек видит список своих обращений, а
 * новое заводит только кнопкой под ним.
 *
 * Решения — годность реплики, адрес сервиса, слово о часах, непрочитанность — лежат рядом чистыми
 * функциями и проверяются вызовом, а разметка частей — в соседнем файле вида.
 */
import {
    CHAT_SIDE_VISITOR,
    CHAT_TAG_SERVICE_ATTRIBUTE,
    CHAT_TAG_SITE_ATTRIBUTE,
    ERefusal,
    IChatMessageRow,
    IChatSiteLookRow,
    IChatVisitorTalkListRow,
    IPage,
} from '@rt/message-bus-common';

import { askOwnFeed, askSiteLook, askTalks, IWidgetSigns, sendRemark, startTalk, streamAddress, WidgetRefusal } from './chat-widget.api';
import { WIDGET_ICON_ARROW_UP, WIDGET_ICON_CLOCK, WIDGET_ICON_COMMENTS, WIDGET_ICON_INFO } from './chat-widget.icons';
import {
    EWidgetHoursWord,
    widgetHoursText,
    widgetHoursWord,
    widgetLastAuthor,
    widgetSeenKey,
    widgetSendable,
    widgetServiceOrigin,
    widgetStorageKey,
} from './chat-widget.logic';
import { WIDGET_STYLES } from './chat-widget.styles';
import { escaped, remarks, talkHead, talksList, titleHead } from './chat-widget.view';
import { WIDGET_WORDS } from './chat-widget.words';

/** Имя тега: им страница потребителя ставит виджет. */
export const WIDGET_TAG: string = 'rt-chat-widget';

/** Какой экран открыт в панели: список обращений или одно обращение. */
enum EWidgetScreen {
    Talks = 'talks',
    Talk = 'talk',
}

/** Слово об отказе: предел длины называет сервис, и он приезжает в ответе. */
function faultWord(error: unknown): string {
    if (error instanceof WidgetRefusal && error.code === ERefusal.ChatTextTooLong) {
        return `${WIDGET_WORDS.tooLong} (${error.params?.['limit'] ?? ''})`;
    }

    return WIDGET_WORDS.sendFailed;
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

/** Запись в хранилище. Не записалась — разговор живёт до перезагрузки страницы, и это не отказ. */
function write(key: string, value: string): void {
    try {
        localStorage.setItem(key, value);
    } catch {
        return;
    }
}

/** Минуты, когда посетитель видел обращения. Испорченная запись читается как пустая. */
function readSeen(key: string): Record<string, string> {
    try {
        const parsed: unknown = JSON.parse(read(key) || '{}');

        return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
    } catch {
        return {};
    }
}

export class ChatWidgetElement extends HTMLElement {
    readonly #root: ShadowRoot = this.attachShadow({ mode: 'open' });

    #signs: IWidgetSigns = { service: '', site: '', visitor: '', conversation: '' };
    #look: IChatSiteLookRow | null = null;
    #messages: IChatMessageRow[] = [];
    #talks: IChatVisitorTalkListRow[] = [];
    #seen: Record<string, string> = {};
    #screen: EWidgetScreen = EWidgetScreen.Talk;
    #open: boolean = false;
    #live: boolean = true;
    #fault: string = '';
    #stream: EventSource | null = null;

    public connectedCallback(): void {
        const site: string = this.getAttribute(CHAT_TAG_SITE_ATTRIBUTE) ?? '';

        this.#signs = {
            site,
            service: widgetServiceOrigin(this.getAttribute(CHAT_TAG_SERVICE_ATTRIBUTE) ?? '', SCRIPT_SOURCE),
            visitor: read(widgetStorageKey(site)),
            conversation: '',
        };
        this.#seen = readSeen(widgetSeenKey(site));

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
            await this.#home();
        } catch {
            this.#live = false;
        }

        this.#draw();
    }

    /**
     * Обращения вернувшегося посетителя. Признака нет — начинать с чистого разговора; признак
     * устарел — тоже: сервис его не знает, и узнать человека ему больше не по чему.
     */
    async #home(): Promise<void> {
        if (!this.#signs.visitor) {
            return;
        }

        try {
            this.#talks = await askTalks(this.#signs);
        } catch (error: unknown) {
            if (error instanceof WidgetRefusal && error.code === ERefusal.ChatConversationNotFound) {
                this.#signs = { ...this.#signs, visitor: '' };

                return;
            }

            throw error;
        }

        this.#screen = this.#talks.length > 0 ? EWidgetScreen.Talks : EWidgetScreen.Talk;
        this.#listen();
    }

    /** Открыть обращение из списка: его лента целиком, и ответы в нём прочитаны. */
    async #openTalk(id: string): Promise<void> {
        this.#signs = { ...this.#signs, conversation: id };
        this.#fault = '';

        const page: IPage<IChatMessageRow> = await askOwnFeed(this.#signs);

        this.#messages = [...page.rows];
        this.#screen = EWidgetScreen.Talk;
        this.#markSeen();
        this.#draw();
    }

    /** Назад к списку: он перечитывается, потому что пока посетитель писал, список мог поменяться. */
    async #back(): Promise<void> {
        this.#signs = { ...this.#signs, conversation: '' };
        this.#messages = [];
        this.#fault = '';
        this.#screen = EWidgetScreen.Talks;
        this.#talks = await askTalks(this.#signs).catch((): IChatVisitorTalkListRow[] => this.#talks);
        this.#draw();
    }

    /** Новое обращение: чистый разговор с приветствием, а заведёт его первая реплика. */
    #fresh(): void {
        this.#signs = { ...this.#signs, conversation: '' };
        this.#messages = [];
        this.#fault = '';
        this.#screen = EWidgetScreen.Talk;
        this.#draw();
    }

    /**
     * Первая реплика заводит переписку, следующие идут в неё.
     *
     * Посетитель с признаком и без открытой переписки пришёл сюда кнопкой «Новое обращение»:
     * заведение уходит с отметкой нового, иначе сервис вернул бы последнее обращение.
     */
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
                    this.#signs.visitor,
                    Boolean(this.#signs.visitor)
                );

                this.#signs = { ...this.#signs, conversation: talk.conversationId, visitor: talk.visitorToken };
                write(widgetStorageKey(this.#signs.site), talk.visitorToken);
                this.#listen();
            }

            const taken: { messageId: string; takenAt: string } = await sendRemark(this.#signs, text);
            const message: IChatMessageRow = { text, id: taken.messageId, side: CHAT_SIDE_VISITOR, takenAt: taken.takenAt };

            this.#put(message);
            // обращение сразу встаёт в список: стрелка назад к нему появляется без перезагрузки
            this.#touchTalk(this.#signs.conversation, message);
            this.#markSeen();
        } catch (error: unknown) {
            this.#fault = faultWord(error);
        }

        this.#draw();
    }

    /** Поток событий обращений посетителя: ответ встаёт в ленту или помечает строку списка. */
    #listen(): void {
        if (this.#stream || !this.#signs.visitor) {
            return;
        }

        this.#stream = new EventSource(streamAddress(this.#signs));
        this.#stream.addEventListener('message', (event: MessageEvent<string>): void => this.#arrived(event.data));
    }

    /**
     * Пришедшая потоком реплика.
     *
     * Реплика открытого обращения встаёт в ленту и сразу прочитана. Любая обновляет строку своего
     * обращения в списке: ответ туда, куда посетитель сейчас не смотрит, ставит точку.
     */
    #arrived(raw: string): void {
        const event: IChatMessageRow & { messageId?: string; conversationId: string } = JSON.parse(raw) as IChatMessageRow & {
            messageId?: string;
            conversationId: string;
        };
        const message: IChatMessageRow = {
            id: event.messageId ?? event.id,
            side: event.side,
            text: event.text,
            takenAt: event.takenAt,
            authorName: event.authorName ?? '',
        };

        if (this.#screen === EWidgetScreen.Talk && event.conversationId === this.#signs.conversation) {
            this.#put(message);
            this.#markSeen();
        }

        this.#touchTalk(event.conversationId, message);
        this.#draw();
    }

    /** Строка обращения в списке по пришедшей реплике. Нового обращения там ещё нет — оно встаёт первым. */
    #touchTalk(id: string, message: IChatMessageRow): void {
        const known: IChatVisitorTalkListRow | undefined = this.#talks.find((talk: IChatVisitorTalkListRow): boolean => talk.id === id);
        const touched: IChatVisitorTalkListRow = {
            id,
            state: known?.state ?? 'live',
            lastMessageAt: message.takenAt,
            lastMessage: message.text,
            lastMessageSide: message.side,
            operatorName: message.authorName || (known?.operatorName ?? ''),
            closedAt: known?.closedAt ?? null,
        };

        this.#talks = [touched, ...this.#talks.filter((talk: IChatVisitorTalkListRow): boolean => talk.id !== id)];
    }

    /** Открытое обращение прочитано до последней реплики: минута ложится рядом с признаком. */
    #markSeen(): void {
        const id: string = this.#signs.conversation;

        if (!id) {
            return;
        }

        this.#seen = { ...this.#seen, [id]: this.#messages.at(-1)?.takenAt ?? new Date().toISOString() };
        write(widgetSeenKey(this.#signs.site), JSON.stringify(this.#seen));
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
        return `<button aria-label="${WIDGET_WORDS.bubble}" class="bubble" data-act="open" qa-dataid="widget-bubble" type="button">${WIDGET_ICON_COMMENTS}</button>`;
    }

    #panel(): string {
        if (!this.#live) {
            return `<div class="panel" qa-dataid="widget-panel">
                ${titleHead(WIDGET_WORDS.bubble)}
                <div class="unavailable">
                    <span class="unavailable-icon">${WIDGET_ICON_COMMENTS}</span>
                    <span class="unavailable-title" qa-dataid="widget-unavailable">${WIDGET_WORDS.unavailable}</span>
                    <span class="unavailable-hint">${WIDGET_WORDS.unavailableHint}</span>
                </div>
            </div>`;
        }

        if (this.#screen === EWidgetScreen.Talks) {
            return `<div class="panel" qa-dataid="widget-panel">
                ${titleHead(WIDGET_WORDS.talks)}
                ${talksList(this.#talks, this.#seen, new Date())}
            </div>`;
        }

        return `<div class="panel" qa-dataid="widget-panel">
            ${this.#talkHead()}
            <div class="feed" data-part="feed" qa-dataid="widget-feed">${this.#feed()}</div>
            ${this.#fault ? `<div class="fault" data-part="fault" qa-dataid="widget-fault">${this.#fault}</div>` : ''}
            <form class="send" data-act="send">
                <div class="field" qa-dataid="widget-field">
                    <input aria-label="${WIDGET_WORDS.placeholder}" data-part="text" placeholder="${WIDGET_WORDS.placeholder}" qa-dataid="widget-text" />
                    <button aria-label="${WIDGET_WORDS.send}" qa-dataid="widget-send" type="submit">${WIDGET_ICON_ARROW_UP}</button>
                </div>
            </form>
        </div>`;
    }

    /**
     * Шапка обращения. До первой реплики — заголовок чата; дальше — кто отвечает. Стрелка назад
     * стоит, когда у посетителя есть список, куда вернуться.
     */
    #talkHead(): string {
        const back: boolean = this.#talks.length > 0;

        if (this.#messages.length === 0) {
            return titleHead(WIDGET_WORDS.bubble, back);
        }

        return talkHead(widgetLastAuthor(this.#messages), this.#hours(), back);
    }

    /**
     * Лента или приветствие.
     *
     * До первой реплики — карточка со словами площадки и часами ответа. В идущем разговоре часы
     * нужны только вне рабочего времени: тогда над лентой встаёт плашка о том, когда ответят.
     */
    #feed(): string {
        const hours: string = this.#hours();

        if (this.#messages.length === 0) {
            return `<div class="greeting">
                <p class="greeting-text" data-part="greeting" qa-dataid="widget-greeting">${escaped(this.#look?.greeting ?? '')}</p>
                ${hours ? `<span class="hours" qa-dataid="widget-hours"><span class="hours-icon">${WIDGET_ICON_CLOCK}</span>${hours}</span>` : ''}
            </div>`;
        }

        const later: boolean = this.#look !== null && widgetHoursWord(this.#look) === EWidgetHoursWord.Later;
        const note: string = later
            ? `<div class="note" qa-dataid="widget-hours"><span class="note-icon">${WIDGET_ICON_INFO}</span>${hours}</div>`
            : '';

        return note + remarks(this.#messages);
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

    /** Нажатия: свернуть, развернуть, отправить, открыть обращение, назад и новое обращение. */
    #bind(): void {
        this.#on('open', (): void => {
            this.#open = true;
            this.#draw();
        });
        this.#on('close', (): void => {
            this.#open = false;
            this.#draw();
        });
        this.#on('back', (): void => void this.#back());
        this.#on('fresh', (): void => this.#fresh());
        this.#root.querySelectorAll<HTMLElement>('[data-act="talk"]').forEach((row: HTMLElement): void => {
            row.addEventListener('click', (): void => void this.#openTalk(row.dataset['talk'] ?? ''));
        });

        this.#root.querySelector('[data-act="send"]')?.addEventListener('submit', (event: Event): void => {
            event.preventDefault();

            const field: HTMLInputElement | null = this.#root.querySelector('[data-part="text"]');

            if (field) {
                void this.#say(field.value);
            }
        });
    }

    /** Нажатие на кнопку по её действию. */
    #on(act: string, handler: () => void): void {
        this.#root.querySelector(`[data-act="${act}"]`)?.addEventListener('click', handler);
    }
}
