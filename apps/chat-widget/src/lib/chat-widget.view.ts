/**
 * Разметка частей виджета узлами: шапки, список обращений и лента.
 *
 * Лежит отдельно от элемента: элемент держит состояние и нажатия, а здесь только то, что из
 * состояния рисуется. Решения — непрочитанность, инициалы, слово о дне — берутся у чистых функций
 * рядом и здесь только расставляются по местам.
 *
 * Страница потребителя чужая, и всё, что приходит от людей и от сервиса, — чужой ввод. Поэтому
 * разметка не собирается строкой: узлы создаются по одному, текст ложится в `textContent`, а
 * значение признака — в `setAttribute`. Разметка внутри реплики или предела длины так и остаётся
 * текстом.
 */
import { CHAT_SIDE_VISITOR, EChatTalkState, IChatMessageRow, IChatVisitorTalkListRow } from '@rt/message-bus-common';

import {
    IWidgetIcon,
    WIDGET_ICON_ARROW_LEFT,
    WIDGET_ICON_ARROW_UP,
    WIDGET_ICON_CLOCK,
    WIDGET_ICON_CLOSE,
    WIDGET_ICON_COMMENTS,
    WIDGET_ICON_INFO,
    WIDGET_ICON_PLUS,
} from './chat-widget.icons';
import { widgetDayText, widgetFirstName, widgetInitials, widgetTimeText, widgetUnread } from './chat-widget.logic';
import { WIDGET_WORDS } from './chat-widget.words';

/** Ребёнок узла: узел, текст или ничего — пропущенная часть разметки. */
export type TWidgetChild = Node | string | null;

/** Узел с признаками и детьми. Текст ребёнка ложится текстом, а не разметкой. */
export function node(tag: string, attributes: Readonly<Record<string, string>>, ...children: readonly TWidgetChild[]): HTMLElement {
    const element: HTMLElement = document.createElement(tag);

    Object.entries(attributes).forEach(([name, value]: [string, string]): void => element.setAttribute(name, value));
    children.forEach((child: TWidgetChild): void => {
        if (child !== null) {
            element.append(child);
        }
    });

    return element;
}

/** Узел иконки по её контуру. */
function iconNode(icon: IWidgetIcon): SVGSVGElement {
    // пространство имён берётся у корня: без него узел создаётся как неизвестный элемент HTML
    const svg: SVGSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const group: Element = document.createElementNS(svg.namespaceURI, 'g');
    const path: Element = document.createElementNS(svg.namespaceURI, 'path');

    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('viewBox', '0 0 24 24');
    group.setAttribute('transform', icon.transform);
    path.setAttribute('d', icon.path);
    group.append(path);
    svg.append(group);

    return svg;
}

/** Крестик шапки: он один во всех её видах. */
function closeButton(): HTMLElement {
    return node(
        'button',
        { 'aria-label': WIDGET_WORDS.close, class: 'close', 'data-act': 'close', 'qa-dataid': 'widget-close', type: 'button' },
        iconNode(WIDGET_ICON_CLOSE)
    );
}

/** Стрелка назад к списку: стоит в шапке обращения, когда у посетителя есть список. */
function backButton(): HTMLElement {
    return node(
        'button',
        { 'aria-label': WIDGET_WORDS.back, class: 'close', 'data-act': 'back', 'qa-dataid': 'widget-back', type: 'button' },
        iconNode(WIDGET_ICON_ARROW_LEFT)
    );
}

/** Шапка с одним заголовком: у недоступного чата, у нового разговора и у списка. */
export function titleHead(title: string, back: boolean = false): HTMLElement {
    return node(
        'div',
        { class: 'head' },
        back ? backButton() : null,
        node('span', { class: 'title', 'qa-dataid': 'widget-title' }, title),
        closeButton()
    );
}

/** Круг аватара: инициалы сотрудника или общий значок поддержки, пока имени нет. */
function avatar(name: string, extra: string = ''): HTMLElement {
    return name
        ? node('span', { class: `avatar${extra}`, 'qa-dataid': 'widget-avatar' }, widgetInitials(name))
        : node('span', { class: `avatar avatar_support${extra}`, 'qa-dataid': 'widget-avatar' }, iconNode(WIDGET_ICON_COMMENTS));
}

