import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { QuillMock } from '../../../../testing/quill-mock';
import { createRtFixture, el, hostClasses, qa, qaAll, textOf } from '../../../../testing/rt-kit-testing';
import { ERtChatMessageStatus, IRtChat } from './rt-chat.model';
import { RtChatComponent } from './rt-chat.component';

// Редактор с разметкой грузит Quill динамическим импортом — в jsdom он не
// поднимается. `__esModule` обязателен для интеропа.
jest.mock('quill', (): { __esModule: true; default: typeof QuillMock } => ({ __esModule: true, default: QuillMock }));

function message(patch: Partial<IRtChat.Message> = {}): IRtChat.Message {
    return {
        id: 1,
        author: 'Иванов',
        own: false,
        text: 'Здравствуйте',
        createdAt: '2026-03-15T10:00:00Z',
        ...patch,
    };
}

/**
 * По умолчанию переписка выбрана: без неё чат рисует только подсказку выбора,
 * и проверять в нём нечего.
 */
function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtChatComponent> {
    return createRtFixture(RtChatComponent, { hasThread: true, ...inputs });
}

function messages(fixture: ComponentFixture<RtChatComponent>): HTMLElement[] {
    return qaAll(fixture, 'chat-message').map((node: DebugElement): HTMLElement => node.nativeElement as HTMLElement);
}

