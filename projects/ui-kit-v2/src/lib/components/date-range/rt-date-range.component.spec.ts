import { signal, ChangeDetectionStrategy, Component, Provider } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { RT_KIT_LOCALE } from '../../i18n';
import { BreakpointsService } from '../../platform';
import { createRtFixture, el, hostClasses, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtDateRangeComponent } from './rt-date-range.component';
import { IRtDateRange } from './rt-date-range.model';

/** Порядок даты и плоский вид зависят от локали — прибиваем её, иначе проверялась бы среда. */
const RU_LOCALE: Provider = { provide: RT_KIT_LOCALE, useValue: signal('ru') };

@Component({
    selector: 'rt-date-range-host',
    template: '<rt-date-range min="2026-01-01" max="2026-12-31" [formControl]="control" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDateRangeComponent, ReactiveFormsModule],
})
class DateRangeHostComponent {
    public readonly control: FormControl<IRtDateRange.Value | null> = new FormControl<IRtDateRange.Value | null>(null);
}

/** Подмена наблюдателя ширины: сам он в тестовой среде ничего не измеряет. */
class NarrowBreakpointsService {
    public readonly narrow: () => boolean = (): boolean => true;
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtDateRangeComponent> {
    return createRtFixture(RtDateRangeComponent, inputs, { providers: [RU_LOCALE] });
}

function setupHost(): ComponentFixture<DateRangeHostComponent> {
    return createRtFixture(DateRangeHostComponent, {}, { providers: [RU_LOCALE] });
}

function openButton<T>(fixture: ComponentFixture<T>): HTMLButtonElement {
    return el(fixture, '[qa-dataid="date-range-open"] [qa-dataid="icon-button-control"]')?.nativeElement as HTMLButtonElement;
}

function popup(): HTMLElement | null {
    return document.querySelector('[qa-dataid="date-range-popup"]');
}

function field<T>(fixture: ComponentFixture<T>): HTMLInputElement {
    return qa(fixture, 'date-range-control')?.nativeElement as HTMLInputElement;
}

function type<T>(fixture: ComponentFixture<T>, text: string): void {
    const node: HTMLInputElement = field(fixture);
    node.value = text;
    node.dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

function popupDay(iso: string): HTMLButtonElement {
    return popup()?.querySelector(`[data-iso="${iso}"]`) as HTMLButtonElement;
}

describe('RtDateRangeComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-date-range');
    });

    it('SC-UKV-469 — пустое поле подсказывает форму двух дат, заполненное показывает их в порядке языка', (): void => {
        const fixture: ComponentFixture<DateRangeHostComponent> = setupHost();
        expect(field(fixture).getAttribute('placeholder')).toBe('dd.mm.yyyy — dd.mm.yyyy');
        expect(field(fixture).getAttribute('title')).toBe('dd.mm.yyyy — dd.mm.yyyy');
        expect(field(fixture).getAttribute('size')).toBe('23');

        fixture.componentInstance.control.setValue({ start: '2026-10-12', end: '2026-10-15' });
        fixture.detectChanges();

        expect(field(fixture).value).toBe('12.10.2026 — 15.10.2026');
        expect(field(fixture).hasAttribute('title')).toBe(false);
    });

    it('SC-UKV-469 — набранные две даты становятся значением, нечитаемый текст и выход за границу — нет', (): void => {
        const fixture: ComponentFixture<DateRangeHostComponent> = setupHost();

        type(fixture, '01.08.2026 — 15.08.2026');
        expect(fixture.componentInstance.control.value).toEqual({ start: '2026-08-01', end: '2026-08-15' });
        expect(field(fixture).getAttribute('aria-invalid')).toBeNull();

        type(fixture, 'не диапазон');
        expect(fixture.componentInstance.control.value).toEqual({ start: '2026-08-01', end: '2026-08-15' });
        expect(field(fixture).getAttribute('aria-invalid')).toBe('true');

        type(fixture, '01.12.2026 — 05.01.2027');
        expect(fixture.componentInstance.control.value).toEqual({ start: '2026-08-01', end: '2026-08-15' });
        expect(field(fixture).getAttribute('aria-invalid')).toBe('true');
    });

    it('SC-UKV-468 — очистка даёт null, а не пустую пару', (): void => {
        const fixture: ComponentFixture<DateRangeHostComponent> = setupHost();
        fixture.componentInstance.control.setValue({ start: '2026-10-12', end: '2026-10-15' });
        fixture.detectChanges();

        (el(fixture, '[qa-dataid="date-range-clear"] [qa-dataid="icon-button-control"]')?.nativeElement as HTMLButtonElement).click();
        fixture.detectChanges();

        expect(fixture.componentInstance.control.value).toBeNull();
        expect(field(fixture).value).toBe('');
    });

    it('значение не по контракту поле показывает пустым', (): void => {
        const fixture: ComponentFixture<DateRangeHostComponent> = setupHost();
        fixture.componentInstance.control.setValue({ start: '2026-10-15', end: '2026-10-12' });
        fixture.detectChanges();

        expect(field(fixture).value).toBe('');
    });

    it('в режиме чтения диапазон пишется по локали, пустой — прочерком', (): void => {
        const fixture: ComponentFixture<RtDateRangeComponent> = setup();
        fixture.componentInstance.setReadonly(true);
        fixture.detectChanges();
        expect(textOf(qa(fixture, 'date-range-readonly'))).toBe('—');

        fixture.componentInstance.writeValue({ start: '2026-10-12', end: '2026-10-15' });
        fixture.detectChanges();
        expect(textOf(qa(fixture, 'date-range-readonly'))).toContain('2026');
    });

    describe('панель', (): void => {
        beforeEach((): void => {
            jest.useFakeTimers({ now: new Date(2026, 8, 30, 10, 37), doNotFake: ['queueMicrotask', 'requestAnimationFrame'] });
        });

        afterEach((): void => {
            popup()?.closest('.cdk-overlay-container')?.replaceChildren();
            jest.useRealTimers();
        });

        it('SC-UKV-470 — клик в текст панель не открывает, кнопка в конце поля — открывает, Escape закрывает', (): void => {
            const fixture: ComponentFixture<RtDateRangeComponent> = setup();

            field(fixture).click();
            fixture.detectChanges();
            expect(popup()).toBeNull();

            openButton(fixture).click();
            fixture.detectChanges();
            expect(popup()?.querySelector('rt-date-range-panel')).not.toBeNull();

            popup()
                ?.querySelector('rt-date-range-panel')
                ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            fixture.detectChanges();
            expect(popup()).toBeNull();
        });

        it('SC-UKV-468 — диапазон из панели записывается в форму парой по порядку и закрывает её', (): void => {
            const fixture: ComponentFixture<DateRangeHostComponent> = setupHost();
            openButton(fixture).click();
            fixture.detectChanges();

            popupDay('2026-10-15').click();
            fixture.detectChanges();
            popupDay('2026-10-12').click();
            fixture.detectChanges();
            (popup()?.querySelector('[qa-dataid="date-range-apply"]') as HTMLButtonElement).click();
            fixture.detectChanges();

            expect(fixture.componentInstance.control.value).toEqual({ start: '2026-10-12', end: '2026-10-15' });
            expect(field(fixture).value).toBe('12.10.2026 — 15.10.2026');
            expect(popup()).toBeNull();
        });

        it('отключённое поле панель не открывает', (): void => {
            expect(openButton(setup({ disabled: true })).disabled).toBe(true);
        });

        it('SC-UKV-477 — на узком экране панель открывается в нижней шторке с одним месяцем', (): void => {
            const fixture: ComponentFixture<RtDateRangeComponent> = createRtFixture(
                RtDateRangeComponent,
                {},
                { providers: [RU_LOCALE, { provide: BreakpointsService, useClass: NarrowBreakpointsService }] }
            );
            const sheet: HTMLElement = qa(fixture, 'date-range-sheet')?.nativeElement as HTMLElement;
            expect(sheet.querySelector('rt-date-range-panel')).toBeNull();

            openButton(fixture).click();
            fixture.detectChanges();

            expect(sheet.classList).toContain('rt-bottom-sheet--open');
            expect(sheet.querySelector('rt-date-range-panel')?.classList).toContain('rt-date-range-panel--sheet');
            expect(sheet.querySelectorAll('[qa-dataid="calendar-month"]').length).toBe(1);
            expect(popup()).toBeNull();
        });
    });
});
