import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { createRtFixture, el, hostClasses, qa, textOf } from '../../../testing/rt-kit-testing';
import { IRtSelect } from '../select/rt-select.model';
import { RtMultiselectComponent } from './rt-multiselect.component';

const OPTIONS: ReadonlyArray<IRtSelect.Option<string>> = [
    { label: 'Москва', value: 'msk' },
    { label: 'Минск', value: 'msq' },
    { label: 'Казань', value: 'kzn' },
    { label: 'Сочи', value: 'aer', disabled: true },
];

/** Панель списка живёт в оверлее CDK — ищем её в документе. */
function options(): HTMLElement[] {
    return Array.from(document.querySelectorAll('[qa-dataid="multiselect-option"]'));
}

function panel(): HTMLElement | null {
    return document.querySelector('[qa-dataid="multiselect-panel"]');
}

@Component({
    selector: 'rt-multiselect-host',
    template: '<rt-multiselect [formControl]="control" [options]="opts" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtMultiselectComponent, ReactiveFormsModule],
})
class MultiselectHostComponent {
    public readonly control: FormControl<ReadonlyArray<string> | null> = new FormControl<ReadonlyArray<string> | null>([]);
    public readonly opts: ReadonlyArray<IRtSelect.Option<string>> = OPTIONS;
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtMultiselectComponent<string>> {
    return createRtFixture(RtMultiselectComponent<string>, { options: OPTIONS, ...inputs });
}

function trigger<T>(fixture: ComponentFixture<T>): HTMLButtonElement {
    return qa(fixture, 'multiselect-trigger')?.nativeElement as HTMLButtonElement;
}

function open<T>(fixture: ComponentFixture<T>): void {
    trigger(fixture).click();
    fixture.detectChanges();
}

function chipLabels<T>(fixture: ComponentFixture<T>): string[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('[qa-dataid="tag-text"]')).map((node: Element): string =>
        (node.textContent ?? '').trim()
    );
}

