// @vitest-environment jsdom
import { CHAT_SIDE_VISITOR, CHAT_TAG_SERVICE_ATTRIBUTE, CHAT_TAG_SITE_ATTRIBUTE, ERefusal, IChatMessageRow } from '@rt/message-bus-common';

import { ChatWidgetElement, WIDGET_TAG } from './chat-widget.element';
import { remarks } from './chat-widget.view';

/** Разметка, которая сработала бы, попади она в страницу строкой. */
const PLANTED: string = '<img src="x" onerror="window.planted=1">';

/** Ответ сервиса телом JSON. */
function answered(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

/** Поток событий не нужен тесту: подставной ничего не присылает. */
class SilentStream {
    public addEventListener(): void {
        return undefined;
    }

    public close(): void {
        return undefined;
    }
}

/** Ждёт, пока виджет допишет разметку после ответов сервиса. */
async function settled(): Promise<void> {
    for (let turn: number = 0; turn < 10; turn++) {
        await new Promise<void>((resolve: () => void): void => {
            setTimeout(resolve, 0);
        });
    }
}

describe('the widget markup', () => {
    beforeAll(() => {
        if (!customElements.get(WIDGET_TAG)) {
            customElements.define(WIDGET_TAG, ChatWidgetElement);
        }
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        document.body.replaceChildren();
    });

    it('SC-CH-118 — the refusal word with markup in the limit is shown as text', async () => {
        vi.stubGlobal('EventSource', SilentStream);
        vi.stubGlobal(
            'fetch',
            vi.fn(async (address: string): Promise<Response> => {
                if (address.includes('/api/chat/site')) {
                    return answered(200, { greeting: 'Hello', answering: true, answerFrom: 0, answerTo: 0 });
                }
                if (address.endsWith('/api/chat/conversations')) {
                    return answered(200, { conversationId: 'c1', visitorToken: 'v1' });
                }

                return answered(400, { code: ERefusal.ChatTextTooLong, params: { limit: PLANTED } });
            })
        );
        const widget: HTMLElement = document.createElement(WIDGET_TAG);
        widget.setAttribute(CHAT_TAG_SITE_ATTRIBUTE, 'site');
        widget.setAttribute(CHAT_TAG_SERVICE_ATTRIBUTE, 'https://service.test');
        document.body.append(widget);
        await settled();
        const root: ShadowRoot = widget.shadowRoot as ShadowRoot;

        (root.querySelector('[data-act="open"]') as HTMLElement).click();
        (root.querySelector('input[data-part="text"]') as HTMLInputElement).value = 'a long remark';
        (root.querySelector('[data-act="send"]') as HTMLFormElement).dispatchEvent(new Event('submit', { cancelable: true }));
        await settled();

        const fault: Element | null = root.querySelector('[qa-dataid="widget-fault"]');
        expect(fault?.textContent).toContain(PLANTED);
        expect(root.querySelector('img, [onerror]')).toBeNull();
    });

    it('SC-CH-118 — the side of a remark with markup stays an attribute value and the text stays text', () => {
        const side: string = `visitor" onclick="window.planted=1`;
        const message: IChatMessageRow = { id: 'm1', side, text: PLANTED, takenAt: '2026-11-22T10:00:00.000Z', authorName: '' };
        const holder: HTMLElement = document.createElement('div');

        holder.append(...remarks([message, { ...message, id: 'm2', side: CHAT_SIDE_VISITOR }]));

        const bubbles: NodeListOf<HTMLElement> = holder.querySelectorAll<HTMLElement>('[qa-dataid="widget-remark"]');
        expect(bubbles[0].getAttribute('data-side')).toBe(side);
        expect(bubbles[0].hasAttribute('onclick')).toBe(false);
        expect(bubbles[1].getAttribute('data-side')).toBe(CHAT_SIDE_VISITOR);
        expect(holder.querySelector('img, [onerror]')).toBeNull();
        expect(holder.querySelector('[qa-dataid="widget-message"]')?.textContent).toBe(PLANTED);
    });
});
