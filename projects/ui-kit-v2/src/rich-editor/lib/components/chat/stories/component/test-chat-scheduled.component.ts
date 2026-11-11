import { afterNextRender, computed, input, viewChild, ChangeDetectionStrategy, Component, InputSignal, Signal } from '@angular/core';

import { RtChatComponent } from '../../rt-chat.component';
import { ERtChatMessageStatus, IRtChat } from '../../rt-chat.model';
import { TestRtChatEditBarComponent } from './test-chat-edit-bar.component';

/** Время сегодняшнего дня: подпись «Сегодня» в кадре не зависит от дня съёмки. */
function today(hours: number, minutes: number): string {
    const date: Date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
}

/**
 * Разговор с отложенным ответом в коробке заданной ширины: кадры 768 и 375 рисуют только его.
 * Подпись длиннее обычной строки, поэтому на узкой ширине видно, остаётся ли подвал в пузыре.
 */
@Component({
    selector: 'app-chat-scheduled',
    imports: [RtChatComponent, TestRtChatEditBarComponent],
    templateUrl: './test-chat-scheduled.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestRtChatScheduledComponent {
    protected readonly chat: Signal<RtChatComponent | undefined> = viewChild(RtChatComponent);

    public width: number = 375;

    public height: number = 742;

    public editing: boolean = false;

    /** Подпись сообщения: на узкой ширине длинная должна остаться внутри пузыря. */
    public readonly dateLabel: InputSignal<string> = input<string>('Уйдёт 8 ноября в 10:00');

    public readonly messages: Signal<readonly IRtChat.Message[]> = computed((): readonly IRtChat.Message[] => [
        {
            id: 1,
            author: 'Анна',
            own: false,
            text: 'Добрый день! Можно заехать на час раньше?',
            createdAt: today(12, 58),
            dateLabel: 'Переведено · 12:58',
        },
        {
            id: 2,
            author: 'Вы',
            own: true,
            text: 'Здравствуйте! Да, дом будет готов к 13:00.',
            createdAt: today(13, 2),
            status: ERtChatMessageStatus.Read,
        },
        {
            id: 3,
            author: 'Вы',
            own: true,
            text: 'Ключи оставлю у охраны на въезде.',
            createdAt: today(13, 2),
            status: ERtChatMessageStatus.Read,
        },
        {
            id: 4,
            author: 'Анна',
            own: false,
            text: 'Можно выехать в 14:00?',
            createdAt: today(13, 5),
            dateLabel: 'Переведено · 13:05',
        },
        {
            id: 5,
            author: 'Вы',
            own: true,
            text: 'Да, поздний выезд до 14:00 подтверждаю.',
            createdAt: today(13, 6),
            dateLabel: this.dateLabel(),
            dateIcon: 'clock',
        },
    ]);

    constructor() {
        // Кадр правки держит текст в поле, а курсор в кадр не попадает
        afterNextRender((): void => {
            if (this.editing) {
                this.chat()?.setDraft('Да, поздний выезд до 14:00 подтверждаю.');
                (document.activeElement as HTMLElement | null)?.blur();
            }
        });
    }
}