describe('RtMultiselectComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-multiselect');
    });

    it('без выбора показывает переведённую подсказку', (): void => {
        expect(textOf(qa(setup(), 'multiselect-placeholder'))).toBe('Select values');
    });

    it('своя подсказка перебивает переведённую', (): void => {
        expect(textOf(qa(setup({ placeholder: 'Города' }), 'multiselect-placeholder'))).toBe('Города');
    });

    describe('выбор', (): void => {
        it('клик по опции добавляет её к выбранному, не закрывая список', (): void => {
            // Множественный выбор закрываться после каждого клика не должен —
            // иначе второй вариант пришлось бы выбирать заново открывая панель.
            const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup();
            open(fixture);

            options()[0].click();
            fixture.detectChanges();

            expect(chipLabels(fixture)).toEqual(['Москва']);
            expect(panel()).not.toBeNull();
        });

        it('повторный клик снимает выбор', (): void => {
            const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup();
            open(fixture);
            options()[0].click();
            fixture.detectChanges();

            options()[0].click();
            fixture.detectChanges();

            expect(chipLabels(fixture)).toEqual([]);
        });

        it('отключённая опция не выбирается', (): void => {
            const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup();
            open(fixture);

            options()[3].click();
            fixture.detectChanges();

            expect(chipLabels(fixture)).toEqual([]);
        });

        it('выбранная опция помечена и галочкой, и для скринридера', (): void => {
            const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup();
            open(fixture);

            options()[1].click();
            fixture.detectChanges();

            expect(options()[1].getAttribute('aria-selected')).toBe('true');
            expect((options()[1].querySelector('[qa-dataid="multiselect-option-checkbox"]') as HTMLInputElement).checked).toBe(true);
        });
    });

    describe('фишки', (): void => {
        it('показываются не все — сверх лимита рисуется счётчик', (): void => {
            const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup({ maxChips: 2 });
            open(fixture);
            options()[0].click();
            fixture.detectChanges();
            options()[1].click();
            fixture.detectChanges();
            options()[2].click();
            fixture.detectChanges();

            expect(chipLabels(fixture)).toEqual(['Москва', 'Минск']);
            expect(textOf(qa(fixture, 'multiselect-chip-more'))).toBe('+1');
        });

        it('крестик на фишке снимает её выбор', (): void => {
            const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup();
            open(fixture);
            options()[0].click();
            fixture.detectChanges();

            el(fixture, '[qa-dataid="tag-close"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
            fixture.detectChanges();

            expect(chipLabels(fixture)).toEqual([]);
        });

        it('клик по крестику не раскрывает список — крестик лежит внутри триггера', (): void => {
            const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup();
            open(fixture);
            options()[0].click();
            fixture.detectChanges();
            trigger(fixture).click();
            fixture.detectChanges();

            el(fixture, '[qa-dataid="tag-close"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
            fixture.detectChanges();

            expect(panel()).toBeNull();
        });
    });

    describe('клавиатура', (): void => {
        it('стрелка вниз раскрывает список и подсвечивает первую опцию', (): void => {
            const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup();

            trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            fixture.detectChanges();

            expect(options()[0].classList.contains('rt-multiselect__option--active')).toBe(true);
        });

        it('Enter переключает подсвеченную опцию, оставляя список открытым', (): void => {
            const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup();
            trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            fixture.detectChanges();

            trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            fixture.detectChanges();

            expect(chipLabels(fixture)).toEqual(['Москва']);
            expect(panel()).not.toBeNull();
        });

        it('Escape закрывает список', (): void => {
            const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup();
            open(fixture);

            trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            fixture.detectChanges();

            expect(panel()).toBeNull();
        });
    });

    describe('реактивная форма', (): void => {
        it('значение формы рисуется фишками', (): void => {
            const fixture: ComponentFixture<MultiselectHostComponent> = createRtFixture(MultiselectHostComponent);

            fixture.componentInstance.control.setValue(['msq', 'kzn']);
            fixture.detectChanges();

            expect(chipLabels(fixture)).toEqual(['Минск', 'Казань']);
        });

        it('выбор пишет в форму новый массив, а не правит прежний', (): void => {
            const fixture: ComponentFixture<MultiselectHostComponent> = createRtFixture(MultiselectHostComponent);
            const before: ReadonlyArray<string> | null = fixture.componentInstance.control.value;
            open(fixture);

            options()[0].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.control.value).toEqual(['msk']);
            expect(fixture.componentInstance.control.value).not.toBe(before);
        });

        it('null в форме читается как пустой выбор', (): void => {
            const fixture: ComponentFixture<MultiselectHostComponent> = createRtFixture(MultiselectHostComponent);

            fixture.componentInstance.control.setValue(null);
            fixture.detectChanges();

            expect(qa(fixture, 'multiselect-placeholder')).not.toBeNull();
        });

        it('закрытие списка помечает контрол тронутым', (): void => {
            const fixture: ComponentFixture<MultiselectHostComponent> = createRtFixture(MultiselectHostComponent);
            open(fixture);

            trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            fixture.detectChanges();

            expect(fixture.componentInstance.control.touched).toBe(true);
        });

        it('отключение формой закрывает уже раскрытый список', (): void => {
            const fixture: ComponentFixture<MultiselectHostComponent> = createRtFixture(MultiselectHostComponent);
            open(fixture);

            fixture.componentInstance.control.disable();
            fixture.detectChanges();

            expect(panel()).toBeNull();
        });
    });

    describe('режим только для чтения', (): void => {
        it('перечисляет выбранное через запятую', (): void => {
            const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup();
            open(fixture);
            options()[0].click();
            fixture.detectChanges();
            options()[1].click();
            fixture.detectChanges();

            fixture.componentInstance.setReadonly(true);
            fixture.detectChanges();

            expect(textOf(qa(fixture, 'multiselect-readonly'))).toBe('Москва, Минск');
        });

        it('без выбора рисуется прочерк', (): void => {
            const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup();

            fixture.componentInstance.setReadonly(true);
            fixture.detectChanges();

            expect(textOf(qa(fixture, 'multiselect-readonly'))).toBe('—');
        });
    });

    it('пустой набор опций даёт строку «вариантов нет»', (): void => {
        const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup({ options: [] });

        open(fixture);

        expect(document.querySelector('[qa-dataid="multiselect-empty"]')?.textContent?.trim()).toBe('No options');
    });
});
