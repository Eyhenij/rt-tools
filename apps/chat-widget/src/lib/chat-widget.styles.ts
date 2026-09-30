/**
 * Стили виджета строкой: они кладутся в теневое дерево вместе с разметкой.
 *
 * Строкой, а не файлом рядом: виджет приезжает в чужую страницу одним скриптом, и второй запрос
 * за стилями означал бы страницу, которая полсекунды стоит нераскрашенной. В теневом дереве им
 * не с чем столкнуться — ни стили страницы сюда не достают, ни эти туда.
 *
 * Значения записаны числами, а не взяты у кита: кит виджету не приезжает вовсе, и брать их
 * неоткуда. Они повторяют макет и поля остального интерфейса — список лежит одним местом, своими
 * свойствами в корне.
 */
export const WIDGET_STYLES: string = `
:host {
    --rt-chat-accent: #155dfc;
    --rt-chat-on-accent: #ffffff;
    --rt-chat-surface: #ffffff;
    --rt-chat-ink: #282828;
    --rt-chat-muted: #676767;
    --rt-chat-line: #e0e0e0;
    --rt-chat-subtle: #e0e0e0;
    --rt-chat-field: rgb(0 0 0 / 4%);
    --rt-chat-ring: rgb(21 93 252 / 24%);
    --rt-chat-own: #e0e0e0;
    --rt-chat-own-author: #7e7e7e;
    --rt-chat-in: #f0f5ff;
    --rt-chat-in-author: #0038b5;
    --rt-chat-note: #eff6ff;
    --rt-chat-danger: #e7000b;
    --rt-chat-radius: 16px;
    --rt-chat-bubble-radius: 10px;
    --rt-chat-shadow: 0 8px 32px rgb(0 0 0 / 16%);

    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 2147483000;
    color: var(--rt-chat-ink);
    font: 400 14px/1.45 Montserrat, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

button {
    font: inherit;
    cursor: pointer;
}

svg {
    display: block;
    width: 100%;
    height: 100%;
}

.bubble {
    display: flex;
    width: 56px;
    height: 56px;
    align-items: center;
    justify-content: center;
    padding: 15px;
    border: none;
    border-radius: 50%;
    background: var(--rt-chat-accent);
    box-shadow: 0 4px 16px rgb(0 0 0 / 16%);
    color: var(--rt-chat-on-accent);
}

.panel {
    display: flex;
    width: 380px;
    height: min(600px, calc(100vh - 48px));
    box-sizing: border-box;
    flex-direction: column;
    border: 1px solid var(--rt-chat-line);
    border-radius: var(--rt-chat-radius);
    background: var(--rt-chat-surface);
    box-shadow: var(--rt-chat-shadow);
    overflow: hidden;
}

.head {
    display: flex;
    align-items: center;
    padding: 12px 12px 12px 20px;
    background: var(--rt-chat-accent);
    color: var(--rt-chat-on-accent);
    gap: 8px;
}

.title {
    min-width: 0;
    flex: 1;
    font-size: 16px;
    font-weight: 600;
}

.close {
    display: flex;
    width: 32px;
    height: 32px;
    flex: none;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border: none;
    border-radius: 8px;
    background: none;
    color: inherit;
}

.close:hover {
    background: rgb(255 255 255 / 16%);
}

.head .close[data-act='back'] {
    margin-left: -8px;
}

.person {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
}

.role {
    overflow: hidden;
    color: rgb(255 255 255 / 80%);
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.avatar {
    display: flex;
    width: 40px;
    height: 40px;
    box-sizing: border-box;
    flex: none;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--rt-chat-note);
    color: var(--rt-chat-accent);
    font-size: 14px;
    font-weight: 600;
}

.avatar_support {
    padding: 10px;
    background: #dbe6ff;
}

.avatar_head {
    width: 36px;
    height: 36px;
    background: var(--rt-chat-on-accent);
}

.avatar_head.avatar_support {
    padding: 9px;
    background: #0a1a3a;
    color: var(--rt-chat-on-accent);
}

.talks {
    display: flex;
    min-height: 0;
    flex: 1;
    flex-direction: column;
    padding: 8px;
    gap: 4px;
    overflow-y: auto;
}

.talk {
    display: flex;
    width: 100%;
    align-items: center;
    padding: 10px 12px;
    border: none;
    border-radius: 12px;
    background: none;
    color: inherit;
    gap: 12px;
    text-align: left;
}

.talk:hover {
    background: var(--rt-chat-line);
}

.talk-body {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    gap: 2px;
}

.talk-line {
    display: flex;
    align-items: center;
    gap: 8px;
}

.talk-name {
    min-width: 0;
    flex: 1;
    font-weight: 500;
}

.talk-time {
    flex: none;
    color: var(--rt-chat-muted);
    font-size: 12px;
}

.talk-time_unread {
    color: var(--rt-chat-accent);
}

.talk-last {
    min-width: 0;
    flex: 1;
    overflow: hidden;
    color: var(--rt-chat-muted);
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.dot {
    width: 6px;
    height: 6px;
    flex: none;
    border-radius: 50%;
    background: var(--rt-chat-accent);
}

.closed {
    flex: none;
    padding: 1px 8px;
    border-radius: 999px;
    background: var(--rt-chat-line);
    color: var(--rt-chat-ink);
    font-size: 13px;
}

.talks-foot {
    padding: 12px;
    border-top: 1px solid var(--rt-chat-line);
}

.fresh {
    display: flex;
    width: 100%;
    height: 40px;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 8px;
    background: var(--rt-chat-accent);
    color: var(--rt-chat-on-accent);
    font-weight: 500;
    gap: 8px;
}

.fresh-icon {
    width: 16px;
    height: 16px;
}

.feed {
    display: flex;
    min-height: 0;
    flex: 1;
    flex-direction: column;
    padding: 16px;
    gap: 12px;
    overflow-y: auto;
}

.greeting {
    display: flex;
    flex-direction: column;
    padding: 14px 16px;
    border-radius: 12px;
    background: var(--rt-chat-subtle);
    gap: 8px;
}

.greeting-text {
    margin: 0;
    font-weight: 500;
}

.hours {
    display: flex;
    align-items: center;
    color: var(--rt-chat-muted);
    font-size: 13px;
    gap: 6px;
}

.hours-icon,
.note-icon {
    width: 16px;
    height: 16px;
    flex: none;
}

.note {
    display: flex;
    align-items: flex-start;
    padding: 12px 14px;
    border-radius: 12px;
    background: var(--rt-chat-note);
    color: var(--rt-chat-accent);
    gap: 8px;
}

.ended {
    display: flex;
    align-items: center;
    color: var(--rt-chat-muted);
    font-size: 12px;
    font-weight: 500;
    gap: 8px;
}

.ended-rule {
    height: 1px;
    flex: 1;
    background: var(--rt-chat-line);
}

.message {
    display: flex;
    width: fit-content;
    max-width: 260px;
    box-sizing: border-box;
    flex-direction: column;
    padding: 8px;
    border-radius: var(--rt-chat-bubble-radius) var(--rt-chat-bubble-radius) var(--rt-chat-bubble-radius) 0;
    background: var(--rt-chat-in);
    font-size: 12px;
    gap: 8px;
    line-height: 1.35;
    overflow-wrap: anywhere;
}

.message[data-side='visitor'] {
    align-self: flex-end;
    border-radius: var(--rt-chat-bubble-radius) var(--rt-chat-bubble-radius) 0 var(--rt-chat-bubble-radius);
    background: var(--rt-chat-own);
}

.side {
    color: var(--rt-chat-in-author);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.3px;
}

.message[data-side='visitor'] .side {
    color: var(--rt-chat-own-author);
}

.time {
    color: var(--rt-chat-muted);
    line-height: 1.5;
}

.unavailable {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    gap: 8px;
    text-align: center;
}

.unavailable-icon {
    width: 44px;
    height: 44px;
    box-sizing: border-box;
    padding: 12px;
    border-radius: 50%;
    background: var(--rt-chat-subtle);
    color: var(--rt-chat-muted);
}

.unavailable-title {
    font-weight: 500;
}

.unavailable-hint {
    color: var(--rt-chat-muted);
    font-size: 12px;
}

.fault {
    padding: 8px 16px 0;
    color: var(--rt-chat-danger);
    font-size: 12px;
}

.send {
    padding: 8px 10px;
    border-top: 1px solid var(--rt-chat-line);
}

.field {
    display: flex;
    align-items: flex-end;
    margin: 3px;
    padding: 6px;
    border: 1px solid var(--rt-chat-line);
    border-radius: 999px;
    background: var(--rt-chat-field);
    gap: 8px;
}

.field:focus-within {
    border-color: var(--rt-chat-accent);
    background: var(--rt-chat-surface);
    box-shadow: 0 0 0 3px var(--rt-chat-ring);
}

.field input {
    min-width: 0;
    flex: 1;
    padding: 9px 0 9px 6px;
    border: none;
    background: transparent;
    color: var(--rt-chat-ink);
    font: inherit;
    line-height: 22px;
    outline: none;
}

.field input::placeholder {
    color: var(--rt-chat-muted);
}

.field button {
    display: flex;
    width: 40px;
    height: 40px;
    flex: none;
    align-items: center;
    justify-content: center;
    padding: 10px;
    border: none;
    border-radius: 50%;
    background: var(--rt-chat-accent);
    color: var(--rt-chat-on-accent);
}

/* Пустое поле — бледная стрелка, но кнопка нажимается: пустую реплику не пускает проверка
   виджета, а не выключенная кнопка. */
.field input:placeholder-shown + button {
    opacity: 0.5;
}

.hidden {
    display: none;
}

@media (max-width: 600px) {
    :host {
        right: 0;
        bottom: 0;
    }

    .bubble {
        position: fixed;
        right: 16px;
        bottom: 16px;
    }

    .panel {
        width: 100vw;
        height: 100vh;
        border: none;
        border-radius: 0;
        box-shadow: none;
    }

    .head {
        padding: 12px 16px;
    }

    .send {
        padding: 8px 10px 12px;
    }
}
`;
