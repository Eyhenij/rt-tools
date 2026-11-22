import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { QuillMock } from '../../../../testing/quill-mock';
import { createRtFixture, qa, textOf } from '../../../../testing/rt-kit-testing';
import {
    RtChatComposerBarDirective,
    RtChatComposerToolsDirective,
    RtChatFooterDirective,
    RtChatHeaderActionsDirective,
} from './rt-chat-slots.directive';
import { RtChatComponent } from './rt-chat.component';
import { IRtChat } from './rt-chat.model';

// Редактор с разметкой грузит Quill динамическим импортом — в jsdom он не поднимается.
jest.mock('quill', (): { __esModule: true; default: typeof QuillMock } => ({ __esModule: true, default: QuillMock }));

const MESSAGES: readonly IRtChat.Message[] = [
    { id: 1, author: 'Иванов', own: false, text: 'Здравствуйте', createdAt: '2026-03-15T10:00:00Z' },
];

/** Чат со всеми слотами-шаблонами; ветки открывает и закрывает владелец. */
@Component({
    selector: 'rt-chat-slots-host',
    template: `
        <rt-chat
            hasThread
            [messages]="messages"
            [messenger]="messenger()"
            [canReply]="canReply()"
            [replyBlockReason]="replyBlockReason()"
            [loading]="loading()"
            [error]="error()">
            <ng-template rtChatHeaderActions><button type="button" qa-dataid="slot-header-action">Бронь</button></ng-template>
            <ng-template rtChatComposerBar><span qa-dataid="slot-composer-bar">Правка</span></ng-template>
            <ng-template rtChatComposerTools><button type="button" qa-dataid="slot-composer-tool">Позже</button></ng-template>
            <ng-template rtChatFooter><button type="button" qa-dataid="slot-footer">Завести бронь</button></ng-template>
        </rt-chat>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtChatComponent,
        RtChatHeaderActionsDirective,
        RtChatComposerBarDirective,
        RtChatComposerToolsDirective,
        RtChatFooterDirective,
    ],
})
class ChatSlotsHostComponent {
    public readonly messages: readonly IRtChat.Message[] = MESSAGES;
    public readonly messenger: WritableSignal<boolean> = signal<boolean>(false);
    public readonly canReply: WritableSignal<boolean> = signal<boolean>(true);
    public readonly replyBlockReason: WritableSignal<string | null> = signal<string | null>(null);
    public readonly loading: WritableSignal<boolean> = signal<boolean>(false);
    public readonly error: WritableSignal<string | null> = signal<string | null>(null);
}

function setup(change: (host: ChatSlotsHostComponent) => void = (): void => undefined): ComponentFixture<ChatSlotsHostComponent> {
    const fixture: ComponentFixture<ChatSlotsHostComponent> = createRtFixture(ChatSlotsHostComponent);
    change(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
}

describe('RtChatComponent — слоты-шаблоны', (): void => {
    it('SC-UKV-1718 — скрытая шапка не строит своих кнопок', (): void => {
        const hidden: ComponentFixture<ChatSlotsHostComponent> = setup();
        expect(qa(hidden, 'slot-header-action')).toBeNull();

        const shown: ComponentFixture<ChatSlotsHostComponent> = setup((host: ChatSlotsHostComponent): void => host.messenger.set(true));
        expect(qa(shown, 'slot-header-action')).not.toBeNull();
    });

    it('SC-UKV-1719 — чат без ответа не строит полосы над полем и показывает причину', (): void => {
        const fixture: ComponentFixture<ChatSlotsHostComponent> = setup((host: ChatSlotsHostComponent): void => {
            host.canReply.set(false);
            host.replyBlockReason.set('Окно ответа закрыто');
        });

        expect(qa(fixture, 'slot-composer-bar')).toBeNull();
        expect(textOf(qa(fixture, 'chat-reply-block'))).toContain('Окно ответа закрыто');
    });

    it('SC-UKV-1720 — кнопки поля строятся только в поле мессенджера', (): void => {
        const plain: ComponentFixture<ChatSlotsHostComponent> = setup();
        expect(qa(plain, 'slot-composer-tool')).toBeNull();
        expect(qa(plain, 'slot-composer-bar')).not.toBeNull();

        const messenger: ComponentFixture<ChatSlotsHostComponent> = setup((host: ChatSlotsHostComponent): void => host.messenger.set(true));
        const tool: HTMLElement = qa(messenger, 'slot-composer-tool')?.nativeElement as HTMLElement;
        expect(tool.closest('rt-ai-prompt-input')).not.toBeNull();
    });

    it('SC-UKV-1721 — переписка, прочитанная с ошибкой, не строит подвала', (): void => {
        const fixture: ComponentFixture<ChatSlotsHostComponent> = setup((host: ChatSlotsHostComponent): void => host.error.set(''));

        expect(qa(fixture, 'chat-error')).not.toBeNull();
        expect(qa(fixture, 'slot-footer')).toBeNull();
    });

    it('SC-UKV-1735 — подвал рисуется под полем, пока переписка грузится', (): void => {
        const fixture: ComponentFixture<ChatSlotsHostComponent> = setup((host: ChatSlotsHostComponent): void => host.loading.set(true));
        const footer: HTMLElement = qa(fixture, 'chat-footer')?.nativeElement as HTMLElement;

        expect(footer.querySelector('[qa-dataid="slot-footer"]')).not.toBeNull();
    });
});
