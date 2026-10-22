import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { createRtFixture, hostClasses, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtSelectOptionDirective } from './rt-select-option.directive';
import { RtSelectComponent } from './rt-select.component';
import { IRtSelect } from './rt-select.model';

const OPTIONS: ReadonlyArray<IRtSelect.Option<string>> = [
    { label: 'Красный', value: 'red' },
    { label: 'Синий', value: 'blue' },
];

/** Строки списка живут в оверлее CDK — ищем их в документе. */
function rows(): HTMLElement[] {
    return Array.from(document.querySelectorAll('[qa-dataid="select-option"]'));
}

/** Хозяин со своей разметкой строки: проекция содержимого без хозяина не работает. */
@Component({
    selector: 'rt-select-option-host',
    template: `
        <rt-select [formControl]="control" [options]="opts">
            <ng-template rtSelectOption let-option let-selected="selected">
                <span class="own-option" [attr.data-value]="option.value" [attr.data-selected]="selected">{{ option.label }}</span>
            </ng-template>
        </rt-select>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtSelectComponent, RtSelectOptionDirective, ReactiveFormsModule],
})
class SelectOptionHostComponent {
    public readonly control: FormControl<string | null> = new FormControl<string | null>('blue');
    public readonly opts: ReadonlyArray<IRtSelect.Option<string>> = OPTIONS;
}

/** Хозяин с формой: событие сброса проверяется против значения, которое уже ушло в форму. */
@Component({
    selector: 'rt-select-cleared-host',
    template: '<rt-select [formControl]="control" [options]="opts" (cleared)="onCleared()" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtSelectComponent, ReactiveFormsModule],
})
class SelectClearedHostComponent {
    public readonly control: FormControl<string | null> = new FormControl<string | null>('red');
    public readonly opts: ReadonlyArray<IRtSelect.Option<string>> = OPTIONS;
    public readonly seen: Array<string | null> = [];

    public onCleared(): void {
        this.seen.push(this.control.value);
    }
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

function choose(fixture: ComponentFixture<RtSelectComponent<string>>, value: string): void {
    fixture.componentInstance.writeValue(value);
    fixture.detectChanges();
}

function cross<T>(fixture: ComponentFixture<T>): HTMLButtonElement {
    return (fixture.nativeElement as HTMLElement).querySelector('.rt-select__clear button') as HTMLButtonElement;
}

describe('RtSelectComponent — строка списка, подпись на рамке, крестик', (): void => {
    describe('шаблон строки', (): void => {
        it('SC-UKV-948 — шаблон встаёт на место подписи, галочка остаётся у выбранной строки', (): void => {
            const fixture: ComponentFixture<SelectOptionHostComponent> = createRtFixture(SelectOptionHostComponent);
            open(fixture);

            const own: HTMLElement[] = rows().map((row: HTMLElement): HTMLElement => row.querySelector('.own-option') as HTMLElement);
            expect(own.map((node: HTMLElement): string | null => node.getAttribute('data-value'))).toEqual(['red', 'blue']);
            expect(own.map((node: HTMLElement): string | null => node.getAttribute('data-selected'))).toEqual(['false', 'true']);
            expect(rows()[0].querySelector('.rt-select__option-label')).toBeNull();
            expect(rows()[1].querySelector('.rt-select__check')).not.toBeNull();
            expect(rows()[0].querySelector('.rt-select__check')).toBeNull();
        });

        it('SC-UKV-946 — шаблон строки рисует и выбранное значение в поле', (): void => {
            const fixture: ComponentFixture<SelectOptionHostComponent> = createRtFixture(SelectOptionHostComponent);
            const own: HTMLElement | null = trigger(fixture).querySelector('.own-option');

            expect(own?.getAttribute('data-value')).toBe('blue');
            expect(own?.getAttribute('data-selected')).toBe('true');

            fixture.componentInstance.control.setValue(null);
            fixture.detectChanges();
            expect(trigger(fixture).querySelector('.own-option')).toBeNull();
        });

        it('SC-UKV-973 — без шаблона строка рисует подпись опции', (): void => {
            open(setup());

            expect(rows().map((row: HTMLElement): string => textOf(row.querySelector('.rt-select__option-label') as HTMLElement))).toEqual([
                'Красный',
                'Синий',
            ]);
            expect(document.querySelector('[qa-dataid="select-option-content"]')).toBeNull();
        });
    });

    describe('подпись на рамке', (): void => {
        it('без входа подписи нет и класса тоже', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup();

            expect(qa(fixture, 'select-trigger')).not.toBeNull();
            expect(qa(fixture, 'select-floating-label')).toBeNull();
            expect(hostClasses(fixture)).not.toContain('rt-select--floating');
        });

        it('SC-UKV-976 — подпись поднимается при выбранном значении', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup({ floatingLabel: 'Цвет' });

            expect(textOf(qa(fixture, 'select-floating-label'))).toBe('Цвет');
            expect(hostClasses(fixture)).toContain('rt-select--floating');
            expect(hostClasses(fixture)).not.toContain('rt-select--filled');

            choose(fixture, 'red');
            expect(hostClasses(fixture)).toContain('rt-select--filled');
        });

        it('SC-UKV-976 — подпись поднимается при открытом списке без значения', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup({ floatingLabel: 'Цвет' });
            open(fixture);

            expect(hostClasses(fixture)).toContain('rt-select--open');
            expect(hostClasses(fixture)).not.toContain('rt-select--filled');
        });

        it('SC-UKV-977 — подпись называет указатель, когда своего имени нет', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup({ floatingLabel: 'Цвет' });
            const labelId: string = (qa(fixture, 'select-floating-label')?.nativeElement as HTMLElement).id;

            expect(labelId).not.toBe('');
            choose(fixture, 'red');
            const valueId: string = (trigger(fixture).querySelector('.rt-select__label') as HTMLElement).id;

            expect(valueId).not.toBe('');
            expect(trigger(fixture).getAttribute('aria-labelledby')).toBe(`${labelId} ${valueId}`);

            const named: ComponentFixture<RtSelectComponent<string>> = setup({ floatingLabel: 'Цвет', ariaLabel: 'Цвет темы' });
            expect(trigger(named).getAttribute('aria-label')).toBe('Цвет темы');
            expect(trigger(named).getAttribute('aria-labelledby')).toBeNull();
        });
    });

    describe('крестик', (): void => {
        it('SC-UKV-1010 — крестик вне порядка Tab, пока поле не попросит', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup();
            choose(fixture, 'red');
            expect(cross(fixture).getAttribute('tabindex')).toBe('-1');

            const tabbable: ComponentFixture<RtSelectComponent<string>> = setup({ clearTabbable: true });
            choose(tabbable, 'red');
            expect(cross(tabbable).getAttribute('tabindex')).toBe('0');
        });

        it('SC-UKV-1010 — крестик в порядке Tab стоит рядом с кнопкой, а не в ней', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup({ clearTabbable: true });
            choose(fixture, 'red');

            expect(trigger(fixture).contains(cross(fixture))).toBe(false);
            expect(trigger(fixture).querySelector('button, [tabindex="0"]')).toBeNull();
            expect(trigger(fixture).querySelector('.rt-select__clear-slot')).not.toBeNull();
        });

        it('SC-UKV-1011 — нажатие на крестик в порядке Tab очищает поле', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup({ clearTabbable: true });
            choose(fixture, 'red');

            cross(fixture).click();
            fixture.detectChanges();

            expect(fixture.componentInstance.displayText()).toBe('');
            expect(cross(fixture)).toBeNull();
        });

        it('SC-UKV-1010 — Enter на крестике не открывает список', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup({ clearTabbable: true });
            choose(fixture, 'red');

            cross(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            fixture.detectChanges();

            expect(hostClasses(fixture)).toContain('rt-select');
            expect(hostClasses(fixture)).not.toContain('rt-select--open');
        });

        it('SC-UKV-912 — Escape закрывает только панель и не доходит до слоя под ней', (): void => {
            const fixture: ComponentFixture<RtSelectComponent<string>> = setup();
            const reached: string[] = [];
            const listen: (event: KeyboardEvent) => void = (event: KeyboardEvent): void => {
                reached.push(event.key);
            };
            document.addEventListener('keydown', listen);
            open(fixture);
            expect(hostClasses(fixture)).toContain('rt-select--open');

            trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
            fixture.detectChanges();
            document.removeEventListener('keydown', listen);

            expect(hostClasses(fixture)).not.toContain('rt-select--open');
            expect(reached).toEqual([]);
        });

        it('SC-UKV-1011 — сброс сообщается хосту после того, как пустое значение ушло в форму', (): void => {
            const fixture: ComponentFixture<SelectClearedHostComponent> = createRtFixture(SelectClearedHostComponent);

            cross(fixture).click();
            fixture.detectChanges();

            expect(fixture.componentInstance.seen).toEqual([null]);
        });
    });
});
