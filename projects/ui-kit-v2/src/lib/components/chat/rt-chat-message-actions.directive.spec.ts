import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { QuillMock } from '../../../testing/quill-mock';
import { createRtFixture, qa, qaAll } from '../../../testing/rt-kit-testing';
import { RtMenuItemComponent } from '../menu/rt-menu-item.component';
import { RtChatMessageActionsDirective } from './rt-chat-message-actions.directive';
import { RtChatComponent } from './rt-chat.component';
import { IRtChat } from './rt-chat.model';

// Редактор с разметкой грузит Quill динамическим импортом — в jsdom он не поднимается.
jest.mock('quill', (): { __esModule: true; default: typeof QuillMock } => ({ __esModule: true, default: QuillMock }));

const MESSAGES: ReadonlyArray<IRtChat.Message> = [
    { id: 1, author: 'Иванов', own: false, text: 'Здравствуйте', createdAt: '2026-03-15T10:00:00Z', canDelete: true },
    { id: 2, author: 'Петров', own: true, text: 'Добрый день', createdAt: '2026-03-15T10:01:00Z' },
];

/** Панель меню живёт в перекрытии, а не в разметке кита. */
function menuPanel(): HTMLElement | null {
    return document.querySelector('[qa-dataid="menu-panel"]');
}

@Component({
    selector: 'rt-chat-actions-host',
    template: `
        <rt-chat hasThread [messages]="messages" [messageHasActions]="hasActions()">
            @if (withActions()) {
                <ng-template rtChatMessageActions let-item>
                    <rt-menu-item icon="link" [label]="'Ссылка на ' + item.text" (selected)="picked = item.id" />
                </ng-template>
            }
        </rt-chat>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtChatComponent, RtChatMessageActionsDirective, RtMenuItemComponent],
})
class ChatActionsHostComponent {
    public readonly messages: ReadonlyArray<IRtChat.Message> = MESSAGES;
    public readonly withActions: WritableSignal<boolean> = signal<boolean>(true);

    public readonly hasActions: WritableSignal<IRtChat.MessageActionsPredicate | null> = signal<IRtChat.MessageActionsPredicate | null>(
        null
    );

    public picked: number | string = 0;
}

function setup(): ComponentFixture<ChatActionsHostComponent> {
    return createRtFixture(ChatActionsHostComponent);
}

/** Кнопка действий у реплики: клик идёт по самому контролу, а не по обёртке. */
function openMenuOfMessage(fixture: ComponentFixture<ChatActionsHostComponent>, index: number): void {
    const trigger: HTMLElement = qaAll(fixture, 'menu-trigger')[index].nativeElement as HTMLElement;

    (trigger.querySelector('[qa-dataid="icon-button-control"]') as HTMLElement).click();
    fixture.detectChanges();
}

describe('RtChatMessageActionsDirective', (): void => {
    it('SC-UKV-73 — объявленный шаблон рисует точку действий у каждой реплики', (): void => {
        expect(qaAll(setup(), 'chat-message-actions').length).toBe(2);
    });

    it('SC-UKV-73 — пункт меню получает ту реплику, у которой меню открыли', (): void => {
        const fixture: ComponentFixture<ChatActionsHostComponent> = setup();

        openMenuOfMessage(fixture, 1);

        expect(menuPanel()?.textContent).toContain('Ссылка на Добрый день');
    });

    it('SC-UKV-73 — выбор пункта отдаёт наружу эту же реплику', (): void => {
        const fixture: ComponentFixture<ChatActionsHostComponent> = setup();

        openMenuOfMessage(fixture, 1);
        (menuPanel()?.querySelector('rt-menu-item') as HTMLElement).click();
        fixture.detectChanges();

        expect(fixture.componentInstance.picked).toBe(2);
    });

    it('SC-UKV-74 — шаблон не объявлен: точки действий нет, а точечные остались', (): void => {
        // Пара нужна целиком: реплики на месте в обоих случаях, и по одной не видно, дошёл
        // шаблон до неё или нет.
        const fixture: ComponentFixture<ChatActionsHostComponent> = setup();

        expect(qaAll(fixture, 'chat-message-actions').length).toBe(2);

        fixture.componentInstance.withActions.set(false);
        fixture.detectChanges();

        expect(qa(fixture, 'chat-message-actions')).toBeNull();
        expect(qa(fixture, 'chat-message-delete')).not.toBeNull();
    });

    it('SC-UKV-75 — признак гасит точку у одной реплики, не трогая соседнюю', (): void => {
        const fixture: ComponentFixture<ChatActionsHostComponent> = setup();

        fixture.componentInstance.hasActions.set((message: IRtChat.Message): boolean => !message.own);
        fixture.detectChanges();

        expect(qaAll(fixture, 'chat-message-actions').length).toBe(1);
    });
});
