import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qaAll, setInputs, textOf } from '../../../../testing/rt-kit-testing';
import { RtAiChatComponent } from './rt-ai-chat.component';
import { IRtAiChat } from './rt-ai-chat.model';

function link(url: string, state?: IRtAiChat.LinkBlock['state']): IRtAiChat.LinkBlock {
    return { type: 'link', title: `Страница ${url}`, url, state };
}

function answer(id: string, blocks: readonly IRtAiChat.Block[]): IRtAiChat.Message {
    return { id, role: 'assistant', blocks };
}

function setup(messages: readonly IRtAiChat.Message[]): ComponentFixture<RtAiChatComponent> {
    return createRtFixture(RtAiChatComponent, { messages });
}

function events(fixture: ComponentFixture<RtAiChatComponent>): IRtAiChat.LinkOpen[] {
    const seen: IRtAiChat.LinkOpen[] = [];
    fixture.componentInstance.linkOpen.subscribe((event: IRtAiChat.LinkOpen): void => {
        seen.push(event);
    });

    return seen;
}

function buttons(fixture: ComponentFixture<RtAiChatComponent>, id: string): HTMLElement[] {
    return qaAll(fixture, id).map((button: DebugElement): HTMLElement => button.nativeElement as HTMLElement);
}

describe('RtAiChatComponent — карточка ссылки в ответе', (): void => {
    it('SC-UKV-1493 — нажатие «Открыть» уходит из чата с номером сообщения и адресом в том же вызове', (): void => {
        const fixture: ComponentFixture<RtAiChatComponent> = setup([answer('m1', [link('/reports/sales?month=11', 'opened')])]);
        const seen: IRtAiChat.LinkOpen[] = events(fixture);

        buttons(fixture, 'ai-chat-link-open')[0].click();

        expect(seen).toEqual([{ messageId: 'm1', url: '/reports/sales?month=11', newTab: false }]);
        expect(qaAll(fixture, 'ai-chat-link-status').map(textOf)).toEqual(['Opened']);
    });

    it('SC-UKV-1494 — «Открыть в новой вкладке» дважды даёт два события с newTab', (): void => {
        const fixture: ComponentFixture<RtAiChatComponent> = setup([answer('m1', [link('/reports/sales?month=11')])]);
        const seen: IRtAiChat.LinkOpen[] = events(fixture);
        const button: HTMLElement = buttons(fixture, 'ai-chat-link-open-new-tab')[0];

        button.click();
        button.click();

        expect(seen).toEqual([
            { messageId: 'm1', url: '/reports/sales?month=11', newTab: true },
            { messageId: 'm1', url: '/reports/sales?month=11', newTab: true },
        ]);
    });

    it('SC-UKV-1502 — несколько карточек называют свой адрес и своё сообщение, и в секции тоже', (): void => {
        const section: IRtAiChat.SectionBlock = { type: 'section', title: 'Куда смотреть', blocks: [link('/c')] };
        const fixture: ComponentFixture<RtAiChatComponent> = setup([answer('m1', [link('/a'), link('/b')]), answer('m2', [section])]);
        const seen: IRtAiChat.LinkOpen[] = events(fixture);

        buttons(fixture, 'ai-chat-link-open').forEach((button: HTMLElement): void => button.click());

        expect(seen).toEqual([
            { messageId: 'm1', url: '/a', newTab: false },
            { messageId: 'm1', url: '/b', newTab: false },
            { messageId: 'm2', url: '/c', newTab: false },
        ]);
    });

    it('SC-UKV-1495 — копия messages с новым исходом перерисовывает ту же карточку, и лента держит объявление', (): void => {
        const fixture: ComponentFixture<RtAiChatComponent> = setup([answer('m1', [link('/reports', 'pending')])]);
        const seen: IRtAiChat.LinkOpen[] = events(fixture);
        const open: HTMLElement = buttons(fixture, 'ai-chat-link-open')[0];

        open.click();

        expect(seen).toEqual([]);

        setInputs(fixture, { messages: [answer('m1', [link('/reports', 'opened')])] });
        fixture.detectChanges();

        const feed: HTMLElement = qaAll(fixture, 'ai-chat-feed')[0].nativeElement as HTMLElement;

        expect(buttons(fixture, 'ai-chat-link-open')[0]).toBe(open);
        expect(open.getAttribute('aria-disabled')).toBeNull();
        expect(feed.getAttribute('aria-live')).toBe('polite');
        expect(feed.textContent).toContain('Страница /reports: Opened');
    });
});
