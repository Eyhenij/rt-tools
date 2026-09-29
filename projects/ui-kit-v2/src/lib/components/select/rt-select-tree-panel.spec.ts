import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtSelectComponent } from './rt-select.component';
import { IRtSelect } from './rt-select.model';

/**
 * Дерево опций в панели `rt-select`. Отдельно от спеки семьи: та стоит у предела длины файла.
 * Расчёт строк проверяет спека общего модуля, здесь — что панель рисует и как отвечает на клик и
 * клавиши.
 */
const TREE: ReadonlyArray<IRtSelect.Option<string>> = [
    {
        label: 'Россия',
        value: 'ru',
        children: [
            { label: 'Москва', value: 'msk' },
            { label: 'Тверь', value: 'tvr' },
        ],
    },
    { label: 'Минск', value: 'msq' },
];

function rows(): HTMLElement[] {
    return Array.from(document.querySelectorAll('[qa-dataid="select-option"]'));
}

function values(): string[] {
    return rows().map((row: HTMLElement): string => row.getAttribute('data-value') ?? '');
}

function toggles(): HTMLButtonElement[] {
    return Array.from(document.querySelectorAll('[qa-dataid="select-option-toggle"]'));
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtSelectComponent<string>> {
    return createRtFixture(RtSelectComponent<string>, { options: TREE, ...inputs });
}

function trigger<T>(fixture: ComponentFixture<T>): HTMLButtonElement {
    return qa(fixture, 'select-trigger')?.nativeElement as HTMLButtonElement;
}

function open<T>(fixture: ComponentFixture<T>): void {
    trigger(fixture).click();
    fixture.detectChanges();
}

function key<T>(fixture: ComponentFixture<T>, name: string): void {
    trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    fixture.detectChanges();
}

function activeValue(): string | null {
    return document.querySelector('.rt-select__option--active')?.getAttribute('data-value') ?? null;
}

describe('RtSelectComponent — дерево опций', (): void => {
    it('SC-UKV-408 — у плоского списка нет ни стрелок, ни места под них', (): void => {
        const fixture: ComponentFixture<RtSelectComponent<string>> = setup({ options: [{ label: 'Минск', value: 'msq' }] });

        open(fixture);

        expect(toggles().length).toBe(0);
        expect(document.querySelector('.rt-select__toggle-space')).toBeNull();
        expect(rows()[0].getAttribute('aria-level')).toBeNull();
    });

    it('SC-UKV-410 — клик по стрелке раскрывает и сворачивает ветку, ничего не выбирая', (): void => {
        const fixture: ComponentFixture<RtSelectComponent<string>> = setup();
        open(fixture);
        expect(values()).toEqual(['ru', 'msq']);

        toggles()[0].click();
        fixture.detectChanges();

        expect(values()).toEqual(['ru', 'msk', 'tvr', 'msq']);
        expect(fixture.componentInstance.value()).toBeNull();
        expect(document.querySelector('.rt-select__panel')).not.toBeNull();
        expect(rows()[1].getAttribute('aria-level')).toBe('2');

        toggles()[0].click();
        fixture.detectChanges();

        expect(values()).toEqual(['ru', 'msq']);
    });

    it('SC-UKV-411 — клик по подписи ветки выбирает саму ветку', (): void => {
        const fixture: ComponentFixture<RtSelectComponent<string>> = setup();
        open(fixture);

        rows()[0].click();
        fixture.detectChanges();

        expect(fixture.componentInstance.value()).toBe('ru');
        expect(fixture.componentInstance.displayText()).toBe('Россия');
    });

    it('выбранный лист виден сразу: ветка над ним раскрыта при открытии', (): void => {
        const fixture: ComponentFixture<RtSelectComponent<string>> = setup();
        fixture.componentInstance.writeValue('tvr');
        fixture.detectChanges();

        expect(fixture.componentInstance.displayText()).toBe('Тверь');
        open(fixture);

        expect(values()).toEqual(['ru', 'msk', 'tvr', 'msq']);
    });

    it('SC-UKV-415 — поиск показывает лист в свёрнутой ветке вместе с путём к нему', (): void => {
        const fixture: ComponentFixture<RtSelectComponent<string>> = setup({ filter: true });
        open(fixture);
        const search: HTMLInputElement = document.querySelector('.rt-select__filter input') as HTMLInputElement;

        search.value = 'твер';
        search.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        expect(values()).toEqual(['ru', 'tvr']);
    });

    it('SC-UKV-416 — боковые стрелки раскрывают ветку, спускаются к ребёнку, поднимаются и сворачивают', (): void => {
        const fixture: ComponentFixture<RtSelectComponent<string>> = setup();
        key(fixture, 'ArrowDown');
        expect(activeValue()).toBe('ru');

        key(fixture, 'ArrowRight');
        expect(values()).toEqual(['ru', 'msk', 'tvr', 'msq']);
        expect(activeValue()).toBe('ru');

        key(fixture, 'ArrowRight');
        expect(activeValue()).toBe('msk');

        key(fixture, 'ArrowLeft');
        expect(activeValue()).toBe('ru');

        key(fixture, 'ArrowLeft');
        expect(values()).toEqual(['ru', 'msq']);
    });
});
