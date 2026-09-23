import { ChangeDetectionStrategy, Component, DebugElement, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { classesOf, createRtFixture, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtRadioButtonComponent } from './rt-radio-button.component';

interface ICity {
    readonly name: string;
}

const MOSCOW: ICity = { name: 'Москва' };
const SOCHI: ICity = { name: 'Сочи' };

/** Две радиокнопки на одной модели формы; значения — записи, чтобы отличить «ту же» от «равной». */
@Component({
    selector: 'rt-radio-button-form-host',
    template: `
        <rt-radio-button label="Москва" [formControl]="control" [value]="moscow" />
        <rt-radio-button label="Сочи" [formControl]="control" [value]="sochi" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtRadioButtonComponent, ReactiveFormsModule],
})
class FormHostComponent {
    public readonly moscow: ICity = MOSCOW;
    public readonly sochi: ICity = SOCHI;
    public readonly control: FormControl<ICity | null> = new FormControl<ICity | null>(null);
}

/** Контрол создан отключённым — форма скажет об этом раньше первого рендера. */
@Component({
    selector: 'rt-radio-button-disabled-host',
    template: '<rt-radio-button [formControl]="control" [value]="1" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtRadioButtonComponent, ReactiveFormsModule],
})
class DisabledHostComponent {
    public readonly control: FormControl<number | null> = new FormControl<number | null>({ value: null, disabled: true });
}

/** Без формы: выбранность ставит вход, выбор ловит выход — как строку отмечает таблица. */
@Component({
    selector: 'rt-radio-button-input-host',
    template: `
        @for (id of ids; track id) {
            <rt-radio-button [value]="id" [checked]="chosen() === id" (checkedChange)="chosen.set(id)" />
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtRadioButtonComponent],
})
class InputHostComponent {
    public readonly ids: readonly number[] = [1, 2];
    public readonly chosen: WritableSignal<number> = signal<number>(1);
}

/** Радиокнопка внутри строки, у которой свой обработчик нажатия. */
@Component({
    selector: 'rt-radio-button-row-host',
    template: '<div (click)="rowClicks = rowClicks + 1"><rt-radio-button [value]="1" /></div>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtRadioButtonComponent],
})
class RowHostComponent {
    public rowClicks: number = 0;
}

const STYLES: string = readFileSync(join(__dirname, 'rt-radio-button.component.scss'), 'utf8');

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtRadioButtonComponent> {
    return createRtFixture(RtRadioButtonComponent, { value: 1, ...inputs });
}

function control<T>(fixture: ComponentFixture<T>): DebugElement | null {
    return qa(fixture, 'radio-button-control');
}

function press<T>(fixture: ComponentFixture<T>, node: DebugElement | null): void {
    node?.nativeElement.click();
    fixture.detectChanges();
}

function key<T>(fixture: ComponentFixture<T>, name: string): KeyboardEvent {
    const event: KeyboardEvent = new KeyboardEvent('keydown', { key: name, cancelable: true, bubbles: true });
    control(fixture)?.nativeElement.dispatchEvent(event);
    fixture.detectChanges();

    return event;
}

describe('RtRadioButtonComponent', (): void => {
    describe('выбор через форму', (): void => {
        it('SC-UKV-276 — выбрана радиокнопка, чьё значение и есть модель', (): void => {
            const fixture: ComponentFixture<FormHostComponent> = createRtFixture(FormHostComponent);

            fixture.componentInstance.control.setValue(SOCHI);
            fixture.detectChanges();

            const checked: (string | null)[] = qaAll(fixture, 'radio-button-control').map(
                (node: DebugElement): string | null => node.attributes['aria-checked'] ?? null
            );
            expect(checked).toEqual(['false', 'true']);
        });

        it('SC-UKV-277 — равное, но другое значение не выбирает', (): void => {
            const fixture: ComponentFixture<FormHostComponent> = createRtFixture(FormHostComponent);

            fixture.componentInstance.control.setValue({ name: 'Сочи' });
            fixture.detectChanges();

            const checked: (string | null)[] = qaAll(fixture, 'radio-button-control').map(
                (node: DebugElement): string | null => node.attributes['aria-checked'] ?? null
            );
            expect(checked).toEqual(['false', 'false']);
        });

        it('SC-UKV-278 — нажатие выбирает радиокнопку и отдаёт её значение форме', (): void => {
            const fixture: ComponentFixture<FormHostComponent> = createRtFixture(FormHostComponent);

            press(fixture, qaAll(fixture, 'radio-button-control')[1]);

            expect(fixture.componentInstance.control.value).toBe(SOCHI);
            expect(qaAll(fixture, 'radio-button-control')[1].attributes['aria-checked']).toBe('true');
        });

        it('SC-UKV-279 — нажатие на выбранную ничего не меняет в форме', (): void => {
            const fixture: ComponentFixture<FormHostComponent> = createRtFixture(FormHostComponent);
            fixture.componentInstance.control.setValue(MOSCOW);
            fixture.detectChanges();
            const changes: ICity[] = [];
            fixture.componentInstance.control.valueChanges.subscribe((value: ICity | null): void => {
                if (value) {
                    changes.push(value);
                }
            });

            press(fixture, qaAll(fixture, 'radio-button-control')[0]);

            expect(changes).toEqual([]);
            expect(fixture.componentInstance.control.value).toBe(MOSCOW);
        });

        it('SC-UKV-280 — значение, записанное формой, не возвращается правкой', (): void => {
            const fixture: ComponentFixture<FormHostComponent> = createRtFixture(FormHostComponent);

            fixture.componentInstance.control.setValue(MOSCOW);
            fixture.detectChanges();

            expect(fixture.componentInstance.control.dirty).toBe(false);
        });

        it('SC-UKV-281 — нажатие на выбранную помечает её тронутой', (): void => {
            const fixture: ComponentFixture<FormHostComponent> = createRtFixture(FormHostComponent);
            fixture.componentInstance.control.setValue(MOSCOW);
            fixture.detectChanges();

            press(fixture, qaAll(fixture, 'radio-button-control')[0]);

            expect(fixture.componentInstance.control.touched).toBe(true);
        });
    });

    describe('отключение', (): void => {
        it('SC-UKV-282 — вход отключает радиокнопку', (): void => {
            const fixture: ComponentFixture<RtRadioButtonComponent> = setup({ disabled: true });
            const changes: boolean[] = [];
            fixture.componentInstance.checkedChange.subscribe((value: boolean): number => changes.push(value));

            press(fixture, control(fixture));

            expect(control(fixture)?.attributes['aria-checked']).toBe('false');
            expect(changes).toEqual([]);
        });

        it('SC-UKV-283 — контрол, созданный отключённым, держит радиокнопку недоступной', (): void => {
            const fixture: ComponentFixture<DisabledHostComponent> = createRtFixture(DisabledHostComponent);

            press(fixture, control(fixture));

            expect(control(fixture)?.attributes['aria-disabled']).toBe('true');
            expect(fixture.componentInstance.control.value).toBeNull();
        });

        it('SC-UKV-284 — клавиши не выбирают недоступную радиокнопку', (): void => {
            const fixture: ComponentFixture<RtRadioButtonComponent> = setup({ disabled: true });

            key(fixture, ' ');
            key(fixture, 'Enter');

            expect(control(fixture)?.attributes['aria-checked']).toBe('false');
        });
    });

    describe('нажатие', (): void => {
        it('SC-UKV-285 — каждое нажатие сообщается наружу', (): void => {
            const fixture: ComponentFixture<RtRadioButtonComponent> = setup();
            const clicks: MouseEvent[] = [];
            fixture.componentInstance.clickAction.subscribe((event: MouseEvent): number => clicks.push(event));

            press(fixture, control(fixture));
            press(fixture, control(fixture));

            expect(clicks.length).toBe(2);
        });

        it('SC-UKV-286 — нажатие не доходит до элемента вокруг радиокнопки', (): void => {
            const fixture: ComponentFixture<RowHostComponent> = createRtFixture(RowHostComponent);

            press(fixture, control(fixture));

            expect(fixture.componentInstance.rowClicks).toBe(0);
        });
    });

    describe('клавиатура', (): void => {
        it('SC-UKV-287 — пробел выбирает радиокнопку и не прокручивает страницу', (): void => {
            const fixture: ComponentFixture<RtRadioButtonComponent> = setup();

            const event: KeyboardEvent = key(fixture, ' ');

            expect(event.defaultPrevented).toBe(true);
            expect(control(fixture)?.attributes['aria-checked']).toBe('true');
        });

        it('SC-UKV-288 — Enter выбирает радиокнопку', (): void => {
            const fixture: ComponentFixture<RtRadioButtonComponent> = setup();

            key(fixture, 'Enter');

            expect(control(fixture)?.attributes['aria-checked']).toBe('true');
        });

        it('выбор клавишей наружу нажатием не сообщается', (): void => {
            const fixture: ComponentFixture<RtRadioButtonComponent> = setup();
            const clicks: MouseEvent[] = [];
            fixture.componentInstance.clickAction.subscribe((event: MouseEvent): number => clicks.push(event));

            key(fixture, ' ');

            expect(clicks).toEqual([]);
        });
    });

    describe('доступность', (): void => {
        it('SC-UKV-289 — роль, выбор и недоступность объявлены', (): void => {
            const fixture: ComponentFixture<RtRadioButtonComponent> = setup({ checked: true, disabled: true });

            expect(control(fixture)?.attributes['role']).toBe('radio');
            expect(control(fixture)?.attributes['aria-checked']).toBe('true');
            expect(control(fixture)?.attributes['aria-disabled']).toBe('true');
        });

        it('SC-UKV-290 — радиокнопка — остановка фокуса с клавиатуры, недоступная тоже', (): void => {
            expect(control(setup())?.attributes['tabindex']).toBe('0');
            expect(control(setup({ disabled: true }))?.attributes['tabindex']).toBe('0');
        });

        it('SC-UKV-291 — фокус с клавиатуры рисует кольцо кита', (): void => {
            expect(STYLES).toMatch(/&:focus-visible\s*\{[^}]*box-shadow: var\(--rt-radio-button-focus-shadow\)/);
            expect(STYLES).toContain('--rt-radio-button-focus-shadow: var(--rt-shadow-focus-ring)');
        });

        it('SC-UKV-299 — кружок без подписи получает имя из входа', (): void => {
            const fixture: ComponentFixture<RtRadioButtonComponent> = setup({ ariaLabel: 'Выбрать запись' });

            expect(control(fixture)?.attributes['aria-label']).toBe('Выбрать запись');
            expect(control(fixture)?.attributes['role']).toBe('radio');
        });
    });

    describe('вид', (): void => {
        it('SC-UKV-292 — без текстов радиокнопка — один кружок', (): void => {
            const fixture: ComponentFixture<RtRadioButtonComponent> = setup();

            expect(qa(fixture, 'radio-button-label')).toBeNull();
            expect(qa(fixture, 'radio-button-description')).toBeNull();
        });

        it('SC-UKV-293 — подпись и пояснение рисуются, когда заданы', (): void => {
            const fixture: ComponentFixture<RtRadioButtonComponent> = setup({ label: 'Москва', description: 'Столица' });

            expect(textOf(qa(fixture, 'radio-button-label'))).toBe('Москва');
            expect(textOf(qa(fixture, 'radio-button-description'))).toBe('Столица');
        });

        it('SC-UKV-294 — вид «карточка» ставит кружок справа', (): void => {
            const fixture: ComponentFixture<RtRadioButtonComponent> = setup({ card: true, label: 'Москва' });

            expect(classesOf(control(fixture))).toContain('rt-radio-button--card');
            expect(STYLES).toMatch(/&--card\s*\{[^}]*flex-direction: row-reverse/);
        });

        it('SC-UKV-295 — выбранная карточка берёт цвет выбора на рамку', (): void => {
            const fixture: ComponentFixture<RtRadioButtonComponent> = setup({ card: true, checked: true });

            expect(classesOf(control(fixture))).toEqual(expect.arrayContaining(['rt-radio-button--card', 'rt-radio-button--checked']));
            expect(STYLES).toMatch(/&--card\.rt-radio-button--checked\s*\{[^}]*border-color: var\(--rt-color-action-primary\)/);
        });

        it('SC-UKV-296 — недоступная радиокнопка приглушена целиком', (): void => {
            const fixture: ComponentFixture<RtRadioButtonComponent> = setup({ card: true, checked: true, disabled: true });

            expect(classesOf(control(fixture))).toContain('rt-radio-button--disabled');
            expect(STYLES).toMatch(/&--disabled\s*\{[^}]*opacity: var\(--rt-opacity-disabled\);[^}]*pointer-events: none/);
        });

        it('SC-UKV-297 — материальный набор перекрашивает радиокнопку', (): void => {
            // Набор переписывает назначения, а не правила: у радиокнопки нет ни одного цвета
            // своим числом — только назначения кита, и набор доходит до каждого.
            const colours: string[] = STYLES.match(/(?:color|background|border(?:-color)?):[^;]*;/g) ?? [];

            expect(colours.length).toBeGreaterThan(0);
            expect(colours.every((line: string): boolean => !/#[0-9a-f]{3,8}\b|rgb\(|hsl\(/i.test(line))).toBe(true);
        });
    });

    describe('выбор без формы', (): void => {
        it('SC-UKV-298 — выбор входом, без формы', (): void => {
            const fixture: ComponentFixture<InputHostComponent> = createRtFixture(InputHostComponent);

            press(fixture, qaAll(fixture, 'radio-button-control')[1]);

            expect(fixture.componentInstance.chosen()).toBe(2);
            const checked: (string | null)[] = qaAll(fixture, 'radio-button-control').map(
                (node: DebugElement): string | null => node.attributes['aria-checked'] ?? null
            );
            expect(checked).toEqual(['false', 'true']);
        });
    });
});
