import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';

import { StoryThemesComponent } from '../../../../../../showcase/story-themes.component';
import { RtChatComponent } from '../../rt-chat.component';
import { ERtChatMessageStatus, IRtChat } from '../../rt-chat.model';

/** Время сегодняшнего дня: подпись «Сегодня» в кадре не зависит от дня съёмки. */
function today(hours: number, minutes: number): string {
    const date: Date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
}

const GUEST: string = 'Анна Смирнова';
const REPLY: string = 'Ключи оставлю у охраны на въезде.';

/**
 * Перевод реплики в обоих видах чата и в обеих темах: подпись перевода в строке времени и кнопка
 * «Показать перевод» под репликой, показанной в оригинале. Последнее нажатие кнопки выведено под
 * парой тем: событие уходит приложению, текст реплики кит не меняет.
 *
 * Ширина ящиков подобрана так, чтобы пузырь вышел шириной 280, как в кадре макета.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-chat-translation',
    template: `
        <app-story-themes caption="Перевод реплики: подпись у времени и кнопка «Показать перевод»">
            <ng-template>
                <div style="display: flex; flex-direction: column; gap: 1rem">
                    <div
                        style="box-sizing: border-box; inline-size: 420px; block-size: 30rem; background-color: var(--rt-color-bg-surface)">
                        <rt-chat
                            style="height: 100%"
                            messenger
                            hasThread
                            title="№12 Анна Смирнова"
                            [messages]="messenger"
                            (showTranslation)="shown.set($event.id)" />
                    </div>
                    <div style="box-sizing: border-box; inline-size: 350px; background-color: var(--rt-color-bg-surface)">
                        <rt-chat hasThread title="Переписка с гостем" [messages]="plain" (showTranslation)="shown.set($event.id)" />
                    </div>
                </div>
            </ng-template>
        </app-story-themes>
        <p qa-dataid="chat-translation-shown">Показать перевод нажато у реплики: {{ shown() ?? '—' }}</p>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtChatComponent,

        // showcase
        StoryThemesComponent,
    ],
})
export class TestRtChatTranslationComponent {
    protected readonly shown: WritableSignal<number | string | null> = signal<number | string | null>(null);

    public readonly messenger: readonly IRtChat.Message[] = [
        {
            id: 1,
            author: GUEST,
            own: false,
            text: 'Добрый день! Можно заехать на час раньше?',
            createdAt: today(12, 58),
            translationLabel: 'Переведено',
        },
        {
            id: 2,
            author: GUEST,
            own: false,
            text: 'Good afternoon! Can we check in an hour early?',
            createdAt: today(12, 58),
            translationLabel: 'Оригинал',
            canShowTranslation: true,
        },
        {
            id: 3,
            author: 'Вы',
            own: true,
            text: REPLY,
            createdAt: today(13, 2),
            status: ERtChatMessageStatus.Read,
            translationLabel: 'Без перевода',
        },
        {
            id: 4,
            author: 'Вы',
            own: true,
            text: REPLY,
            createdAt: today(13, 2),
            status: ERtChatMessageStatus.Read,
            translationLabel: 'Оригинал',
            canShowTranslation: true,
        },
    ];

    /** Обычный вид пишет дату целиком, поэтому время в кадре задано готовой подписью. */
    public readonly plain: readonly IRtChat.Message[] = [
        {
            id: 5,
            author: GUEST,
            own: false,
            text: 'Добрый день! Можно заехать на час раньше?',
            createdAt: today(12, 58),
            dateLabel: '12:58',
            translationLabel: 'Переведено',
        },
        {
            id: 6,
            author: GUEST,
            own: false,
            text: 'Good afternoon! Can we check in an hour early?',
            createdAt: today(12, 58),
            dateLabel: '12:58',
            translationLabel: 'Оригинал',
            canShowTranslation: true,
        },
        {
            id: 7,
            author: 'Вы',
            own: true,
            text: REPLY,
            createdAt: today(13, 2),
            dateLabel: '13:02',
            status: ERtChatMessageStatus.Read,
            translationLabel: 'Без перевода',
        },
    ];
}
