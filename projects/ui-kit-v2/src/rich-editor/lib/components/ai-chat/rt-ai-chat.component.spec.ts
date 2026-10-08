import { ChangeDetectionStrategy, Component, DebugElement, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { createRtFixture, qa, qaAll, textOf } from '../../../../testing/rt-kit-testing';
import { RtThreadListComponent } from '../../../../lib/components/thread-list/rt-thread-list.component';
import { IRtThreadList } from '../../../../lib/components/thread-list/rt-thread-list.model';
import { RtAiChatComponent } from './rt-ai-chat.component';
import { RtAiChatMessageExtraDirective } from './rt-ai-chat.directives';
import { IRtAiChat } from './rt-ai-chat.model';

const QUESTION: IRtAiChat.Message = { id: 'q1', role: 'user', text: 'How did occupancy change?', time: '14:02' };

const ANSWER: IRtAiChat.Message = {
    id: 'a1',
    role: 'assistant',
    text: 'Occupancy grew by **4 points**.',
    run: { state: 'done', label: 'Answered', steps: [{ label: 'Queried occupancy', status: 'complete' }] },
};

const THREADS: readonly IRtAiChat.Thread[] = [
    { id: 't1', title: 'Occupancy last week', time: '14:02' },
    { id: 't2', title: 'Pickup for summer', unreadCount: 2 },
];

@Component({
    selector: 'rt-ai-chat-host',
    template: `
        <rt-ai-chat
            [title]="title()"
            [disclaimer]="disclaimer()"
            [messages]="messages()"
            [suggestions]="suggestions()"
            [sending]="sending()"
            [error]="error()"
            [threads]="threads()"
            [fullScreen]="fullScreen()"
            (send)="sent.push($event)"
            (retry)="retried = retried + 1"
            (selectThread)="selected.push($event)"
            (deleteThread)="deleted.push($event)"
            (feedbackChange)="feedback.push($event)">
            @if (withExtra()) {
                <ng-template let-message rtAiChatMessageExtra>
                    <span qa-dataid="extra">{{ message.id }}</span>
                </ng-template>
            }
        </rt-ai-chat>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAiChatComponent, RtAiChatMessageExtraDirective],
})
class AiChatHostComponent {
    public readonly title: WritableSignal<string> = signal<string>('');
    public readonly disclaimer: WritableSignal<string | null> = signal<string | null>(null);
    public readonly messages: WritableSignal<readonly IRtAiChat.Message[]> = signal<readonly IRtAiChat.Message[]>([]);
    public readonly suggestions: WritableSignal<readonly string[]> = signal<readonly string[]>([]);
    public readonly sending: WritableSignal<boolean> = signal<boolean>(false);
    public readonly error: WritableSignal<IRtAiChat.RunError | null> = signal<IRtAiChat.RunError | null>(null);
    public readonly threads: WritableSignal<readonly IRtAiChat.Thread[] | null> = signal<readonly IRtAiChat.Thread[] | null>(null);
    public readonly fullScreen: WritableSignal<boolean> = signal<boolean>(false);
    public readonly withExtra: WritableSignal<boolean> = signal<boolean>(false);
    public readonly sent: string[] = [];
    public readonly selected: string[] = [];
    public readonly deleted: string[] = [];
    public readonly feedback: IRtAiChat.FeedbackChange[] = [];
    public retried: number = 0;
}

function setup(state: Partial<Record<keyof AiChatHostComponent, unknown>> = {}): ComponentFixture<AiChatHostComponent> {
    const fixture: ComponentFixture<AiChatHostComponent> = createRtFixture(AiChatHostComponent, {}, { skipInitialDetect: true });
    const host: AiChatHostComponent = fixture.componentInstance;

    for (const [key, value] of Object.entries(state)) {
        (host[key as keyof AiChatHostComponent] as WritableSignal<unknown>).set(value);
    }
    fixture.detectChanges();

    return fixture;
}

function press(fixture: ComponentFixture<AiChatHostComponent>, id: string, index: number = 0): void {
    const node: HTMLElement = qaAll(fixture, id)[index].nativeElement as HTMLElement;

    (node.tagName === 'BUTTON' ? node : (node.querySelector('button') as HTMLButtonElement)).click();
    fixture.detectChanges();
}

function isDisabled(fixture: ComponentFixture<AiChatHostComponent>, id: string): boolean {
    const node: HTMLElement = qa(fixture, id)?.nativeElement as HTMLElement;

    return (node.querySelector('button') as HTMLButtonElement).disabled;
}

describe('RtAiChatComponent', (): void => {
    it('SC-UKV-750 — карточка подсказки отправляет свой текст', (): void => {
        const fixture: ComponentFixture<AiChatHostComponent> = setup({ suggestions: ['Give me an overview'] });

        expect(qa(fixture, 'ai-chat-empty')).not.toBeNull();

        press(fixture, 'ai-chat-suggestion');

        expect(fixture.componentInstance.sent).toEqual(['Give me an overview']);
    });

    it('SC-UKV-751 — вопрос пузырём с «You», ответ текстом в markdown', (): void => {
        const fixture: ComponentFixture<AiChatHostComponent> = setup({ messages: [QUESTION, ANSWER] });

        expect(textOf(qa(fixture, 'ai-chat-question'))).toContain('You');
        expect(textOf(qa(fixture, 'ai-chat-question'))).toContain('How did occupancy change?');
        expect(textOf(qa(fixture, 'ai-chat-answer-text'))).toContain('Occupancy grew by');
    });

    it('SC-UKV-752 — строка хода работы открывает шаги своего ответа', (): void => {
        const fixture: ComponentFixture<AiChatHostComponent> = setup({ messages: [QUESTION, ANSWER] });
        const toggle: () => HTMLElement = (): HTMLElement => qa(fixture, 'ai-run-status-toggle')?.nativeElement as HTMLElement;

        expect(toggle().getAttribute('aria-expanded')).toBe('false');

        toggle().click();
        fixture.detectChanges();

        expect(toggle().getAttribute('aria-expanded')).toBe('true');
    });

    it('SC-UKV-753 — оценка появляется у дописанного ответа, повторное нажатие её снимает', (): void => {
        const fixture: ComponentFixture<AiChatHostComponent> = setup({ messages: [QUESTION, { ...ANSWER, streaming: true }] });

        expect(qa(fixture, 'ai-chat-feedback')).toBeNull();

        fixture.componentInstance.messages.set([QUESTION, { ...ANSWER, feedback: 'liked' }]);
        fixture.detectChanges();
        press(fixture, 'ai-chat-like');
        press(fixture, 'ai-chat-dislike');

        expect(fixture.componentInstance.feedback).toEqual([
            { messageId: 'a1', feedback: null },
            { messageId: 'a1', feedback: 'disliked' },
        ]);
    });

    it('SC-UKV-754 — пока ответ пишется, поле предлагает «Стоп», подсказки и новая беседа выключены', (): void => {
        const fixture: ComponentFixture<AiChatHostComponent> = setup({ sending: true, suggestions: ['Give me an overview'] });

        expect(qa(fixture, 'message-composer-stop')).not.toBeNull();
        expect(isDisabled(fixture, 'ai-chat-new-thread')).toBe(true);
        expect((qa(fixture, 'prompt-suggestion')?.nativeElement as HTMLButtonElement).disabled).toBe(true);
    });

    it('SC-UKV-755 — ошибка с номером обращения и «Ask again» только у повторяемой', (): void => {
        const fixture: ComponentFixture<AiChatHostComponent> = setup({
            messages: [QUESTION],
            error: { message: 'The assistant could not finish.', referenceId: 'ref-42', retryable: true },
        });

        expect(textOf(qa(fixture, 'ai-chat-error'))).toContain('The assistant could not finish.');
        expect(textOf(qa(fixture, 'copy-value-value'))).toBe('ref-42');

        press(fixture, 'ai-chat-retry');

        expect(fixture.componentInstance.retried).toBe(1);

        fixture.componentInstance.error.set({ message: 'The assistant could not finish.' });
        fixture.detectChanges();

        expect(qa(fixture, 'ai-chat-retry')).toBeNull();
        expect(qa(fixture, 'copy-value-value')).toBeNull();
    });

    it('SC-UKV-756 — беседы встают на место ленты, на весь экран — колонкой; выбор возвращает ленту', (): void => {
        const fixture: ComponentFixture<AiChatHostComponent> = setup({ messages: [QUESTION, ANSWER], threads: THREADS });

        press(fixture, 'ai-chat-threads');

        expect(qa(fixture, 'ai-chat-thread-list')).not.toBeNull();
        expect(qa(fixture, 'ai-chat-feed')).toBeNull();

        press(fixture, 'thread-list-row', 1);

        expect(fixture.componentInstance.selected).toEqual(['t2']);
        expect(qa(fixture, 'ai-chat-feed')).not.toBeNull();

        fixture.componentInstance.fullScreen.set(true);
        fixture.detectChanges();

        expect(qa(fixture, 'ai-chat-thread-column')).not.toBeNull();
        expect(qa(fixture, 'ai-chat-feed')).not.toBeNull();
    });

    it('SC-UKV-757 — поиск по беседам отмечает совпадения, пустой итог — «Nothing found»', (): void => {
        const fixture: ComponentFixture<AiChatHostComponent> = setup({ threads: THREADS, fullScreen: true });
        const list: RtThreadListComponent<IRtThreadList.Row> = fixture.debugElement.query(
            By.directive(RtThreadListComponent)
        ).componentInstance;

        list.searchChange.emit('occ');
        fixture.detectChanges();

        expect(qaAll(fixture, 'ai-chat-thread-title').map((node: DebugElement): string => textOf(node))).toContain('Occupancy last week');
        expect(
            fixture.debugElement.queryAll(By.css('.rt-ai-chat__thread-part--match')).map((node: DebugElement): string => textOf(node))
        ).toEqual(['Occ']);

        fixture.componentInstance.threads.set([]);
        fixture.detectChanges();

        expect(textOf(qa(fixture, 'thread-list-empty'))).toContain('Nothing found');
    });

    it('SC-UKV-758 — удаление беседы не открывает её', (): void => {
        const fixture: ComponentFixture<AiChatHostComponent> = setup({ threads: THREADS, fullScreen: true });

        press(fixture, 'ai-chat-delete-thread', 1);

        expect(fixture.componentInstance.deleted).toEqual(['t2']);
        expect(fixture.componentInstance.selected).toEqual([]);
    });

    it('SC-UKV-759 — вложения приложения стоят под ответом и получают сообщение', (): void => {
        const fixture: ComponentFixture<AiChatHostComponent> = setup({ messages: [QUESTION, ANSWER], withExtra: true });

        expect(textOf(qa(fixture, 'extra'))).toBe('a1');
    });

    it('SC-UKV-760 — тексты приложения вместо подписей кита, пустая строка под полем её прячет', (): void => {
        const fixture: ComponentFixture<AiChatHostComponent> = setup();

        expect(textOf(qa(fixture, 'ai-chat-title'))).toBe('Assistant');
        expect(qa(fixture, 'ai-chat-disclaimer')).not.toBeNull();

        fixture.componentInstance.title.set('Ava');
        fixture.componentInstance.disclaimer.set('');
        fixture.detectChanges();

        expect(textOf(qa(fixture, 'ai-chat-title'))).toBe('Ava');
        expect(qa(fixture, 'ai-chat-disclaimer')).toBeNull();
    });

    it('SC-UKV-761 — открытый список бесед ставит фокус на «назад», выбор беседы — в поле сообщения', async (): Promise<void> => {
        const fixture: ComponentFixture<AiChatHostComponent> = setup({ messages: [QUESTION, ANSWER], threads: THREADS });
        const documentRef: Document = (fixture.nativeElement as HTMLElement).ownerDocument;

        documentRef.body.appendChild(fixture.nativeElement as HTMLElement);
        press(fixture, 'ai-chat-threads');
        await fixture.whenStable();

        expect(documentRef.activeElement).toBe((qa(fixture, 'ai-chat-back')?.nativeElement as HTMLElement).querySelector('button'));

        press(fixture, 'thread-list-row', 0);
        await fixture.whenStable();

        expect(documentRef.activeElement).toBe(qa(fixture, 'message-composer-input')?.nativeElement);
    });
});
