import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qaAll, setInputs, textOf } from '../../../../testing/rt-kit-testing';
import { RtAiChatComponent } from './rt-ai-chat.component';
import { IRtAiChat } from './rt-ai-chat.model';

const QUESTION: IRtAiChat.Message = { id: 'q1', role: 'user', text: 'Обзор ноября' };

function answer(blocks: readonly IRtAiChat.NestedBlock[]): IRtAiChat.Message {
    return { id: 'a1', role: 'assistant', blocks: [{ type: 'section', title: 'Обзор', blocks }] };
}

function cellTexts(fixture: ComponentFixture<RtAiChatComponent>): string[] {
    return qaAll(fixture, 'ai-chat-section-cell').map((cell: DebugElement): string => textOf(cell));
}

describe('RtAiChatComponent — секция в ответе', (): void => {
    it('SC-UKV-1523 — копия messages с другим списком блоков перерисовывает сетку секции в чате', (): void => {
        const first: IRtAiChat.NestedBlock = { type: 'markdown', text: 'Один' };
        const fixture: ComponentFixture<RtAiChatComponent> = createRtFixture(RtAiChatComponent, { messages: [QUESTION, answer([first])] });

        expect(cellTexts(fixture)).toEqual(['Один']);

        setInputs(fixture, {
            messages: [QUESTION, answer([first, { type: 'markdown', text: 'Два' }, { type: 'notice', severity: 'info', text: 'Три' }])],
        });
        fixture.detectChanges();

        expect(cellTexts(fixture)).toEqual(['Один', 'Два', 'Три']);
        expect(qaAll(fixture, 'ai-chat-block-section')).toHaveLength(1);
        expect(qaAll(fixture, 'ai-chat-block-unsupported')).toHaveLength(0);
    });
});
