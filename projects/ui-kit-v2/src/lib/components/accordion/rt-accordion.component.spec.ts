import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { classesOf, createRtFixture, hostClasses, qaAll, setInputs, textOf } from '../../../testing/rt-kit-testing';
import { RtAccordionComponent } from './rt-accordion.component';
import { IRtAccordion } from './rt-accordion.model';

const ITEMS: readonly IRtAccordion.Item[] = [
    { title: 'Первый вопрос', text: 'Первый ответ.' },
    { title: 'Второй вопрос', text: 'Второй ответ.' },
    { title: 'Третий вопрос', text: 'Третий ответ.' },
];

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtAccordionComponent> {
    return createRtFixture(RtAccordionComponent, { items: ITEMS, ...inputs });
}

function toggles(fixture: ComponentFixture<RtAccordionComponent>): HTMLButtonElement[] {
    return qaAll(fixture, 'accordion-toggle').map((node: DebugElement): HTMLButtonElement => node.nativeElement as HTMLButtonElement);
}

function panels(fixture: ComponentFixture<RtAccordionComponent>): HTMLElement[] {
    return qaAll(fixture, 'accordion-panel').map((node: DebugElement): HTMLElement => node.nativeElement as HTMLElement);
}

/** Раскрытые пункты по `aria-expanded` кнопок — тому, что слышит экранный диктор. */
function openPositions(fixture: ComponentFixture<RtAccordionComponent>): number[] {
    return toggles(fixture)
        .map((toggle: HTMLButtonElement, index: number): number => (toggle.getAttribute('aria-expanded') === 'true' ? index : -1))
        .filter((index: number): boolean => index >= 0);
}

function press(fixture: ComponentFixture<RtAccordionComponent>, index: number): void {
    toggles(fixture)[index].click();
    fixture.detectChanges();
}

describe('RtAccordionComponent', (): void => {
    it('SC-UKV-394 — рисует заголовок и текст каждого пункта по порядку', (): void => {
        const fixture: ComponentFixture<RtAccordionComponent> = setup();

        expect(toggles(fixture).map((toggle: HTMLButtonElement): string => textOf(toggle))).toEqual([
            'Первый вопрос',
            'Второй вопрос',
            'Третий вопрос',
        ]);
        expect(panels(fixture).map((panel: HTMLElement): string => textOf(panel))).toEqual([
            'Первый ответ.',
            'Второй ответ.',
            'Третий ответ.',
        ]);
    });

    it('SC-UKV-395 — при входе раскрыт первый пункт', (): void => {
        expect(openPositions(setup())).toEqual([0]);
    });

    it('SC-UKV-396 — вход раскрывает названный им пункт', (): void => {
        expect(openPositions(setup({ openIndex: 2 }))).toEqual([2]);
    });

    it('SC-UKV-397 — вход null оставляет все пункты свёрнутыми', (): void => {
        expect(openPositions(setup({ openIndex: null }))).toEqual([]);
    });

    it('SC-UKV-398 — нажатие раскрывает свёрнутый пункт, раскрытый остаётся раскрытым', (): void => {
        const fixture: ComponentFixture<RtAccordionComponent> = setup();

        press(fixture, 2);

        expect(openPositions(fixture)).toEqual([0, 2]);
    });

    it('SC-UKV-399 — нажатие сворачивает раскрытый пункт', (): void => {
        const fixture: ComponentFixture<RtAccordionComponent> = setup();

        press(fixture, 0);

        expect(openPositions(fixture)).toEqual([]);
    });

    it('SC-UKV-400 — новый список начинает раскрытие заново с пункта из входа', (): void => {
        const fixture: ComponentFixture<RtAccordionComponent> = setup();
        press(fixture, 0);
        press(fixture, 2);

        setInputs(fixture, { items: [...ITEMS] });
        fixture.detectChanges();

        expect(openPositions(fixture)).toEqual([0]);
    });

    it('SC-UKV-401 — кнопка называет состояние пункта и свою панель, панель подписана кнопкой', (): void => {
        const fixture: ComponentFixture<RtAccordionComponent> = setup();
        const [first, second]: HTMLButtonElement[] = toggles(fixture);
        const [firstPanel, secondPanel]: HTMLElement[] = panels(fixture);

        expect(first.getAttribute('aria-expanded')).toBe('true');
        expect(second.getAttribute('aria-expanded')).toBe('false');
        expect(first.getAttribute('aria-controls')).toBe(firstPanel.id);
        expect(second.getAttribute('aria-controls')).toBe(secondPanel.id);
        expect(firstPanel.getAttribute('role')).toBe('region');
        expect(firstPanel.getAttribute('aria-labelledby')).toBe(first.id);
    });

    it('SC-UKV-402 — панель свёрнутого пункта скрыта, раскрытого — нет', (): void => {
        const [open, closed]: HTMLElement[] = panels(setup());

        expect(open.hidden).toBe(false);
        expect(closed.hidden).toBe(true);
    });

    it('SC-UKV-403 — у двух аккордеонов на странице id не повторяются', (): void => {
        const first: ComponentFixture<RtAccordionComponent> = setup();
        const second: ComponentFixture<RtAccordionComponent> = TestBed.createComponent(RtAccordionComponent);
        setInputs(second, { items: ITEMS });
        second.detectChanges();

        const ids: string[] = [first, second].flatMap((fixture: ComponentFixture<RtAccordionComponent>): string[] => [
            ...toggles(fixture).map((toggle: HTMLButtonElement): string => toggle.id),
            ...panels(fixture).map((panel: HTMLElement): string => panel.id),
        ]);

        expect(new Set(ids).size).toBe(ids.length);
        expect(toggles(second)[0].getAttribute('aria-controls')).toBe(panels(second)[0].id);
    });

    it('SC-UKV-404 — класс блока висит на элементе, раскрытый пункт несёт модификатор', (): void => {
        const fixture: ComponentFixture<RtAccordionComponent> = setup();
        const item: HTMLElement | null = toggles(fixture)[0].closest('.rt-accordion__item');

        expect(hostClasses(fixture)).toContain('rt-accordion');
        expect(classesOf(item)).toContain('rt-accordion__item--open');
    });

    it('SC-UKV-405 — пустой список не рисует ни кнопки, ни панели', (): void => {
        const fixture: ComponentFixture<RtAccordionComponent> = setup({ items: [] });

        expect(toggles(fixture).length).toBe(0);
        expect(panels(fixture).length).toBe(0);
    });
});
