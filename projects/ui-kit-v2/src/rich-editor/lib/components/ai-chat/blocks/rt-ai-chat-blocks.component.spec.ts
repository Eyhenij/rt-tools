import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa, qaAll, textOf } from '../../../../../testing/rt-kit-testing';
import { IRtAiChat } from '../rt-ai-chat.model';
import { RtAiChatBlocksComponent } from './rt-ai-chat-blocks.component';
import { provideRtAiChatBlock } from './rt-ai-chat-blocks.providers';

/** Отрисовщик приложения: печатает тип и поле `caption` своего блока. */
@Component({
    selector: 'rt-test-chart-block',
    template: '<p qa-dataid="test-chart-block">{{ block().type }}: {{ block()["caption"] }}</p>',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestChartBlockComponent {
    public readonly block: InputSignal<IRtAiChat.Block> = input.required<IRtAiChat.Block>();
}

const BLOCKS: readonly IRtAiChat.Block[] = [
    { type: 'markdown', text: 'Occupancy grew by **4 points**.' },
    { type: 'notice', severity: 'warning', text: 'October 31 is not closed yet.' },
    { type: 'chart', caption: 'Occupancy by week' },
];

describe('RtAiChatBlocksComponent', (): void => {
    it('SC-UKV-1323 — блоки рисуются по порядку: markdown текстом, notice плашкой своей severity', (): void => {
        const fixture: ComponentFixture<RtAiChatBlocksComponent> = createRtFixture(RtAiChatBlocksComponent, { blocks: BLOCKS.slice(0, 2) });
        const host: HTMLElement = fixture.nativeElement as HTMLElement;
        const markdown: HTMLElement = qa(fixture, 'ai-chat-block-markdown')?.nativeElement as HTMLElement;
        const notice: HTMLElement = qa(fixture, 'ai-chat-block-notice')?.nativeElement as HTMLElement;

        expect(textOf(qa(fixture, 'ai-chat-block-markdown'))).toBe('Occupancy grew by 4 points.');
        expect(markdown.querySelector('strong')?.textContent).toBe('4 points');
        expect(textOf(qa(fixture, 'ai-chat-block-notice'))).toBe('October 31 is not closed yet.');
        expect(notice.querySelector('[data-severity]')?.getAttribute('data-severity')).toBe('warning');
        expect(Array.from(host.children)).toEqual([markdown, notice]);
    });

    it('SC-UKV-1329 — плашка notice в ленте объявляется спокойно, а не тревогой', (): void => {
        const fixture: ComponentFixture<RtAiChatBlocksComponent> = createRtFixture(RtAiChatBlocksComponent, { blocks: BLOCKS.slice(1, 2) });
        const aside: HTMLElement | null = (qa(fixture, 'ai-chat-block-notice')?.nativeElement as HTMLElement).querySelector(
            '[qa-dataid="message-alert"]'
        );

        expect(aside).not.toBeNull();
        expect(aside?.getAttribute('role')).toBe('status');
    });

    it('SC-UKV-1324 — блок чужого типа рисует отрисовщик, зарегистрированный приложением', (): void => {
        const fixture: ComponentFixture<RtAiChatBlocksComponent> = createRtFixture(
            RtAiChatBlocksComponent,
            { blocks: BLOCKS },
            { providers: [provideRtAiChatBlock('chart', TestChartBlockComponent)] }
        );

        expect(textOf(qa(fixture, 'test-chart-block'))).toBe('chart: Occupancy by week');
        expect(qa(fixture, 'ai-chat-block-unsupported')).toBeNull();
    });

    it('SC-UKV-1325 — блок без отрисовщика показан заглушкой с именем типа, соседние блоки на месте', (): void => {
        const fixture: ComponentFixture<RtAiChatBlocksComponent> = createRtFixture(RtAiChatBlocksComponent, { blocks: BLOCKS });
        const stub: HTMLElement = qa(fixture, 'ai-chat-block-unsupported')?.nativeElement as HTMLElement;

        expect(qaAll(fixture, 'ai-chat-block-markdown').length).toBe(1);
        expect(qaAll(fixture, 'ai-chat-block-notice').length).toBe(1);
        expect(stub.getAttribute('data-type')).toBe('chart');
        expect(textOf(qa(fixture, 'ai-chat-block-unsupported'))).toBe('The “chart” block is not supported');
    });
});
