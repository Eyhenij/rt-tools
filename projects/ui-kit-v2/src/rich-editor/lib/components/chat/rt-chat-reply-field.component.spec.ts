import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { QuillMock } from '../../../../testing/quill-mock';
import { createRtFixture, el, qa, qaAll } from '../../../../testing/rt-kit-testing';
import { RtChatComponent } from './rt-chat.component';

// Редактор с разметкой грузит Quill динамическим импортом — в jsdom он не
// поднимается. `__esModule` обязателен для интеропа.
jest.mock('quill', (): { __esModule: true; default: typeof QuillMock } => ({ __esModule: true, default: QuillMock }));

/** Переписка выбрана: без неё чат рисует только подсказку выбора. */
function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtChatComponent> {
    return createRtFixture(RtChatComponent, { hasThread: true, ...inputs });
}

describe('RtChatComponent: поле ответа', (): void => {
    describe('слот над полем ответа', (): void => {
        function barIsFirst(fixture: ComponentFixture<RtChatComponent>, field: string): boolean {
            // Узлы приходят в порядке документа: первым должен стоять слот, а не поле.
            const host: HTMLElement = fixture.nativeElement as HTMLElement;
            const first: Element | null = host.querySelector(`[qa-dataid="chat-composer-bar"], [qa-dataid="${field}"]`);
            return first?.getAttribute('qa-dataid') === 'chat-composer-bar' && qa(fixture, field) !== null;
        }

        it('SC-UKV-1165 — слот стоит над полем во всех видах поля', (): void => {
            expect(barIsFirst(setup({ canReply: true }), 'chat-composer')).toBe(true);
            expect(barIsFirst(setup({ canReply: true, richComposer: true }), 'chat-composer-rich')).toBe(true);
            expect(barIsFirst(setup({ canReply: true, messenger: true }), 'chat-composer-prompt')).toBe(true);
        });

        it('SC-UKV-1166 — пустой слот не содержит узлов и стиль его прячет', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ canReply: true });
            const bar: HTMLElement = el(fixture, '[qa-dataid="chat-composer-bar"]')?.nativeElement as HTMLElement;
            const styles: string = readFileSync(join(__dirname, 'rt-chat.component.scss'), 'utf8');

            expect(bar.matches(':empty')).toBe(true);
            expect(styles).toMatch(/&__composer-bar \{[^}]*&:empty \{\s*display: none;/);
        });

        it('SC-UKV-1165 — без разрешения ответа слота нет', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ canReply: false });

            expect(qa(fixture, 'chat-composer-bar')).toBeNull();
        });
    });

    describe('чтение черновика', (): void => {
        const TEXT: string = 'Готовый ответ';

        it('SC-UKV-1167 — метод читает обычное поле', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ canReply: true });

            fixture.componentInstance.setDraft(TEXT);
            fixture.detectChanges();

            expect(fixture.componentInstance.draftText()).toBe(TEXT);
        });

        it('SC-UKV-1167 — метод читает компактный композер', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ canReply: true, richComposer: true });

            fixture.componentInstance.setDraft(TEXT);
            fixture.detectChanges();

            expect(fixture.componentInstance.draftText()).toBe(TEXT);
        });

        it('SC-UKV-1167 — метод читает поле с разметкой без разметки', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ canReply: true, richComposer: true, formatting: true });

            fixture.componentInstance.setDraft(TEXT);
            fixture.detectChanges();

            expect(fixture.componentInstance.draftText()).toBe(TEXT);
        });

        it('SC-UKV-1167 — метод читает поле мессенджера', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ canReply: true, messenger: true });

            fixture.componentInstance.setDraft(TEXT);
            fixture.detectChanges();

            expect(fixture.componentInstance.draftText()).toBe(TEXT);
        });

        it('SC-UKV-1168 — выбранные файлы остаются и в ответ не входят', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ canReply: true, attachments: true });
            fixture.debugElement.query(By.css('rt-file-drop')).triggerEventHandler('filesDropped', [new File(['x'], 'план.pdf')]);
            fixture.detectChanges();

            expect(fixture.componentInstance.draftText()).toBe('');
            fixture.detectChanges();
            expect(qaAll(fixture, 'chat-composer-file').length).toBe(1);
        });

        it('SC-UKV-1168 — без поля ответа метод возвращает пустую строку', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ canReply: false });

            expect(fixture.componentInstance.draftText()).toBe('');
        });

        it('SC-UKV-1169 — метод отдаёт выбранные файлы и текст не трогает', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ canReply: true, attachments: true });
            const file: File = new File(['x'], 'план.pdf');
            fixture.componentInstance.setDraft(TEXT);
            fixture.debugElement.query(By.css('rt-file-drop')).triggerEventHandler('filesDropped', [file]);
            fixture.detectChanges();

            expect(fixture.componentInstance.draftFiles()).toEqual([file]);
            expect(fixture.componentInstance.draftText()).toBe(TEXT);
            expect(qaAll(fixture, 'chat-composer-file').length).toBe(1);
        });

        it('SC-UKV-1170 — без файлов и без поля ответа метод возвращает пустой список', (): void => {
            const withField: ComponentFixture<RtChatComponent> = setup({ canReply: true, attachments: true });
            const noField: ComponentFixture<RtChatComponent> = setup({ canReply: false });

            expect(qaAll(withField, 'chat-composer-file').length).toBe(0);
            expect(withField.componentInstance.draftFiles()).toEqual([]);
            expect(noField.componentInstance.draftFiles()).toEqual([]);
        });
    });

    describe('подстановка текста', (): void => {
        const TEXT: string = 'Готовый ответ';

        function field(fixture: ComponentFixture<RtChatComponent>, selector: string): HTMLTextAreaElement {
            return el(fixture, selector)?.nativeElement as HTMLTextAreaElement;
        }

        function expectCaretAtEnd(node: HTMLTextAreaElement): void {
            expect(document.activeElement).toBe(node);
            expect(node.selectionStart).toBe(node.value.length);
            expect(node.selectionEnd).toBe(node.value.length);
        }

        function attached(fixture: ComponentFixture<RtChatComponent>): void {
            document.body.appendChild(fixture.nativeElement as HTMLElement);
        }

        it('SC-UKV-1157 — текст заменяет черновик обычного поля, курсор стоит в конце', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ canReply: true });
            attached(fixture);
            const input: HTMLTextAreaElement = field(fixture, '[qa-dataid="chat-composer-input"]');
            input.value = 'Старый черновик';
            input.dispatchEvent(new Event('input', { bubbles: true }));

            fixture.componentInstance.setDraft(TEXT);
            fixture.detectChanges();

            expect(input.value).toBe(TEXT);
            expectCaretAtEnd(input);
            expect((qa(fixture, 'chat-composer-send')?.nativeElement as HTMLButtonElement).disabled).toBe(false);
        });

        it('SC-UKV-1158 — текст встаёт в компактный композер', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ canReply: true, richComposer: true });
            attached(fixture);

            fixture.componentInstance.setDraft(TEXT);
            fixture.detectChanges();

            const input: HTMLTextAreaElement = field(fixture, '[qa-dataid="chat-composer-rich"] textarea');
            expect(input.value).toBe(TEXT);
            expectCaretAtEnd(input);
        });

        it('SC-UKV-1158 — текст встаёт в поле мессенджера', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ canReply: true, messenger: true });
            attached(fixture);

            fixture.componentInstance.setDraft(TEXT);
            fixture.detectChanges();

            const input: HTMLTextAreaElement = field(fixture, '[qa-dataid="chat-composer-prompt"] textarea');
            expect(input.value).toBe(TEXT);
            expectCaretAtEnd(input);
        });

        it('SC-UKV-1159 — выбранные файлы остаются', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ canReply: true, attachments: true });
            fixture.debugElement.query(By.css('rt-file-drop')).triggerEventHandler('filesDropped', [new File(['x'], 'договор.pdf')]);
            fixture.detectChanges();

            fixture.componentInstance.setDraft(TEXT);
            fixture.detectChanges();

            expect(qaAll(fixture, 'chat-composer-file').length).toBe(1);
        });

        it('SC-UKV-1160 — при отправке поле закрыто и черновик не меняется', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ canReply: true });
            const input: HTMLTextAreaElement = field(fixture, '[qa-dataid="chat-composer-input"]');
            input.value = 'Старый черновик';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            fixture.componentRef.setInput('sending', true);
            fixture.detectChanges();

            fixture.componentInstance.setDraft(TEXT);
            fixture.detectChanges();

            expect(input.value).toBe('Старый черновик');
        });

        it('SC-UKV-1160 — без разрешения ответа метод ничего не делает', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ canReply: false });

            expect((): void => fixture.componentInstance.setDraft(TEXT)).not.toThrow();
            expect(qa(fixture, 'chat-composer-input')).toBeNull();
        });

        it('SC-UKV-1161 — подстановка не шлёт сигнал набора', (): void => {
            const fixture: ComponentFixture<RtChatComponent> = setup({ canReply: true });
            const signals: boolean[] = [];
            fixture.componentInstance.typing.subscribe((typing: boolean): number => signals.push(typing));

            fixture.componentInstance.setDraft(TEXT);
            fixture.detectChanges();

            expect(signals).toEqual([]);
        });
    });
});
