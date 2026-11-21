import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qaAll, setInputs, textOf } from '../../../../testing/rt-kit-testing';
import { RtAiChatComponent } from './rt-ai-chat.component';
import { IRtAiChat } from './rt-ai-chat.model';

function sources(...urls: (string | null)[]): IRtAiChat.SourcesBlock {
    return {
        type: 'sources',
        items: urls.map((url: string | null, index: number): IRtAiChat.SourceItem => ({
            title: `Источник ${index + 1}`,
            ...(url === null ? {} : { url }),
        })),
    };
}

function answer(id: string, blocks: readonly IRtAiChat.Block[]): IRtAiChat.Message {
    return { id, role: 'assistant', blocks };
}

function setup(messages: readonly IRtAiChat.Message[]): ComponentFixture<RtAiChatComponent> {
    return createRtFixture(RtAiChatComponent, { messages });
}

function events(fixture: ComponentFixture<RtAiChatComponent>): IRtAiChat.SourceOpen[] {
    const seen: IRtAiChat.SourceOpen[] = [];
    fixture.componentInstance.sourceOpen.subscribe((event: IRtAiChat.SourceOpen): void => {
        seen.push(event);
    });

    return seen;
}

function nodes(fixture: ComponentFixture<RtAiChatComponent>, id: string): HTMLElement[] {
    return qaAll(fixture, id).map((node: DebugElement): HTMLElement => node.nativeElement as HTMLElement);
}

async function settle(fixture: ComponentFixture<RtAiChatComponent>): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
}

async function expand(fixture: ComponentFixture<RtAiChatComponent>, index: number): Promise<void> {
    nodes(fixture, 'expansion-panel-header')[index].click();
    await settle(fixture);
}

describe('RtAiChatComponent — блок источников в ответе', (): void => {
    it('SC-UKV-1546 — нажатие источника уходит из чата с номером сообщения, адресом и названием в том же вызове', async (): Promise<void> => {
        const fixture: ComponentFixture<RtAiChatComponent> = setup([answer('m1', [sources('/reports/sales?month=11')])]);
        const seen: IRtAiChat.SourceOpen[] = events(fixture);

        await expand(fixture, 0);
        const button: HTMLElement = nodes(fixture, 'ai-chat-sources-open')[0];
        button.click();

        expect(seen).toEqual([{ messageId: 'm1', url: '/reports/sales?month=11', title: 'Источник 1' }]);

        button.click();

        expect(seen).toHaveLength(2);
    });

    it('SC-UKV-1547 — источник без адреса не нажимается и ничего не отдаёт', async (): Promise<void> => {
        const fixture: ComponentFixture<RtAiChatComponent> = setup([answer('m1', [sources(null)])]);
        const seen: IRtAiChat.SourceOpen[] = events(fixture);

        await expand(fixture, 0);
        nodes(fixture, 'ai-chat-sources-plain')[0].click();

        expect(nodes(fixture, 'ai-chat-sources-open')).toHaveLength(0);
        expect(seen).toEqual([]);
    });

    it('SC-UKV-1545 — копия messages с тем же блоком держит список раскрытым, и чат о раскрытии не сообщает', async (): Promise<void> => {
        const fixture: ComponentFixture<RtAiChatComponent> = setup([answer('m1', [sources('/a')])]);
        const seen: IRtAiChat.SourceOpen[] = events(fixture);

        await expand(fixture, 0);
        setInputs(fixture, { messages: [answer('m1', [sources('/a')])] });
        await settle(fixture);

        expect(nodes(fixture, 'expansion-panel-header')[0].getAttribute('aria-expanded')).toBe('true');
        expect(nodes(fixture, 'ai-chat-sources-item')).toHaveLength(1);
        expect(seen).toEqual([]);
    });

    it('SC-UKV-1560 — рост списка в потоке держит список раскрытым, новое сообщение начинает свёрнутым', async (): Promise<void> => {
        const fixture: ComponentFixture<RtAiChatComponent> = setup([answer('m1', [sources('/a', '/b')])]);

        await expand(fixture, 0);
        setInputs(fixture, { messages: [answer('m1', [sources('/a', '/b', '/c', '/d', '/e')])] });
        await settle(fixture);

        expect(textOf(nodes(fixture, 'ai-chat-sources-count')[0])).toBe('5');
        expect(nodes(fixture, 'ai-chat-sources-item')).toHaveLength(5);

        setInputs(fixture, { messages: [answer('m2', [sources('/a')])] });
        await settle(fixture);

        expect(nodes(fixture, 'expansion-panel-header')[0].getAttribute('aria-expanded')).toBe('false');
    });

    it('SC-UKV-1556 — источники в секции составного ответа рисуются теми же правилами и называют своё сообщение', async (): Promise<void> => {
        const section: IRtAiChat.SectionBlock = { type: 'section', title: 'Откуда цифры', blocks: [sources('/c')] };
        const fixture: ComponentFixture<RtAiChatComponent> = setup([answer('m1', [section])]);
        const seen: IRtAiChat.SourceOpen[] = events(fixture);

        await expand(fixture, 0);
        nodes(fixture, 'ai-chat-sources-open')[0].click();

        expect(seen).toEqual([{ messageId: 'm1', url: '/c', title: 'Источник 1' }]);
    });

    it('SC-UKV-1557 — несколько блоков хранят своё состояние и называют свой адрес и своё сообщение', async (): Promise<void> => {
        const fixture: ComponentFixture<RtAiChatComponent> = setup([
            answer('m1', [sources('/a'), sources('/b')]),
            answer('m2', [sources('/c')]),
        ]);
        const seen: IRtAiChat.SourceOpen[] = events(fixture);

        await expand(fixture, 0);

        expect(
            nodes(fixture, 'expansion-panel-header').map((header: HTMLElement): string | null => header.getAttribute('aria-expanded'))
        ).toEqual(['true', 'false', 'false']);

        await expand(fixture, 1);
        await expand(fixture, 2);
        nodes(fixture, 'ai-chat-sources-open').forEach((button: HTMLElement): void => button.click());

        expect(seen.map((event: IRtAiChat.SourceOpen): string => `${event.messageId}:${event.url}`)).toEqual(['m1:/a', 'm1:/b', 'm2:/c']);
    });
});