describe('RtChatComponent', (): void => {
    it('несёт свой BEM-блок и ленту сообщений', (): void => {
        const fixture: ComponentFixture<RtChatComponent> = setup();

        expect(hostClasses(fixture)).toContain('rt-chat');
        expect(qa(fixture, 'chat-thread')).not.toBeNull();
    });

    describe('лента', (): void => {
        it('рисует по сообщению на запись', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({
                messages: [message(), message({ id: 2, own: true, text: 'Добрый день' })],
            });

            expect(messages(fixture).length).toBe(2);
            expect(qaAll(fixture, 'chat-message-text').map((node: DebugElement): string => textOf(node))).toEqual([
                'Здравствуйте',
                'Добрый день',
            ]);
        });

        it('первая загрузка рисует заглушки вместо сообщений', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ loading: true });

            expect(qaAll(fixture, 'chat-message-skeleton').length).toBeGreaterThan(0);
        });

        it('пустая переписка рисует подсказку', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup();

            expect(qa(fixture, 'chat-empty-thread')).not.toBeNull();
        });

        it('удалённое сообщение показывается отдельной пометкой, а не текстом', (): void => {
            // Текст стёрт, но место в переписке остаётся: иначе непонятно,
            // на что отвечали соседние реплики.
            const fixture: ComponentFixture<RtChatComponent> = setup({ messages: [message({ deleted: true })] });

            expect(qa(fixture, 'chat-message-deleted')).not.toBeNull();
            expect(qa(fixture, 'chat-message-text')).toBeNull();
        });

        it('автор и время рисуются рядом с текстом', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ messages: [message()] });

            expect(textOf(qa(fixture, 'chat-message-author'))).toContain('Иванов');
            expect(qa(fixture, 'chat-message-date')).not.toBeNull();
        });

        it('неотправленное сообщение получает кнопку повтора', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({
                messages: [message({ own: true, status: ERtChatMessageStatus.Failed })],
            });

            expect(qa(fixture, 'chat-message-retry')).not.toBeNull();
        });

        it('вложения сообщения рисуются списком', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({
                messages: [message({ attachments: [{ id: 1, name: 'Договор.pdf', publicId: 'abc' }] })],
            });

            expect(qaAll(fixture, 'chat-message-attachment').length).toBe(1);
        });
    });

    describe('поле ответа', (): void => {
        it('без разрешения ответа поля нет — вместо него причина', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ replyBlockReason: 'Переписка закрыта' });

            expect(qa(fixture, 'chat-composer')).toBeNull();
            expect(textOf(qa(fixture, 'chat-reply-block'))).toContain('Переписка закрыта');
        });

        it('с разрешением появляется поле и кнопка отправки', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ canReply: true });

            expect(qa(fixture, 'chat-composer-input')).not.toBeNull();
            expect(qa(fixture, 'chat-composer-send')).not.toBeNull();
        });

        it('отправка отдаёт текст наружу', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ canReply: true });
            const sent: IRtChat.SendPayload[] = [];
            fixture.componentInstance.send.subscribe((payload: IRtChat.SendPayload): void => {
                sent.push(payload);
            });
            const field: HTMLTextAreaElement = qa(fixture, 'chat-composer-input')?.nativeElement as HTMLTextAreaElement;
            field.value = 'Спасибо';
            field.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            qa(fixture, 'chat-composer-send')?.nativeElement.click();
            fixture.detectChanges();

            expect(sent.length).toBe(1);
            expect(sent[0].text).toBe('Спасибо');
        });
    });

    describe('набор текста', (): void => {
        function typeInto(fixture: ComponentFixture<RtChatComponent>, field: HTMLTextAreaElement | HTMLInputElement, value: string): void {
            field.value = value;
            field.dispatchEvent(new Event('input', { bubbles: true }));
            fixture.detectChanges();
        }

        function typingSignals(fixture: ComponentFixture<RtChatComponent>): boolean[] {
            const signals: boolean[] = [];
            fixture.componentInstance.typing.subscribe((typing: boolean): number => signals.push(typing));
            return signals;
        }

        it('SC-UKV-582 — ввод в обычное поле шлёт «начал», выбор файла ничего не шлёт', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ canReply: true, attachments: true });
            const signals: boolean[] = typingSignals(fixture);

            typeInto(fixture, qa(fixture, 'chat-composer-file-input')?.nativeElement as HTMLInputElement, '');
            expect(signals).toEqual([]);

            typeInto(fixture, qa(fixture, 'chat-composer-input')?.nativeElement as HTMLTextAreaElement, 'Сп');
            typeInto(fixture, qa(fixture, 'chat-composer-input')?.nativeElement as HTMLTextAreaElement, 'Спа');
            expect(signals).toEqual([true]);
        });

        it('SC-UKV-582 — ввод в поле с оформлением шлёт «начал»', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ canReply: true, richComposer: true });
            const signals: boolean[] = typingSignals(fixture);
            const field: HTMLTextAreaElement = el(fixture, '[qa-dataid="chat-composer-rich"] textarea')
                ?.nativeElement as HTMLTextAreaElement;

            typeInto(fixture, field, 'Да');

            expect(signals).toEqual([true]);
        });

        it('SC-UKV-581 — отправка кончает отрезок набора', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ canReply: true });
            const signals: boolean[] = typingSignals(fixture);

            typeInto(fixture, qa(fixture, 'chat-composer-input')?.nativeElement as HTMLTextAreaElement, 'Спасибо');
            qa(fixture, 'chat-composer-send')?.nativeElement.click();
            fixture.detectChanges();

            expect(signals).toEqual([true, false]);
        });

        it('SC-UKV-583 — строка второй стороны показывается по тексту и прячется пустой, живая область остаётся', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ typingText: 'Оператор печатает…' });
            const line: HTMLElement = qa(fixture, 'chat-typing')?.nativeElement as HTMLElement;

            expect(line.getAttribute('aria-live')).toBe('polite');
            expect(line.textContent?.trim()).toBe('Оператор печатает…');
            expect(line.classList).toContain('rt-chat__typing--shown');

            fixture.componentRef.setInput('typingText', '');
            fixture.detectChanges();

            expect(qa(fixture, 'chat-typing')).not.toBeNull();
            expect(line.textContent?.trim()).toBe('');
            expect(line.classList).not.toContain('rt-chat__typing--shown');
        });
    });

    describe('шапка', (): void => {
        it('заголовок рисуется, когда задан', (): void => {
            expect(textOf(qa(setup({ title: 'Переписка по заявке', showRefresh: true }), 'chat-title'))).toBe('Переписка по заявке');
        });

        it('кнопки обновления и разворота появляются по входам', (): void => {
            expect(qa(setup(), 'chat-refresh')).toBeNull();
            expect(qa(setup({ showRefresh: true }), 'chat-refresh')).not.toBeNull();
            expect(qa(setup({ showExpand: true }), 'chat-expand')).not.toBeNull();
        });

        it('обновление поднимает своё событие', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ showRefresh: true });
            const refreshes: jest.Mock = jest.fn();
            fixture.componentInstance.refresh.subscribe(refreshes);

            el(fixture, '[qa-dataid="chat-refresh"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
            fixture.detectChanges();

            expect(refreshes).toHaveBeenCalledTimes(1);
        });
    });

    it('без выбранной переписки рисуется подсказка выбора', (): void => {
        const fixture: ComponentFixture<RtChatComponent> = setup({ hasThread: false });

        expect(qa(fixture, 'chat-empty-hint')).not.toBeNull();
    });
});
