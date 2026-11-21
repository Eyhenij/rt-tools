import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, input, InputSignal, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { RT_KIT_LABELS_EN } from '../../../../../lib/i18n/rt-kit-labels.en';
import { RT_KIT_LABELS, RT_KIT_LOCALE } from '../../../../../lib/i18n/rt-kit-labels.providers';
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
    it('SC-UKV-1555 — копия блока источников несёт подпись заголовка из переводчика кита', (): void => {
        const clipboard: ClipboardDouble = new ClipboardDouble();
        const message: IRtAiChat.AssistantMessage = {
            id: 'sources',
            role: 'assistant',
            blocks: [{ type: 'sources', items: [{ title: 'Отчёт', url: '/r' }] }],
        };
        const fixture: ComponentFixture<RtAiChatAnswerComponent> = createRtFixture(
            RtAiChatAnswerComponent,
            { message },
            {
                providers: [
                    { provide: Clipboard, useValue: clipboard },
                    { provide: RT_KIT_LABELS, useValue: signal({ ...RT_KIT_LABELS_EN, aiSources: 'Источники' }) },
                ],
            }
        );

        ((qa(fixture, 'ai-chat-copy')?.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement).click();

        expect(clipboard.copied).toHaveLength(1);
        expect(clipboard.copied[0].startsWith('Источники\t1')).toBe(true);
    });

    it('SC-UKV-1423 — после смены языка кита копия ответа пишет значения таблицы в новом языке', (): void => {
        const clipboard: ClipboardDouble = new ClipboardDouble();
        const locale: WritableSignal<string> = signal<string>('en');
        const message: IRtAiChat.AssistantMessage = {
            id: 'table',
            role: 'assistant',
            blocks: [{ type: 'table', columns: [{ label: 'N', type: 'number' }], rows: [[1234.5]] }],
        };
        const fixture: ComponentFixture<RtAiChatAnswerComponent> = createRtFixture(
            RtAiChatAnswerComponent,
            { message },
            {
                providers: [
                    { provide: Clipboard, useValue: clipboard },
                    { provide: RT_KIT_LOCALE, useValue: locale },
                ],
            }
        );

        locale.set('de');
        fixture.detectChanges();
        ((qa(fixture, 'ai-chat-copy')?.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement).click();

        expect(clipboard.copied).toEqual(['N\n1.234,5']);
    });
});
