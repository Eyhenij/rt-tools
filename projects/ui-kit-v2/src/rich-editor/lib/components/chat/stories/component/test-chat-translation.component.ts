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
const ERROR: string = 'Не удалось перевести';

/** Реплика гостя в оригинале с кнопкой перевода: от неё берутся загрузка и ошибка. */
const GUEST_ORIGINAL: IRtChat.Message = {
    id: 0,
    author: GUEST,
    own: false,
    text: 'Good afternoon! Can we check in an hour early?',
    createdAt: today(12, 58),
    translationLabel: 'Оригинал',
    canShowTranslation: true,
};

/** Своя реплика в оригинале с кнопкой перевода. */
const OWN_ORIGINAL: IRtChat.Message = {
    id: 0,
    author: 'Вы',
    own: true,
    text: REPLY,
    createdAt: today(13, 2),
    status: ERtChatMessageStatus.Read,
    translationLabel: 'Оригинал',
    canShowTranslation: true,
};

/**
 * Перевод реплики в обоих видах чата и в обеих темах: подпись перевода в строке времени и кнопка
 * «Показать перевод» под репликой, показанной в оригинале, её загрузка и ошибка перевода. Последнее нажатие кнопки выведено под
 * парой тем: событие уходит приложению, текст реплики кит не меняет.
 *
 * Ширина ящиков подобрана так, чтобы пузырь вышел шириной 280, как в кадре макета.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-chat-translation',
    templateUrl: './test-chat-translation.component.html',
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
        { ...GUEST_ORIGINAL, id: 2 },
        { ...GUEST_ORIGINAL, id: 21, translationLoading: true },
        { ...GUEST_ORIGINAL, id: 22, translationError: ERROR },
        {
            id: 3,
            author: 'Вы',
            own: true,
            text: REPLY,
            createdAt: today(13, 2),
            status: ERtChatMessageStatus.Read,
            translationLabel: 'Без перевода',
        },
        { ...OWN_ORIGINAL, id: 4 },
        { ...OWN_ORIGINAL, id: 41, translationLoading: true },
        { ...OWN_ORIGINAL, id: 42, translationError: ERROR },
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
        { ...GUEST_ORIGINAL, id: 6, dateLabel: '12:58' },
        { ...GUEST_ORIGINAL, id: 61, dateLabel: '12:58', translationLoading: true },
        { ...GUEST_ORIGINAL, id: 62, dateLabel: '12:58', translationError: ERROR },
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