/**
 * Шапка идущего обращения: кто отвечает.
 *
 * Названный ответ уже был — инициалы, имя и строка роли. Не было — общий значок, «Поддержка» и
 * часы ответа, чтобы посетитель знал, когда ждать.
 */
export function talkHead(author: string, hours: string, back: boolean): HTMLElement {
    const sub: string = author ? WIDGET_WORDS.role : hours;

    return node(
        'div',
        { class: 'head' },
        back ? backButton() : null,
        avatar(author, ' avatar_head'),
        node(
            'span',
            { class: 'person' },
            node('span', { class: 'title', 'qa-dataid': 'widget-title' }, author || WIDGET_WORDS.sideOperator),
            sub ? node('span', { class: 'role', 'qa-dataid': 'widget-role' }, sub) : null
        ),
        closeButton()
    );
}

/** Метка строки: точка непрочитанного ответа или «Закрыто». Закрытое обращение точки не ставит. */
function rowMark(talk: IChatVisitorTalkListRow, unread: boolean): HTMLElement | null {
    if (talk.state === EChatTalkState.Closed) {
        return node('span', { class: 'closed', 'qa-dataid': 'widget-talk-closed' }, WIDGET_WORDS.closedMark);
    }

    return unread ? node('span', { 'aria-label': WIDGET_WORDS.unread, class: 'dot', 'qa-dataid': 'widget-talk-unread' }) : null;
}

/** Строка обращения в списке. */
function talkRow(talk: IChatVisitorTalkListRow, seen: Readonly<Record<string, string>>, now: Date): HTMLElement {
    // закрытое обращение ответа не ждёт: его метка — «Закрыто», а не точка
    const unread: boolean = talk.state !== EChatTalkState.Closed && widgetUnread(talk, seen[talk.id] ?? '');

    return node(
        'button',
        { class: 'talk', 'data-act': 'talk', 'data-talk': talk.id, 'qa-dataid': 'widget-talk', type: 'button' },
        avatar(talk.operatorName),
        node(
            'span',
            { class: 'talk-body' },
            node(
                'span',
                { class: 'talk-line' },
                node('span', { class: 'talk-name' }, talk.operatorName || WIDGET_WORDS.sideOperator),
                node(
                    'span',
                    { class: unread ? 'talk-time talk-time_unread' : 'talk-time' },
                    widgetDayText(talk.lastMessageAt, now, WIDGET_WORDS.yesterday)
                )
            ),
            node(
                'span',
                { class: 'talk-line' },
                node('span', { class: 'talk-last', 'qa-dataid': 'widget-talk-last' }, talk.lastMessage),
                rowMark(talk, unread)
            )
        )
    );
}

/**
 * Список «Ваши обращения», свежие первыми, и кнопка нового обращения под ним.
 *
 * Минуты, когда посетитель видел обращения, и минута «сейчас» приезжают доводами: список рисуется
 * из них, а не из часов машины.
 */
export function talksList(talks: readonly IChatVisitorTalkListRow[], seen: Readonly<Record<string, string>>, now: Date): Node[] {
    return [
        node(
            'div',
            { class: 'talks', 'qa-dataid': 'widget-talks' },
            ...talks.map((talk: IChatVisitorTalkListRow): HTMLElement => talkRow(talk, seen, now))
        ),
        node(
            'div',
            { class: 'talks-foot' },
            node(
                'button',
                { class: 'fresh', 'data-act': 'fresh', 'qa-dataid': 'widget-new-talk', type: 'button' },
                node('span', { class: 'fresh-icon' }, iconNode(WIDGET_ICON_PLUS)),
                WIDGET_WORDS.newTalk
            )
        ),
    ];
}

