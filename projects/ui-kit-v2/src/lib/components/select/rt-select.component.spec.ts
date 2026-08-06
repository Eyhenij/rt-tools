import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { createRtFixture, el, hostClasses, qa, setInputs, textOf } from '../../../testing/rt-kit-testing';
import { RtSelectComponent } from './rt-select.component';
import { IRtSelect } from './rt-select.model';

const OPTIONS: ReadonlyArray<IRtSelect.Option<string>> = [
    { label: 'Москва', value: 'msk' },
    { label: 'Минск', value: 'msq' },
    { label: 'Казань', value: 'kzn', disabled: true },
];

/** Панель списка живёт в оверлее CDK — ищем её в документе. */
function options(): HTMLElement[] {
    return Array.from(document.querySelectorAll('[qa-dataid="select-option"]'));
}

function panel(): HTMLElement | null {
    return document.querySelector('.rt-select__panel');
}

@Component({
    selector: 'rt-select-host',
    template: '<rt-select [formControl]="control" [options]="opts" placeholder="Город" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtSelectComponent, ReactiveFormsModule],
})
class SelectHostComponent {
    public readonly control: FormControl<string | null> = new FormControl<string | null>(null);
    public readonly opts: ReadonlyArray<IRtSelect.Option<string>> = OPTIONS;
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtSelectComponent<string>> {
    return createRtFixture(RtSelectComponent<string>, { options: OPTIONS, ...inputs });
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

describe('RtSelectComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-select');
    });

    it('без значения показывает подсказку вместо подписи', (): void => {
        const fixture: ComponentFixture<RtSelectComponent<string>> = setup({ placeholder: 'Город' });

        expect(textOf(el(fixture, '.rt-select__label'))).toBe('Город');
    });

    describe('открытие', (): void => {
        it('клик по триггеру раскрывает список', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup();

            open(fixture);

            expect(options().length).toBe(3);
            expect(hostClasses(fixture)).toContain('rt-select--open');
        });

        it('состояние раскрытия объявлено скринридеру', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup();

            expect(trigger(fixture).getAttribute('aria-expanded')).toBe('false');

            open(fixture);

            expect(trigger(fixture).getAttribute('aria-expanded')).toBe('true');
            expect(panel()?.getAttribute('role')).toBe('listbox');
        });

        it('отключённый список не раскрывается', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup({ disabled: true });

            open(fixture);

            expect(options().length).toBe(0);
        });

        it('пустой набор опций даёт строку «вариантов нет»', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup({ options: [] });

            open(fixture);

            expect(document.querySelector('.rt-select__empty')?.textContent?.trim()).toBe('No options');
        });
    });

    describe('выбор', (): void => {
        it('клик по опции ставит значение и закрывает список', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup();
            open(fixture);

            options()[0].click();
            fixture.detectChanges();

            expect(textOf(el(fixture, '.rt-select__label'))).toBe('Москва');
            expect(panel()).toBeNull();
        });

        it('поднимает отдельное событие выбора помимо записи в форму', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup();
            const picks: string[] = [];
            fixture.componentInstance.selectionChange.subscribe((value: string | null): void => {
                picks.push(value ?? 'null');
            });
            open(fixture);

            options()[1].click();
            fixture.detectChanges();

            expect(picks).toEqual(['msq']);
        });

        it('отключённая опция не выбирается', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup();
            open(fixture);

            options()[2].click();
            fixture.detectChanges();

            expect(textOf(el(fixture, '.rt-select__label'))).toBe('');
            expect(panel()).not.toBeNull();
        });

        it('выбранная опция помечена и для стилей, и для скринридера', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup();
            open(fixture);
            options()[0].click();
            fixture.detectChanges();
            open(fixture);

            expect(options()[0].getAttribute('aria-selected')).toBe('true');
            expect(options()[0].classList.contains('rt-select__option--selected')).toBe(true);
        });
    });

    describe('клавиатура', (): void => {
        it('стрелка вниз раскрывает список и подсвечивает первую опцию', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup();

            key(fixture, 'ArrowDown');

            expect(options()[0].classList.contains('rt-select__option--active')).toBe(true);
        });

        it('стрелки перешагивают через отключённую опцию', (): void => {
            // Третья опция отключена, поэтому со второй вниз попадаем обратно
            // на первую, а не застреваем.
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup();
            key(fixture, 'ArrowDown');
            key(fixture, 'ArrowDown');

            key(fixture, 'ArrowDown');

            expect(options()[0].classList.contains('rt-select__option--active')).toBe(true);
        });

        it('Enter выбирает подсвеченную опцию', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup();
            key(fixture, 'ArrowDown');

            key(fixture, 'Enter');

            expect(textOf(el(fixture, '.rt-select__label'))).toBe('Москва');
        });

        it('Escape закрывает список без выбора', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup();
            key(fixture, 'ArrowDown');

            key(fixture, 'Escape');

            expect(panel()).toBeNull();
            expect(textOf(el(fixture, '.rt-select__label'))).toBe('');
        });

        it('подсвеченная опция называется скринридеру ссылкой на её идентификатор', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup();

            key(fixture, 'ArrowDown');

            expect(trigger(fixture).getAttribute('aria-activedescendant')).toBe(options()[0].id);
        });
    });

    describe('фильтр', (): void => {
        it('без входа поля поиска нет', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup();

            open(fixture);

            expect(document.querySelector('.rt-select__filter')).toBeNull();
        });

        it('появляется по входу и подписан переведённой подсказкой', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup({ filter: true });

            open(fixture);

            const search: HTMLInputElement | null = document.querySelector('.rt-select__filter input');
            expect(search?.placeholder).toBe('Search');
        });

        it('оставляет только совпадающие опции', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup({ filter: true });
            open(fixture);
            const search: HTMLInputElement = document.querySelector('.rt-select__filter input') as HTMLInputElement;

            search.value = 'мин';
            search.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            expect(options().length).toBe(1);
            expect(options()[0].textContent?.trim()).toBe('Минск');
        });
    });

    describe('очистка', (): void => {
        it('крестика нет, пока ничего не выбрано', (): void => {
            expect(el(setup(), '.rt-select__clear')).toBeNull();
        });

        it('крестик сбрасывает значение и сообщает об этом отдельным событием', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup({ placeholder: 'Город' });
            const picks: (string | null)[] = [];
            open(fixture);
            options()[0].click();
            fixture.detectChanges();
            fixture.componentInstance.selectionChange.subscribe((value: string | null): void => {
                picks.push(value);
            });

            el(fixture, '.rt-select__clear button')?.nativeElement.click();
            fixture.detectChanges();

            expect(textOf(el(fixture, '.rt-select__label'))).toBe('Город');
            expect(picks).toEqual([null]);
        });
    });

    describe('реактивная форма', (): void => {
        it('значение формы показывается подписью выбранной опции', (): void => {
            const fixture: ComponentFixture<SelectHostComponent> = createRtFixture(SelectHostComponent);

            fixture.componentInstance.control.setValue('msq');
            fixture.detectChanges();

            expect(textOf(el(fixture, '.rt-select__label'))).toBe('Минск');
        });

        it('выбор пишет значение в форму', (): void => {
            const fixture: ComponentFixture<SelectHostComponent> = createRtFixture(SelectHostComponent);
            open(fixture);

            options()[0].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.control.value).toBe('msk');
        });

        it('закрытие списка помечает контрол тронутым', (): void => {
            const fixture: ComponentFixture<SelectHostComponent> = createRtFixture(SelectHostComponent);
            open(fixture);

            trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            fixture.detectChanges();

            expect(fixture.componentInstance.control.touched).toBe(true);
        });

        it('отключение формой закрывает уже раскрытый список', (): void => {
            // Иначе панель осталась бы висеть над контролом, которым уже нельзя
            // пользоваться.
            const fixture: ComponentFixture<SelectHostComponent> = createRtFixture(SelectHostComponent);
            open(fixture);

            fixture.componentInstance.control.disable();
            fixture.detectChanges();

            expect(panel()).toBeNull();
        });
    });

    describe('режим только для чтения', (): void => {
        it('подменяет контрол плоским текстом выбранной подписи', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup();
            open(fixture);
            options()[0].click();
            fixture.detectChanges();

            fixture.componentInstance.setReadonly(true);
            fixture.detectChanges();

            expect(textOf(el(fixture, '.rt-select__readonly'))).toBe('Москва');
        });

        it('без значения рисуется прочерк', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup();

            fixture.componentInstance.setReadonly(true);
            fixture.detectChanges();

            expect(textOf(el(fixture, '.rt-select__readonly'))).toBe('—');
        });
    });

    it('смена набора опций перерисовывает подпись выбранного значения', (): void => {
        const fixture: ComponentFixture<RtSelectComponent<string>> = setup();
        open(fixture);
        options()[0].click();
        fixture.detectChanges();

        setInputs(fixture, { options: [{ label: 'Москва (обн.)', value: 'msk' }] });
        fixture.detectChanges();

        expect(textOf(el(fixture, '.rt-select__label'))).toBe('Москва (обн.)');
    });
});
