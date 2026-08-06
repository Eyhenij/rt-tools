import { ComponentFixture } from '@angular/core/testing';

import { QuillMock } from '../../../testing/quill-mock';
import { createRtFixture, el, hostClasses, qa, qaAll, setInputs } from '../../../testing/rt-kit-testing';

// Редактор с разметкой грузит Quill динамическим импортом, а он в jsdom не
// поднимается. Подменяем сам модуль — проверяется обвязка кита, не редактор.
// `__esModule` обязателен: без него интероп-обёртка кладёт весь макет в
// `default`, и вместо конструктора приходит объект.
jest.mock('quill', (): { __esModule: true; default: typeof QuillMock } => ({ __esModule: true, default: QuillMock }));
import { IRtMessageComposer } from './rt-message-composer.model';
import { RtMessageComposerComponent } from './rt-message-composer.component';

function file(name: string): File {
    return new File([new Uint8Array(4)], name, { type: 'application/pdf' });
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtMessageComposerComponent> {
    return createRtFixture(RtMessageComposerComponent, inputs);
}

function field(fixture: ComponentFixture<RtMessageComposerComponent>): HTMLTextAreaElement {
    return qa(fixture, 'message-composer-input')?.nativeElement as HTMLTextAreaElement;
}

function type(fixture: ComponentFixture<RtMessageComposerComponent>, text: string): void {
    const node: HTMLTextAreaElement = field(fixture);
    node.value = text;
    node.dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

function sendButton(fixture: ComponentFixture<RtMessageComposerComponent>): HTMLButtonElement {
    return el(fixture, '[qa-dataid="message-composer-send"] [qa-dataid="icon-button-control"]')?.nativeElement as HTMLButtonElement;
}

describe('RtMessageComposerComponent', (): void => {
    it('несёт свой BEM-блок и рисует поле ввода', (): void => {
        const fixture: ComponentFixture<RtMessageComposerComponent> = setup();

        expect(hostClasses(fixture)).toContain('rt-message-composer');
        expect(field(fixture).placeholder).toBe('Type a message');
    });

    it('своя подсказка перебивает переведённую', (): void => {
        expect(field(setup({ placeholder: 'Ваш вопрос' })).placeholder).toBe('Ваш вопрос');
    });

    describe('отправка', (): void => {
        it('пустое поле отправить нельзя', (): void => {
            expect(sendButton(setup()).disabled).toBe(true);
        });

        it('пробелы значением не считаются', (): void => {
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup();

            type(fixture, '   ');

            expect(sendButton(fixture).disabled).toBe(true);
        });

        it('набранный текст разблокирует отправку', (): void => {
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup();

            type(fixture, 'Привет');

            expect(sendButton(fixture).disabled).toBe(false);
        });

        it('отправка отдаёт обрезанный текст и очищает поле', (): void => {
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup();
            const sent: IRtMessageComposer.SubmitPayload[] = [];
            fixture.componentInstance.submitted.subscribe((payload: IRtMessageComposer.SubmitPayload): void => {
                sent.push(payload);
            });
            type(fixture, '  Привет  ');

            sendButton(fixture).click();
            fixture.detectChanges();

            expect(sent).toEqual([{ text: 'Привет', files: [] }]);
            expect(field(fixture).value).toBe('');
        });

        it('Enter отправляет, Shift+Enter переносит строку', (): void => {
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup();
            const sent: jest.Mock = jest.fn();
            fixture.componentInstance.submitted.subscribe(sent);
            type(fixture, 'Привет');

            field(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true }));
            fixture.detectChanges();
            expect(sent).not.toHaveBeenCalled();

            field(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            fixture.detectChanges();
            expect(sent).toHaveBeenCalledTimes(1);
        });

        it('во время отправки поле и кнопка заблокированы', (): void => {
            // Иначе второе сообщение ушло бы поверх ещё не доставленного.
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup();
            type(fixture, 'Привет');

            setInputs(fixture, { sending: true });
            fixture.detectChanges();

            expect(sendButton(fixture).disabled).toBe(true);
            expect(field(fixture).disabled).toBe(true);
        });
    });

    describe('вложения', (): void => {
        it('без входа кнопки скрепки нет', (): void => {
            expect(qa(setup(), 'message-composer-attach')).toBeNull();
        });

        it('со входом появляется кнопка и скрытое поле выбора', (): void => {
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup({ attachments: true });

            expect(qa(fixture, 'message-composer-attach')).not.toBeNull();
            expect(qa(fixture, 'message-composer-file-input')).not.toBeNull();
        });

        it('один вложенный файл разблокирует отправку без текста', (): void => {
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup({ attachments: true });

            setInputs(fixture, { droppedFiles: [file('Договор.pdf')] });
            fixture.detectChanges();

            expect(qaAll(fixture, 'message-composer-file').length).toBe(1);
            expect(sendButton(fixture).disabled).toBe(false);
        });

        it('перетащенные файлы без разрешения вложений игнорируются', (): void => {
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup();

            setInputs(fixture, { droppedFiles: [file('Договор.pdf')] });
            fixture.detectChanges();

            expect(qa(fixture, 'message-composer-file')).toBeNull();
        });

        it('крестик на карточке убирает файл', (): void => {
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup({ attachments: true });
            setInputs(fixture, { droppedFiles: [file('Договор.pdf')] });
            fixture.detectChanges();

            el(fixture, '[qa-dataid="file-card-remove"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
            fixture.detectChanges();

            expect(qa(fixture, 'message-composer-file')).toBeNull();
        });

        it('файлы уезжают вместе с сообщением и поле очищается', (): void => {
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup({ attachments: true });
            const sent: IRtMessageComposer.SubmitPayload[] = [];
            fixture.componentInstance.submitted.subscribe((payload: IRtMessageComposer.SubmitPayload): void => {
                sent.push(payload);
            });
            setInputs(fixture, { droppedFiles: [file('Договор.pdf')] });
            fixture.detectChanges();
            type(fixture, 'Смотрите вложение');

            sendButton(fixture).click();
            fixture.detectChanges();

            expect(sent[0].files.length).toBe(1);
            expect(qa(fixture, 'message-composer-file')).toBeNull();
        });
    });

    describe('режим форматирования', (): void => {
        it('подменяет простое поле редактором с разметкой', (): void => {
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup({ formatting: true });

            expect(qa(fixture, 'message-composer-rich')).not.toBeNull();
            expect(qa(fixture, 'message-composer-input')).toBeNull();
        });

        it('пустой редактор отправить нельзя', (): void => {
            expect(sendButton(setup({ formatting: true })).disabled).toBe(true);
        });
    });
});