/** Слово стороны в пузыре: у ответа — первое слово имени сотрудника, пока оно есть. */
function sideWord(message: IChatMessageRow): string {
    if (message.side === CHAT_SIDE_VISITOR) {
        return WIDGET_WORDS.sideVisitor;
    }

    return message.authorName ? widgetFirstName(message.authorName) : WIDGET_WORDS.sideOperator;
}

/** Пузыри ленты: сторона, текст и время. */
export function remarks(messages: readonly IChatMessageRow[]): HTMLElement[] {
    return messages.map((message: IChatMessageRow): HTMLElement =>
        node(
            'div',
            { class: 'message', 'data-side': message.side, 'qa-dataid': 'widget-remark' },
            node('span', { class: 'side', 'qa-dataid': 'widget-remark-side' }, sideWord(message)),
            node('span', { 'data-part': 'text', 'qa-dataid': 'widget-message' }, message.text),
            node('span', { class: 'time' }, widgetTimeText(message.takenAt))
        )
    );
}

/** Черта под лентой закрытого разговора. Минуты закрытия нет — черта стоит без неё. */
export function endedLine(closedAt: string): HTMLElement {
    const time: string = widgetTimeText(closedAt);

    return node(
        'div',
        { class: 'ended', 'qa-dataid': 'widget-ended' },
        node('span', { class: 'ended-rule' }),
        node('span', {}, time ? `${WIDGET_WORDS.ended} · ${time}` : WIDGET_WORDS.ended),
        node('span', { class: 'ended-rule' })
    );
}

/** Свёрнутый виджет: круглая кнопка чата. */
export function bubble(): HTMLElement {
    return node(
        'button',
        { 'aria-label': WIDGET_WORDS.bubble, class: 'bubble', 'data-act': 'open', 'qa-dataid': 'widget-bubble', type: 'button' },
        iconNode(WIDGET_ICON_COMMENTS)
    );
}

/** Развёрнутая панель с её частями. */
export function widgetPanel(...parts: readonly TWidgetChild[]): HTMLElement {
    return node('div', { class: 'panel', 'qa-dataid': 'widget-panel' }, ...parts);
}

/** Слово о том, что чата на этой странице нет. */
export function unavailable(): HTMLElement {
    return node(
        'div',
        { class: 'unavailable' },
        node('span', { class: 'unavailable-icon' }, iconNode(WIDGET_ICON_COMMENTS)),
        node('span', { class: 'unavailable-title', 'qa-dataid': 'widget-unavailable' }, WIDGET_WORDS.unavailable),
        node('span', { class: 'unavailable-hint' }, WIDGET_WORDS.unavailableHint)
    );
}

/** Карточка приветствия до первой реплики: слова площадки и, когда названы, часы ответа. */
export function greetingCard(greeting: string, hours: string): HTMLElement {
    return node(
        'div',
        { class: 'greeting' },
        node('p', { class: 'greeting-text', 'data-part': 'greeting', 'qa-dataid': 'widget-greeting' }, greeting),
        hours
            ? node(
                  'span',
                  { class: 'hours', 'qa-dataid': 'widget-hours' },
                  node('span', { class: 'hours-icon' }, iconNode(WIDGET_ICON_CLOCK)),
                  hours
              )
            : null
    );
}

/** Плашка над лентой вне рабочего времени: когда ответят. */
export function hoursNote(hours: string): HTMLElement {
    return node(
        'div',
        { class: 'note', 'qa-dataid': 'widget-hours' },
        node('span', { class: 'note-icon' }, iconNode(WIDGET_ICON_INFO)),
        hours
    );
}

/** Поле набора с кнопкой отправки. */
export function sendForm(placeholder: string): HTMLElement {
    return node(
        'form',
        { class: 'send', 'data-act': 'send' },
        node(
            'div',
            { class: 'field', 'qa-dataid': 'widget-field' },
            node('input', { placeholder, 'aria-label': placeholder, 'data-part': 'text', 'qa-dataid': 'widget-text' }),
            node('button', { 'aria-label': WIDGET_WORDS.send, 'qa-dataid': 'widget-send', type: 'submit' }, iconNode(WIDGET_ICON_ARROW_UP))
        )
    );
}
