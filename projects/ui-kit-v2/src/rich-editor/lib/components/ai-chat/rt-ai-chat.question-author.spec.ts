import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture } from '../../../../testing/rt-kit-testing';
import { RtAiChatComponent } from './rt-ai-chat.component';
import { IRtAiChat } from './rt-ai-chat.model';

const QUESTION: IRtAiChat.Message = { id: 'q1', role: 'user', text: 'How did occupancy change?', time: '14:02' };

describe('RtAiChatComponent — подпись автора вопроса', (): void => {
    it('SC-UKV-1649 — по умолчанию пузырь вопроса подписан автором', (): void => {
        const fixture: ComponentFixture<RtAiChatComponent> = createRtFixture(RtAiChatComponent, { messages: [QUESTION] });
        const author: Element | null = fixture.nativeElement.querySelector('.rt-ai-chat__author');

        expect(author?.textContent?.trim()).toBe('You');
        expect(author?.nextElementSibling?.classList.contains('rt-ai-chat__bubble-text')).toBe(true);
    });

    it('SC-UKV-1648 — выключенный questionAuthor не кладёт подпись автора на страницу', (): void => {
        const fixture: ComponentFixture<RtAiChatComponent> = createRtFixture(RtAiChatComponent, {
            messages: [QUESTION],
            questionAuthor: false,
        });
        const bubble: Element | null = fixture.nativeElement.querySelector('.rt-ai-chat__bubble');

        expect(bubble?.querySelector('.rt-ai-chat__author')).toBeNull();
        expect(bubble?.firstElementChild?.classList.contains('rt-ai-chat__bubble-text')).toBe(true);
    });
});
