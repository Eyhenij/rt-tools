import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, hostClasses, qa, setInputs, textOf } from '../../../testing/rt-kit-testing';
import { IRtAiPromptInput } from './rt-ai-prompt-input.model';
import { rtPromptCanSend, RtAiPromptInputComponent } from './rt-ai-prompt-input.component';

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtAiPromptInputComponent> {
    return createRtFixture(RtAiPromptInputComponent, inputs);
}

function field(fixture: ComponentFixture<RtAiPromptInputComponent>): HTMLTextAreaElement {
    return qa(fixture, 'ai-prompt-input-field')?.nativeElement;
}

function type(fixture: ComponentFixture<RtAiPromptInputComponent>, value: string): void {
    field(fixture).value = value;
    field(fixture).dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

function press(fixture: ComponentFixture<RtAiPromptInputComponent>, anchor: string): void {
    qa(fixture, anchor)?.nativeElement.querySelector('button')?.click();
    fixture.detectChanges();
}

describe('RtAiPromptInputComponent', (): void => {
    it('несёт свой BEM-блок на host-е', (): void => {
        expect(hostClasses(setup())).toContain('rt-ai-prompt-input');
    });

    it('SC-UKV-1069 — по умолчанию в ряду только отправка, а подсказка стоит под полем', (): void => {
        const fixture: ComponentFixture<RtAiPromptInputComponent> = setup();
        const host: HTMLElement = fixture.nativeElement;

        expect(qa(fixture, 'ai-prompt-input-send')).toBeTruthy();
        expect(qa(fixture, 'ai-prompt-input-attach')).toBeNull();
        expect(qa(fixture, 'ai-prompt-input-model')).toBeNull();
        expect(qa(fixture, 'ai-prompt-input-effort')).toBeNull();
        expect(qa(fixture, 'ai-prompt-input-mode')).toBeNull();
        expect(qa(fixture, 'ai-prompt-input-usage')).toBeNull();
        expect(textOf(qa(fixture, 'ai-prompt-input-hint'))).toBe('AI can make mistakes. Check important information.');
        expect(host.lastElementChild?.getAttribute('qa-dataid')).toBe('ai-prompt-input-hint');
    });

    it('SC-UKV-1069 — каждый элемент ряда включается своим входом', (): void => {
        const fixture: ComponentFixture<RtAiPromptInputComponent> = setup({
            attachments: true,
            model: 'Opus 5.5',
            effort: 'Medium',
            mode: 'Auto',
            usage: 32,
        });

        expect(qa(fixture, 'ai-prompt-input-attach')).toBeTruthy();
        expect(textOf(qa(fixture, 'ai-prompt-input-model'))).toBe('Opus 5.5');
        expect(textOf(qa(fixture, 'ai-prompt-input-effort'))).toBe('Medium');
        expect(textOf(qa(fixture, 'ai-prompt-input-mode'))).toBe('Auto');
        expect(qa(fixture, 'ai-prompt-input-usage')).toBeTruthy();
    });

    it('SC-UKV-1069 — нажатие на модель, усилие и режим сообщает, какую кнопку нажали', (): void => {
        const fixture: ComponentFixture<RtAiPromptInputComponent> = setup({ model: 'Opus 5.5', effort: 'Medium', mode: 'Auto' });
        const seen: IRtAiPromptInput.Control[] = [];
        fixture.componentInstance.controlPicked.subscribe((value: IRtAiPromptInput.Control): number => seen.push(value));

        qa(fixture, 'ai-prompt-input-model')?.nativeElement.click();
        qa(fixture, 'ai-prompt-input-effort')?.nativeElement.click();
        qa(fixture, 'ai-prompt-input-mode')?.nativeElement.click();

        expect(seen).toEqual(['model', 'effort', 'mode']);
    });

    it('SC-UKV-1047 — подсказка встаёт над полем по входу и пропадает на пустой строке', (): void => {
        const fixture: ComponentFixture<RtAiPromptInputComponent> = setup({ hint: 'Ассистент может ошибаться.', hintPosition: 'above' });
        const host: HTMLElement = fixture.nativeElement;

        expect(host.firstElementChild?.getAttribute('qa-dataid')).toBe('ai-prompt-input-hint');
        expect(textOf(qa(fixture, 'ai-prompt-input-hint'))).toBe('Ассистент может ошибаться.');

        setInputs(fixture, { hint: '' });
        fixture.detectChanges();

        expect(qa(fixture, 'ai-prompt-input-hint')).toBeNull();
    });

    it('SC-UKV-1048 — пустое поле не отправляется, текст уходит по Enter и поле пустеет', (): void => {
        const fixture: ComponentFixture<RtAiPromptInputComponent> = setup();
        const sent: IRtAiPromptInput.SubmitPayload[] = [];
        fixture.componentInstance.submitted.subscribe((value: IRtAiPromptInput.SubmitPayload): number => sent.push(value));

        type(fixture, '   ');
        field(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(sent).toEqual([]);

        type(fixture, '  Брони на ноябрь  ');
        field(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true }));
        expect(sent).toEqual([]);

        field(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        fixture.detectChanges();

        expect(sent).toEqual([{ text: 'Брони на ноябрь', files: [] }]);
        expect(fixture.componentInstance.text()).toBe('');
    });

    it('SC-UKV-1048 — кнопка отправки отдаёт текст', (): void => {
        const fixture: ComponentFixture<RtAiPromptInputComponent> = setup();
        const sent: IRtAiPromptInput.SubmitPayload[] = [];
        fixture.componentInstance.submitted.subscribe((value: IRtAiPromptInput.SubmitPayload): number => sent.push(value));

        type(fixture, 'Цена на Рождество');
        press(fixture, 'ai-prompt-input-send');

        expect(sent).toEqual([{ text: 'Цена на Рождество', files: [] }]);
    });

    it('SC-UKV-1049 — во время ответа со stoppable стоит «Стоп», и поле открыто для набора', (): void => {
        const fixture: ComponentFixture<RtAiPromptInputComponent> = setup({ sending: true, stoppable: true });
        let stops: number = 0;
        fixture.componentInstance.stopped.subscribe((): number => (stops += 1));

        expect(qa(fixture, 'ai-prompt-input-send')).toBeNull();
        expect(field(fixture).disabled).toBe(false);

        press(fixture, 'ai-prompt-input-stop');

        expect(stops).toBe(1);
    });

    it('SC-UKV-1049 — без stoppable ответ закрывает поле, выключенное поле закрыто тоже', (): void => {
        expect(field(setup({ sending: true })).disabled).toBe(true);
        expect(field(setup({ disabled: true })).disabled).toBe(true);
    });

    it('SC-UKV-1048 — отправка доступна при тексте или файле и закрыта, пока поле занято', (): void => {
        expect(rtPromptCanSend('', 0, false)).toBe(false);
        expect(rtPromptCanSend('  ', 0, false)).toBe(false);
        expect(rtPromptCanSend('вопрос', 0, false)).toBe(true);
        expect(rtPromptCanSend('', 1, false)).toBe(true);
        expect(rtPromptCanSend('вопрос', 0, true)).toBe(false);
    });

    it('черновик задаётся снаружи и стоит в поле', (): void => {
        const fixture: ComponentFixture<RtAiPromptInputComponent> = setup({ text: 'черновик' });

        expect(field(fixture).value).toBe('черновик');
    });
});
