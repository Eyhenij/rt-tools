import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, hostClasses, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtPromptSuggestionComponent } from './rt-prompt-suggestion.component';

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtPromptSuggestionComponent> {
    return createRtFixture(RtPromptSuggestionComponent, { label: 'Give me a performance overview', ...inputs });
}

describe('RtPromptSuggestionComponent', (): void => {
    it('несёт свой BEM-блок на host-е', (): void => {
        expect(hostClasses(setup())).toContain('rt-prompt-suggestion');
    });

    it('SC-UKV-747 — карточка — кнопка с подписью и стрелкой справа', (): void => {
        const fixture: ComponentFixture<RtPromptSuggestionComponent> = setup();
        const button: HTMLButtonElement = qa(fixture, 'prompt-suggestion')?.nativeElement;

        expect(button.tagName).toBe('BUTTON');
        expect(button.type).toBe('button');
        expect(textOf(qa(fixture, 'prompt-suggestion-label'))).toBe('Give me a performance overview');
        expect(button.lastElementChild?.tagName.toLowerCase()).toBe('rt-icon');
    });

    it('SC-UKV-748 — нажатие отдаёт наружу текст вопроса', (): void => {
        const fixture: ComponentFixture<RtPromptSuggestionComponent> = setup();
        const seen: string[] = [];
        fixture.componentInstance.picked.subscribe((value: string): number => seen.push(value));

        qa(fixture, 'prompt-suggestion')?.nativeElement.click();

        expect(seen).toEqual(['Give me a performance overview']);
    });

    it('SC-UKV-749 — выключенная карточка не нажимается', (): void => {
        const fixture: ComponentFixture<RtPromptSuggestionComponent> = setup({ disabled: true });
        const seen: string[] = [];
        fixture.componentInstance.picked.subscribe((value: string): number => seen.push(value));

        qa(fixture, 'prompt-suggestion')?.nativeElement.click();

        expect(qa(fixture, 'prompt-suggestion')?.nativeElement.disabled).toBe(true);
        expect(seen).toEqual([]);
    });

    it('принимает пустую строку как истину — так пишется голый атрибут разметки', (): void => {
        expect(qa(setup({ disabled: '' }), 'prompt-suggestion')?.nativeElement.disabled).toBe(true);
    });
});
