/**
 * Разметка частей виджета строками: шапки, список обращений и лента.
 *
 * Лежит отдельно от элемента: элемент держит состояние и нажатия, а здесь только то, что из
 * состояния рисуется. Решения — непрочитанность, инициалы, слово о дне — берутся у чистых функций
 * рядом и здесь только расставляются по местам.
 */
import { CHAT_SIDE_VISITOR, EChatTalkState, IChatMessageRow, IChatVisitorTalkListRow } from '@rt/message-bus-common';

import { WIDGET_ICON_ARROW_LEFT, WIDGET_ICON_CLOSE, WIDGET_ICON_COMMENTS, WIDGET_ICON_PLUS } from './chat-widget.icons';
import { widgetDayText, widgetFirstName, widgetInitials, widgetTimeText, widgetUnread } from './chat-widget.logic';
import { WIDGET_WORDS } from './chat-widget.words';

/** Текст человека в разметку: страница потребителя чужая, и реплика в ней — чужой ввод. */
export function escaped(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Крестик шапки: он один во всех её видах. */
const CLOSE: string = `<button aria-label="${WIDGET_WORDS.close}" class="close" data-act="close" qa-dataid="widget-close" type="button">${WIDGET_ICON_CLOSE}</button>`;

/** Стрелка назад к списку: стоит в шапке обращения, когда у посетителя есть список. */
const BACK: string = `<button aria-label="${WIDGET_WORDS.back}" class="close" data-act="back" qa-dataid="widget-back" type="button">${WIDGET_ICON_ARROW_LEFT}</button>`;

/** Шапка с одним заголовком: у недоступного чата, у нового разговора и у списка. */
export function titleHead(title: string, back: boolean = false): string {
    return `<div class="head">
        ${back ? BACK : ''}
        <span class="title" qa-dataid="widget-title">${title}</span>
        ${CLOSE}
    </div>`;
}

/** Круг аватара: инициалы сотрудника или общий значок поддержки, пока имени нет. */
function avatar(name: string, extra: string = ''): string {
    return name
        ? `<span class="avatar${extra}" qa-dataid="widget-avatar">${escaped(widgetInitials(name))}</span>`
        : `<span class="avatar avatar_support${extra}" qa-dataid="widget-avatar">${WIDGET_ICON_COMMENTS}</span>`;
}

/**
 * Шапка идущего обращения: кто отвечает.
 *
 * Названный ответ уже был — инициалы, имя и строка роли. Не было — общий значок, «Поддержка» и
 * часы ответа, чтобы посетитель знал, когда ждать.
 */
export function talkHead(author: string, hours: string, back: boolean): string {
    const name: string = author ? escaped(author) : WIDGET_WORDS.sideOperator;
    const sub: string = author ? WIDGET_WORDS.role : hours;

    return `<div class="head">
        ${back ? BACK : ''}
        ${avatar(author, ' avatar_head')}
        <span class="person">
            <span class="title" qa-dataid="widget-title">${name}</span>
            ${sub ? `<span class="role" qa-dataid="widget-role">${sub}</span>` : ''}
        </span>
        ${CLOSE}
    </div>`;
}

/** Метка строки: точка непрочитанного ответа или «Закрыто». Закрытое обращение точки не ставит. */
function rowMark(talk: IChatVisitorTalkListRow, unread: boolean): string {
    if (talk.state === EChatTalkState.Closed) {
        return `<span class="closed" qa-dataid="widget-talk-closed">${WIDGET_WORDS.closedMark}</span>`;
    }

    return unread ? `<span aria-label="${WIDGET_WORDS.unread}" class="dot" qa-dataid="widget-talk-unread"></span>` : '';
}

/**
 * Список «Ваши обращения», свежие первыми, и кнопка нового обращения под ним.
 *
 * Минуты, когда посетитель видел обращения, и минута «сейчас» приезжают доводами: список рисуется
 * из них, а не из часов машины.
 */
export function talksList(talks: readonly IChatVisitorTalkListRow[], seen: Readonly<Record<string, string>>, now: Date): string {
    const rows: string = talks
        .map((talk: IChatVisitorTalkListRow): string => {
            // закрытое обращение ответа не ждёт: его метка — «Закрыто», а не точка
            const unread: boolean = talk.state !== EChatTalkState.Closed && widgetUnread(talk, seen[talk.id] ?? '');

            return `<button class="talk" data-act="talk" data-talk="${escaped(talk.id)}" qa-dataid="widget-talk" type="button">
                ${avatar(talk.operatorName)}
                <span class="talk-body">
                    <span class="talk-line">
                        <span class="talk-name">${talk.operatorName ? escaped(talk.operatorName) : WIDGET_WORDS.sideOperator}</span>
                        <span class="talk-time${unread ? ' talk-time_unread' : ''}">${widgetDayText(talk.lastMessageAt, now, WIDGET_WORDS.yesterday)}</span>
                    </span>
                    <span class="talk-line">
                        <span class="talk-last" qa-dataid="widget-talk-last">${escaped(talk.lastMessage)}</span>
                        ${rowMark(talk, unread)}
                    </span>
                </span>
            </button>`;
        })
        .join('');

    return `<div class="talks" qa-dataid="widget-talks">${rows}</div>
        <div class="talks-foot">
            <button class="fresh" data-act="fresh" qa-dataid="widget-new-talk" type="button"><span class="fresh-icon">${WIDGET_ICON_PLUS}</span>${WIDGET_WORDS.newTalk}</button>
        </div>`;
}

/** Слово стороны в пузыре: у ответа — первое слово имени сотрудника, пока оно есть. */
function sideWord(message: IChatMessageRow): string {
    if (message.side === CHAT_SIDE_VISITOR) {
        return WIDGET_WORDS.sideVisitor;
    }

    return message.authorName ? escaped(widgetFirstName(message.authorName)) : WIDGET_WORDS.sideOperator;
}

/** Пузыри ленты: сторона, текст и время. */
export function remarks(messages: readonly IChatMessageRow[]): string {
    return messages
        .map(
            (message: IChatMessageRow): string => `<div class="message" data-side="${message.side}" qa-dataid="widget-remark">
                <span class="side" qa-dataid="widget-remark-side">${sideWord(message)}</span>
                <span data-part="text" qa-dataid="widget-message">${escaped(message.text)}</span>
                <span class="time">${widgetTimeText(message.takenAt)}</span>
            </div>`
        )
        .join('');
}
