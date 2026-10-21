import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtRadioButtonComponent } from './rt-radio-button.component';
import { RtRadioGroupComponent } from './rt-radio-group.component';

/** Группа из трёх радиокнопок на одном контроле; средняя может быть отключена. */
@Component({
    selector: 'rt-radio-group-host',
    template: `
        <rt-radio-group ariaLabel="Тип номера">
            <rt-radio-button value="single" label="Одноместный" [formControl]="control" />
            <rt-radio-button value="double" label="Двухместный" [disabled]="middleOff" [formControl]="control" />
            <rt-radio-button value="suite" label="Люкс" [formControl]="control" />
        </rt-radio-group>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtRadioGroupComponent, RtRadioButtonComponent, ReactiveFormsModule],
})
class RadioGroupHostComponent {
    public readonly control: FormControl<string | null> = new FormControl<string | null>(null);
    public middleOff: boolean = false;
}

/** Обёртка потребителя: радиокнопка живёт в её шаблоне, а не в содержимом группы. */
@Component({
    selector: 'rt-radio-plan-option',
    template: `
        <rt-radio-button value="pro" label="Про" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtRadioButtonComponent],
})
class PlanOptionComponent {}

@Component({
    selector: 'rt-radio-wrapped-host',
    template: `
        <rt-radio-group ariaLabel="Тариф">
            <rt-radio-plan-option />
            <rt-radio-button value="free" label="Бесплатный" />
        </rt-radio-group>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtRadioGroupComponent, RtRadioButtonComponent, PlanOptionComponent],
})
class WrappedRadioHostComponent {}

function radios<T>(fixture: ComponentFixture<T>): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[role="radio"]'));
}

function group<T>(fixture: ComponentFixture<T>): HTMLElement {
    return fixture.nativeElement.querySelector('rt-radio-group') as HTMLElement;
}

function arrow<T>(fixture: ComponentFixture<T>, from: HTMLElement, key: string): void {
    from.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    fixture.detectChanges();
}

function setup(middleOff: boolean = false): ComponentFixture<RadioGroupHostComponent> {
    const fixture: ComponentFixture<RadioGroupHostComponent> = createRtFixture(RadioGroupHostComponent, {}, { skipInitialDetect: true });
    fixture.componentInstance.middleOff = middleOff;
    fixture.detectChanges();
    return fixture;
}

describe('RtRadioGroupComponent', (): void => {
    it('SC-UKV-911 — радиокнопка из шаблона обёртки входит в группу: шаг Tab и стрелки доходят до неё', (): void => {
        const fixture: ComponentFixture<WrappedRadioHostComponent> = createRtFixture(WrappedRadioHostComponent);
        fixture.detectChanges();

        expect(radios(fixture).map((radio: HTMLElement): string | null => radio.getAttribute('tabindex'))).toEqual(['0', '-1']);

        arrow(fixture, radios(fixture)[0], 'ArrowDown');
        expect(document.activeElement).toBe(radios(fixture)[1]);
    });

    it('SC-UKV-909 — группа объявляет себя radiogroup и носит имя', (): void => {
        const host: HTMLElement = group(setup());

        expect(host.getAttribute('role')).toBe('radiogroup');
        expect(host.getAttribute('aria-label')).toBe('Тип номера');
    });

    it('SC-UKV-911 — без выбора в порядке обхода стоит только первая радиокнопка', (): void => {
        expect(radios(setup()).map((radio: HTMLElement): string | null => radio.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
    });

    it('SC-UKV-911 — с выбором в порядке обхода стоит выбранная', (): void => {
        const fixture: ComponentFixture<RadioGroupHostComponent> = setup();
        fixture.componentInstance.control.setValue('suite');
        fixture.detectChanges();

        expect(radios(fixture).map((radio: HTMLElement): string | null => radio.getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);
    });

    it('SC-UKV-910 — стрелка вниз выбирает следующую и переводит на неё фокус', (): void => {
        const fixture: ComponentFixture<RadioGroupHostComponent> = setup();
        arrow(fixture, radios(fixture)[0], 'ArrowDown');

        expect(fixture.componentInstance.control.value).toBe('double');
        expect(document.activeElement).toBe(radios(fixture)[1]);
    });

    it('SC-UKV-910 — стрелка вверх с первой уходит по кругу на последнюю', (): void => {
        const fixture: ComponentFixture<RadioGroupHostComponent> = setup();
        arrow(fixture, radios(fixture)[0], 'ArrowUp');

        expect(fixture.componentInstance.control.value).toBe('suite');
    });

    it('SC-UKV-910 — отключённую стрелка пропускает', (): void => {
        const fixture: ComponentFixture<RadioGroupHostComponent> = setup(true);
        arrow(fixture, radios(fixture)[0], 'ArrowRight');

        expect(fixture.componentInstance.control.value).toBe('suite');
    });

    it('другие клавиши группа не трогает', (): void => {
        const fixture: ComponentFixture<RadioGroupHostComponent> = setup();
        arrow(fixture, radios(fixture)[0], 'Tab');

        expect(radios(fixture).length).toBe(3);
        expect(fixture.componentInstance.control.value).toBeNull();
    });
});
