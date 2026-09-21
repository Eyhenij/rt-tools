/**
 * Стили виджета строкой: они кладутся в теневое дерево вместе с разметкой.
 *
 * Строкой, а не файлом рядом: виджет приезжает в чужую страницу одним скриптом, и второй запрос
 * за стилями означал бы страницу, которая полсекунды стоит нераскрашенной. В теневом дереве им
 * не с чем столкнуться — ни стили страницы сюда не достают, ни эти туда.
 *
 * Значения записаны числами, а не взяты у кита: кит виджету не приезжает вовсе, и брать их
 * неоткуда. Список короток и лежит одним местом — своими свойствами в корне.
 */
export const WIDGET_STYLES: string = `
:host {
    --rt-chat-accent: #2563eb;
    --rt-chat-surface: #ffffff;
    --rt-chat-ink: #1f2933;
    --rt-chat-muted: #6b7280;
    --rt-chat-line: #e5e7eb;
    --rt-chat-radius: 12px;
    --rt-chat-gap: 12px;

    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 2147483000;
    color: var(--rt-chat-ink);
    font: 400 14px/1.45 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

button {
    font: inherit;
    cursor: pointer;
}

.bubble {
    padding: 12px 18px;
    border: none;
    border-radius: 999px;
    background: var(--rt-chat-accent);
    box-shadow: 0 6px 20px rgb(15 23 42 / 25%);
    color: #ffffff;
}

.panel {
    display: flex;
    width: 320px;
    max-height: 70vh;
    flex-direction: column;
    border: 1px solid var(--rt-chat-line);
    border-radius: var(--rt-chat-radius);
    background: var(--rt-chat-surface);
    box-shadow: 0 10px 30px rgb(15 23 42 / 20%);
    overflow: hidden;
}

.head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--rt-chat-gap);
    border-bottom: 1px solid var(--rt-chat-line);
    gap: var(--rt-chat-gap);
}

.head button {
    border: none;
    background: none;
    color: var(--rt-chat-muted);
}

.hours {
    color: var(--rt-chat-muted);
    font-size: 12px;
}

.feed {
    display: flex;
    min-height: 120px;
    flex: 1;
    flex-direction: column;
    padding: var(--rt-chat-gap);
    gap: 8px;
    overflow-y: auto;
}

.greeting {
    color: var(--rt-chat-muted);
}

.message {
    display: flex;
    max-width: 85%;
    flex-direction: column;
    padding: 8px 10px;
    border-radius: 10px;
    background: #f3f4f6;
    gap: 2px;
    overflow-wrap: anywhere;
}

.message[data-side='visitor'] {
    align-self: flex-end;
    background: #dbeafe;
}

.side {
    color: var(--rt-chat-muted);
    font-size: 12px;
}

.send {
    display: flex;
    padding: var(--rt-chat-gap);
    border-top: 1px solid var(--rt-chat-line);
    gap: 8px;
}

.send input {
    min-width: 0;
    flex: 1;
    padding: 8px 10px;
    border: 1px solid var(--rt-chat-line);
    border-radius: 8px;
    font: inherit;
}

.send button {
    padding: 8px 14px;
    border: none;
    border-radius: 8px;
    background: var(--rt-chat-accent);
    color: #ffffff;
}

.fault {
    padding: 0 var(--rt-chat-gap) var(--rt-chat-gap);
    color: #b91c1c;
    font-size: 12px;
}

.hidden {
    display: none;
}

@media (max-width: 600px) {
    :host {
        right: 0;
        bottom: 0;
    }

    .panel {
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        border: none;
        border-radius: 0;
    }
}
`;
