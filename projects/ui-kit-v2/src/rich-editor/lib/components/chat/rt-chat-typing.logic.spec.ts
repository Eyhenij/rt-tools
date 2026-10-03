import { createEnvironmentInjector, runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { typingDraft, RtChatTypingTracker, RT_CHAT_TYPING_PAUSE_MS } from './rt-chat-typing.logic';

interface ITrackerSetup {
    tracker: RtChatTypingTracker;
    signals: boolean[];
    injector: EnvironmentInjector;
}

function setup(): ITrackerSetup {
    const signals: boolean[] = [];
    const injector: EnvironmentInjector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    const tracker: RtChatTypingTracker = runInInjectionContext(
        injector,
        (): RtChatTypingTracker => new RtChatTypingTracker((typing: boolean): number => signals.push(typing))
    );

    return { tracker, signals, injector };
}

describe('RtChatTypingTracker', (): void => {
    beforeEach((): void => {
        jest.useFakeTimers();
    });

    afterEach((): void => {
        jest.useRealTimers();
    });

    it('SC-UKV-579 — несколько символов подряд дают одно «начал»', (): void => {
        const { tracker, signals }: ITrackerSetup = setup();

        tracker.input('П');
        tracker.input('Пр');
        tracker.input('При');

        expect(signals).toEqual([true]);
    });

    it('SC-UKV-580 — пауза без ввода шлёт одно «перестал», следующий ввод начинает новый отрезок', (): void => {
        const { tracker, signals }: ITrackerSetup = setup();

        tracker.input('При');
        jest.advanceTimersByTime(RT_CHAT_TYPING_PAUSE_MS - 1);
        tracker.input('Прив');
        jest.advanceTimersByTime(RT_CHAT_TYPING_PAUSE_MS);
        tracker.input('Привет');

        expect(signals).toEqual([true, false, true]);
    });

    it('SC-UKV-581 — опустевшее поле кончает отрезок сразу, и пауза потом ничего не шлёт', (): void => {
        const { tracker, signals }: ITrackerSetup = setup();

        tracker.input('Да');
        tracker.input('  ');
        jest.advanceTimersByTime(RT_CHAT_TYPING_PAUSE_MS);

        expect(signals).toEqual([true, false]);
    });

    it('SC-UKV-581 — отправка кончает отрезок, а кончившийся отрезок второй раз не шлёт', (): void => {
        const { tracker, signals }: ITrackerSetup = setup();

        tracker.input('Да');
        tracker.stop();
        tracker.stop();

        expect(signals).toEqual([true, false]);
    });

    it('SC-UKV-584 — уничтоженная переписка после паузы ничего не шлёт', (): void => {
        const { tracker, signals, injector }: ITrackerSetup = setup();

        tracker.input('Да');
        injector.destroy();
        jest.advanceTimersByTime(RT_CHAT_TYPING_PAUSE_MS);

        expect(signals).toEqual([true]);
    });
});

describe('typingDraft', (): void => {
    it('SC-UKV-582 — текст берётся из textarea обычного поля', (): void => {
        const area: HTMLTextAreaElement = document.createElement('textarea');
        area.value = 'Добрый день';

        expect(typingDraft(area)).toBe('Добрый день');
    });

    it('SC-UKV-582 — текст берётся из редактируемого узла поля с оформлением', (): void => {
        const editor: HTMLDivElement = document.createElement('div');
        editor.setAttribute('contenteditable', 'true');
        editor.innerHTML = '<p>Добрый <b>день</b></p>';

        expect(typingDraft(editor)).toBe('Добрый день');
    });

    it('SC-UKV-582 — выбор файла набором не считается', (): void => {
        const picker: HTMLInputElement = document.createElement('input');
        picker.type = 'file';

        expect(typingDraft(picker)).toBeNull();
    });
});
