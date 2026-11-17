import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../../../testing/rt-kit-testing';
import { provideRtAiChatBlock } from '../blocks/rt-ai-chat-blocks.providers';
import { IRtAiChat } from '../rt-ai-chat.model';
import { RtAiChatAnswerComponent } from './rt-ai-chat-answer.component';

/** Отрисовщик приложения: печатает подпись своего блока. */
@Component({
    selector: 'rt-test-chart-block',
    template: '<p qa-dataid="test-chart-block">{{ block()["caption"] }}</p>',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestChartBlockComponent {
    public readonly block: InputSignal<IRtAiChat.Block> = input.required<IRtAiChat.Block>();
}

/** Буфер обмена, который запоминает скопированное. */
class ClipboardDouble {
    public readonly copied: string[] = [];

    public copy(text: string): boolean {
        this.copied.push(text);

        return true;
    }
}

const CHART_ONLY: IRtAiChat.AssistantMessage = {
    id: 'a1',
    role: 'assistant',
    blocks: [{ type: 'chart', caption: 'Occupancy by week' }],
};

describe('RtAiChatAnswerComponent', (): void => {
    it('SC-UKV-1327 — у дописанного ответа без текста нет «Копировать», а оценка на месте', (): void => {
        const fixture: ComponentFixture<RtAiChatAnswerComponent> = createRtFixture(RtAiChatAnswerComponent, { message: CHART_ONLY });

        expect(qa(fixture, 'ai-chat-feedback')).not.toBeNull();
        expect(qa(fixture, 'ai-chat-like')).not.toBeNull();
        expect(qa(fixture, 'ai-chat-copy')).toBeNull();
    });

    it('SC-UKV-1326 — блок из реестра с функцией toText даёт «Копировать» и свой текст в копии', (): void => {
        const clipboard: ClipboardDouble = new ClipboardDouble();
        const fixture: ComponentFixture<RtAiChatAnswerComponent> = createRtFixture(
            RtAiChatAnswerComponent,
            { message: CHART_ONLY },
            {
                providers: [
                    { provide: Clipboard, useValue: clipboard },
                    provideRtAiChatBlock('chart', TestChartBlockComponent, (block: IRtAiChat.Block): string =>
                        String(Reflect.get(block, 'caption'))
                    ),
                ],
            }
        );
        const copy: HTMLElement = qa(fixture, 'ai-chat-copy')?.nativeElement as HTMLElement;

        expect(qa(fixture, 'test-chart-block')).not.toBeNull();
        (copy.querySelector('button') as HTMLButtonElement).click();

        expect(clipboard.copied).toEqual(['Occupancy by week']);
    });
});
