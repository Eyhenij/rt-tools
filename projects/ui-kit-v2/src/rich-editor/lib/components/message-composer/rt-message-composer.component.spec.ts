import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { QuillMock, quillInstances, resetQuillInstances } from '../../../../testing/quill-mock';
import { createRtFixture, el, hostClasses, qa, qaAll, setInputs } from '../../../../testing/rt-kit-testing';

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

function stopButton(fixture: ComponentFixture<RtMessageComposerComponent>): HTMLButtonElement | null {
    return (
        (el(fixture, '[qa-dataid="message-composer-stop"] [qa-dataid="icon-button-control"]')?.nativeElement as HTMLButtonElement) ?? null
    );
}

function capsule(fixture: ComponentFixture<RtMessageComposerComponent>): HTMLElement {
    return qa(fixture, 'message-composer-capsule')?.nativeElement as HTMLElement;
}

describe('RtMessageComposerComponent', (): void => {
    it('несёт свой BEM-блок и рисует поле ввода', (): void => {
        const fixture: ComponentFixture<RtMessageComposerComponent> = setup();

        expect(hostClasses(fixture)).toContain('rt-message-composer');
        expect(field(fixture).placeholder).toBe('Type a message');
    });

    it('SC-UKV-480 — скрепка и отправка — круглые кнопки кита, скрепка приглушённая', (): void => {
        const fixture: ComponentFixture<RtMessageComposerComponent> = setup({ attachments: true });
        const attach: HTMLElement = qa(fixture, 'message-composer-attach')?.nativeElement as HTMLElement;
        const send: HTMLElement = qa(fixture, 'message-composer-send')?.nativeElement as HTMLElement;

        expect(attach.getAttribute('data-rt-radius')).toBe('full');
        expect(send.getAttribute('data-rt-radius')).toBe('full');
        expect(capsule(fixture).contains(attach)).toBe(true);
        expect(capsule(fixture).contains(send)).toBe(true);
        expect(qa(setup(), 'message-composer-attach')).toBeNull();
    });

    it('SC-UKV-481 — капсула становится высокой с файлом и в режиме форматирования', (): void => {
        const tall: string = 'rt-message-composer__capsule--tall';
        const fixture: ComponentFixture<RtMessageComposerComponent> = setup({ attachments: true });
        expect(capsule(fixture).classList).not.toContain(tall);

        setInputs(fixture, { droppedFiles: [file('Договор.pdf')] });
        fixture.detectChanges();

        expect(capsule(fixture).classList).toContain(tall);
        expect(capsule(setup({ formatting: true })).classList).toContain(tall);
    });

    it('SC-UKV-482 — поле растёт до maxRows строк, дальше прокрутка', (): void => {
        const fixture: ComponentFixture<RtMessageComposerComponent> = setup({ minRows: 1, maxRows: 6 });
        const autosize: CdkTextareaAutosize = fixture.debugElement
            .query(By.directive(CdkTextareaAutosize))
            .injector.get(CdkTextareaAutosize);

        expect(autosize.minRows).toBe(1);
        expect(autosize.maxRows).toBe(6);
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

        it('SC-UKV-486 — Enter отправляет, Shift+Enter переносит строку', (): void => {
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

        it('SC-UKV-486 — строка про Enter стоит под капсулой только со входом hint', (): void => {
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup({ hint: true });
            const hint: HTMLElement = qa(fixture, 'message-composer-hint')?.nativeElement as HTMLElement;

            expect(hint.textContent?.trim()).toBe('Enter to send, Shift + Enter for a new line');
            expect(capsule(fixture).contains(hint)).toBe(false);
            expect(qa(setup(), 'message-composer-hint')).toBeNull();
        });

        it('SC-UKV-483 — во время отправки поле и кнопка заблокированы, стрелку сменяет индикатор', (): void => {
            // Иначе второе сообщение ушло бы поверх ещё не доставленного.
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup();
            type(fixture, 'Привет');

            setInputs(fixture, { sending: true });
            fixture.detectChanges();

            expect(sendButton(fixture).disabled).toBe(true);
            expect(field(fixture).disabled).toBe(true);
            expect(el(fixture, '[qa-dataid="message-composer-send"] .rt-icon-button__spinner')).not.toBeNull();
        });

        it('SC-UKV-485 — выключенное поле бледное и ничего не принимает', (): void => {
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup({ attachments: true, disabled: true });
            const sent: jest.Mock = jest.fn();
            fixture.componentInstance.submitted.subscribe(sent);

            field(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            fixture.detectChanges();

            expect(field(fixture).disabled).toBe(true);
            expect(sendButton(fixture).disabled).toBe(true);
            expect(capsule(fixture).classList).toContain('rt-message-composer__capsule--disabled');
            expect(sent).not.toHaveBeenCalled();
        });
    });

    describe('ответ, который можно остановить', (): void => {
        it('SC-UKV-537 — вместо стрелки стоит «Стоп», поле принимает текст, Enter не отправляет и не стирает', (): void => {
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup({ stoppable: true });
            const sent: jest.Mock = jest.fn();
            const stopped: jest.Mock = jest.fn();
            fixture.componentInstance.submitted.subscribe(sent);
            fixture.componentInstance.stopped.subscribe(stopped);
            expect(stopButton(fixture)).toBeNull();

            setInputs(fixture, { sending: true });
            fixture.detectChanges();
            type(fixture, 'Следующий вопрос');
            field(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            fixture.detectChanges();

            expect(qa(fixture, 'message-composer-send')).toBeNull();
            expect(stopButton(fixture)?.disabled).toBe(false);
            expect(field(fixture).disabled).toBe(false);
            expect(field(fixture).value).toBe('Следующий вопрос');
            expect(sent).not.toHaveBeenCalled();

            stopButton(fixture)?.click();
            expect(stopped).toHaveBeenCalledTimes(1);
        });

        it('SC-UKV-537 — без stoppable sending по-прежнему блокирует поле и крутит стрелку', (): void => {
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup({ sending: true });

            expect(stopButton(fixture)).toBeNull();
            expect(field(fixture).disabled).toBe(true);
            expect(sendButton(fixture).disabled).toBe(true);
        });

        it('SC-UKV-537 — после ответа набранный текст отправляется', (): void => {
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup({ stoppable: true, sending: true });
            const sent: jest.Mock = jest.fn();
            fixture.componentInstance.submitted.subscribe(sent);
            type(fixture, 'Ещё вопрос');

            setInputs(fixture, { sending: false });
            fixture.detectChanges();
            sendButton(fixture).click();

            expect(sent).toHaveBeenCalledWith({ text: 'Ещё вопрос', files: [] });
        });
    });

    describe('черновик снаружи', (): void => {
        it('SC-UKV-538 — заданный черновик стоит в поле, правки уходят наружу, после отправки пусто', (): void => {
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup({ text: 'Черновик' });
            const composer: RtMessageComposerComponent = fixture.componentInstance;
            expect(field(fixture).value).toBe('Черновик');

            type(fixture, 'Черновик дописан');
            expect(composer.text()).toBe('Черновик дописан');

            sendButton(fixture).click();
            fixture.detectChanges();
            expect(composer.text()).toBe('');
            expect(field(fixture).value).toBe('');
        });

        it('SC-UKV-538 — очищенный снаружи черновик пропадает из поля', (): void => {
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup({ text: 'Черновик' });

            setInputs(fixture, { text: '' });
            fixture.detectChanges();

            expect(field(fixture).value).toBe('');
            expect(sendButton(fixture).disabled).toBe(true);
        });
    });

    describe('фокус', (): void => {
        it('SC-UKV-539 — потребитель ставит фокус в поле', (): void => {
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup();
            expect(fixture.nativeElement.ownerDocument.activeElement).not.toBe(field(fixture));

            fixture.componentInstance.focus();

            expect(fixture.nativeElement.ownerDocument.activeElement).toBe(field(fixture));
        });

        it('SC-UKV-539 — в режиме форматирования фокус получает редактор', async (): Promise<void> => {
            resetQuillInstances();
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup({ formatting: true });
            // Редактор приходит динамическим импортом, `whenStable` о нём не знает — ждём очередь задач.
            await new Promise<void>((resolve: () => void): void => {
                setTimeout(resolve, 0);
            });

            fixture.componentInstance.focus();

            expect(quillInstances.at(-1)?.focused).toBe(true);
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

        it('SC-UKV-487 — файлы стоят в капсуле, уезжают вместе с сообщением и поле очищается', (): void => {
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup({ attachments: true });
            const sent: IRtMessageComposer.SubmitPayload[] = [];
            fixture.componentInstance.submitted.subscribe((payload: IRtMessageComposer.SubmitPayload): void => {
                sent.push(payload);
            });
            setInputs(fixture, { droppedFiles: [file('Договор.pdf')] });
            fixture.detectChanges();
            type(fixture, 'Смотрите вложение');
            expect(capsule(fixture).contains(qa(fixture, 'message-composer-files')?.nativeElement as HTMLElement)).toBe(true);

            sendButton(fixture).click();
            fixture.detectChanges();

            expect(sent[0].files.length).toBe(1);
            expect(qa(fixture, 'message-composer-file')).toBeNull();
        });
    });

    describe('режим форматирования', (): void => {
        it('SC-UKV-488 — редактор с разметкой стоит в той же капсуле вместо простого поля', (): void => {
            const fixture: ComponentFixture<RtMessageComposerComponent> = setup({ formatting: true });

            expect(capsule(fixture).contains(qa(fixture, 'message-composer-rich')?.nativeElement as HTMLElement)).toBe(true);
            expect(qa(fixture, 'message-composer-input')).toBeNull();
            expect(qa(fixture, 'message-composer-send')).not.toBeNull();
        });

        it('пустой редактор отправить нельзя', (): void => {
            expect(sendButton(setup({ formatting: true })).disabled).toBe(true);
        });
    });
});
