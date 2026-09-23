/**
 * Тег установки: рамка со страницей переписок внутри теневого дерева.
 *
 * Страницу скрипт с собой не везёт — она живёт у сервиса и открывается рамкой. Стили админки
 * потребителя и стили страницы тогда не встречаются вовсе, а каркас в чужую админку не приезжает.
 *
 * Подписи скрипт не считает: тайна площадки лежит у потребителя на сервере, и скрипт только
 * спрашивает подпись у названной признаком точки. Рамка просит её сообщением — первую при открытии
 * и следующую, когда признак истёк.
 *
 * Решения — разбор признаков, адрес рамки, чужое сообщение, ответ сервера — лежат рядом чистыми
 * функциями и проверяются вызовом: внутри элемента их проверял бы только поднятый браузер.
 */
import { CHAT_TAG_SERVICE_ATTRIBUTE, CHAT_TAG_SITE_ATTRIBUTE, IChatPageSignature } from '@rt/message-bus-common';

import {
    ITalksEmbed,
    talksEmbedAsksSignature,
    talksEmbedFrameSrc,
    talksEmbedOf,
    talksEmbedSignatureMessage,
    talksEmbedSignatureOf,
} from './talks-embed.logic';

/** Имя тега: им админка потребителя ставит раздел переписок. */
export const TALKS_TAG: string = 'rt-chat-talks';

/** Признаки тега, кроме общих с виджетом: точка выдачи подписи и путь страницы. */
const SIGN_URL_ATTRIBUTE: string = 'sign-url';
const PAGE_ATTRIBUTE: string = 'page';

/** Слово человеку, когда тег поставлен без ключа площадки или без точки выдачи подписи. */
const NOT_SET_UP: string = 'Раздел переписок не настроен';

/** Подпись рамки для читающих с экрана: рамка без неё зовётся просто рамкой. */
const FRAME_TITLE: string = 'Переписки';

/** Стили тега: рамка занимает его целиком, а размер тега назначает админка потребителя. */
const STYLES: string = `
    :host { display: block; block-size: 100%; min-block-size: 24rem; }
    iframe { inline-size: 100%; block-size: 100%; border: 0; }
    p { margin: 0; font: inherit; }
`;

/** Адрес скрипта, которым раздел приехал в админку. */
function scriptSource(): string {
    const current: HTMLOrSVGScriptElement | null = document.currentScript;

    if (current instanceof HTMLScriptElement && current.src) {
        return current.src;
    }

    return document.querySelector<HTMLScriptElement>('script[src*="talks"]')?.src ?? '';
}

/**
 * Адрес скрипта запоминается на выполнении файла, а не при встрече тега.
 *
 * `document.currentScript` называет скрипт раздела только в эту минуту. Когда тег ставит своим
 * скриптом сама админка — а так его и ставят, — тот же вопрос называет уже её скрипт, у которого
 * адреса нет вовсе: адрес сервиса свёлся бы к адресу админки, и рамка открылась бы в пустоту.
 */
const SCRIPT_SOURCE: string = scriptSource();

export class TalksEmbedElement extends HTMLElement {
    readonly #heard: (said: MessageEvent) => void;
    #embed: ITalksEmbed | null = null;
    #frame: HTMLIFrameElement | null = null;

    constructor() {
        super();
        this.#heard = (said: MessageEvent): void => {
            void this.#answer(said);
        };
    }

    /** Тег встретился в разметке: читаются признаки, ставится рамка и слушатель её просьб. */
    public connectedCallback(): void {
        const root: ShadowRoot = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
        const style: HTMLStyleElement = document.createElement('style');

        this.#embed = talksEmbedOf(
            {
                site: this.getAttribute(CHAT_TAG_SITE_ATTRIBUTE) ?? '',
                signUrl: this.getAttribute(SIGN_URL_ATTRIBUTE) ?? '',
                service: this.getAttribute(CHAT_TAG_SERVICE_ATTRIBUTE) ?? '',
                page: this.getAttribute(PAGE_ATTRIBUTE) ?? '',
            },
            SCRIPT_SOURCE
        );
        style.textContent = STYLES;
        root.replaceChildren(style);

        if (!this.#embed) {
            const word: HTMLParagraphElement = document.createElement('p');

            word.textContent = NOT_SET_UP;
            root.append(word);

            return;
        }

        this.#frame = document.createElement('iframe');
        this.#frame.title = FRAME_TITLE;
        this.#frame.src = talksEmbedFrameSrc(this.#embed, location.origin);
        root.append(this.#frame);
        window.addEventListener('message', this.#heard);
    }

    /** Тег ушёл из разметки: слушатель снимается, иначе он переживёт саму рамку. */
    public disconnectedCallback(): void {
        window.removeEventListener('message', this.#heard);
    }

    /**
     * Ответ на просьбу рамки о подписи.
     *
     * Чужое сообщение отбивается адресом отправителя и словом: иначе просьбой прикинулась бы любая
     * страница, открытая рядом. Подпись уходит в рамку и только в неё — адрес сервиса стоит вторым
     * доводом отправки.
     */
    async #answer(said: MessageEvent): Promise<void> {
        const embed: ITalksEmbed | null = this.#embed;
        const frame: Window | null = this.#frame?.contentWindow ?? null;

        if (!embed || !frame || said.origin !== embed.service || !talksEmbedAsksSignature(said.data, embed.site)) {
            return;
        }

        const signature: IChatPageSignature | null = await this.#signature(embed);

        if (signature) {
            frame.postMessage(talksEmbedSignatureMessage(signature), embed.service);
        }
    }

    /** Подпись у сервера потребителя. Отказ точки выдачи — молчание: о нём рамка скажет словами сама. */
    async #signature(embed: ITalksEmbed): Promise<IChatPageSignature | null> {
        try {
            const answer: Response = await fetch(embed.signUrl, { credentials: 'same-origin' });

            if (!answer.ok) {
                return null;
            }

            return talksEmbedSignatureOf(await answer.json(), embed.site);
        } catch {
            return null;
        }
    }
}
