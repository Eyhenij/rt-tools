import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, el, hostClasses, qaAll } from '../../../testing/rt-kit-testing';
import { IRtToggleButtonGroup } from './rt-toggle-button-group.model';
import { RtToggleButtonGroupComponent } from './rt-toggle-button-group.component';

const OPTIONS: ReadonlyArray<IRtToggleButtonGroup.Option> = [
    { value: 'day', label: 'День', icon: 'ico-sun' },
    { value: 'week', label: 'Неделя' },
    { value: 'month', label: 'Месяц', title: 'Помесячно' },
];

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtToggleButtonGroupComponent<string>> {
    return createRtFixture(RtToggleButtonGroupComponent<string>, { options: OPTIONS, ...inputs });
}

function buttons(fixture: ComponentFixture<RtToggleButtonGroupComponent<string>>): HTMLButtonElement[] {
    return qaAll(fixture, 'toggle-button-group-option').map(
        (node: DebugElement): HTMLButtonElement => node.nativeElement as HTMLButtonElement
    );
}

describe('RtToggleButtonGroupComponent', (): void => {
    it('рисует по кнопке на вариант и объявлен группой', (): void => {
        const fixture: ComponentFixture<RtToggleButtonGroupComponent<string>> = setup({ ariaLabel: 'Период' });

        expect(buttons(fixture).map((node: HTMLButtonElement): string => (node.textContent ?? '').trim())).toEqual([
            'День',
            'Неделя',
            'Месяц',
        ]);
        expect(el(fixture, '[role="group"]')?.attributes['aria-label']).toBe('Период');
    });

    describe('выбор', (): void => {
        it('без входа значения ни одна кнопка не нажата', (): void => {
            expect(buttons(setup()).map((node: HTMLButtonElement): string | null => node.getAttribute('aria-pressed'))).toEqual([
                'false',
                'false',
                'false',
            ]);
        });

        it('выбранный вариант помечен нажатым и модификатором', (): void => {
            const fixture: ComponentFixture<RtToggleButtonGroupComponent<string>> = setup({ value: 'week' });

            expect(buttons(fixture)[1].getAttribute('aria-pressed')).toBe('true');
            expect(classesOf(buttons(fixture)[1])).toContain('rt-toggle-button-group__button--active');
        });

        it('нажатие просит сменить значение, но само его не меняет', (): void => {
            // Значение приходит входом: группа не держит состояния, поэтому
            // подсветка сдвинется только когда потребитель вернёт новое.
            const fixture: ComponentFixture<RtToggleButtonGroupComponent<string>> = setup({ value: 'day' });
            const picked: string[] = [];
            fixture.componentInstance.valueChange.subscribe((value: string): void => {
                picked.push(value);
            });

            buttons(fixture)[2].click();
            fixture.detectChanges();

            expect(picked).toEqual(['month']);
            expect(buttons(fixture)[0].getAttribute('aria-pressed')).toBe('true');
        });

        it('повторное нажатие по выбранному тоже поднимает событие — снимать выбор группа не умеет', (): void => {
            const fixture: ComponentFixture<RtToggleButtonGroupComponent<string>> = setup({ value: 'day' });
            const picked: string[] = [];
            fixture.componentInstance.valueChange.subscribe((value: string): void => {
                picked.push(value);
            });

            buttons(fixture)[0].click();
            fixture.detectChanges();

            expect(picked).toEqual(['day']);
        });
    });

    describe('отключение', (): void => {
        it('отключает все кнопки разом', (): void => {
            expect(buttons(setup({ disabled: true })).every((node: HTMLButtonElement): boolean => node.disabled)).toBe(true);
        });

        it('отключённая группа событий не поднимает', (): void => {
            const fixture: ComponentFixture<RtToggleButtonGroupComponent<string>> = setup({ disabled: true });
            const picked: jest.Mock = jest.fn();
            fixture.componentInstance.valueChange.subscribe(picked);

            buttons(fixture)[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(picked).not.toHaveBeenCalled();
        });
    });

    describe('оформление', (): void => {
        it('крайние кнопки помечены — по ним скругляются углы группы', (): void => {
            const fixture: ComponentFixture<RtToggleButtonGroupComponent<string>> = setup();

            expect(classesOf(buttons(fixture)[0])).toContain('rt-toggle-button-group__button--first');
            expect(classesOf(buttons(fixture)[2])).toContain('rt-toggle-button-group__button--last');
        });

        it.each<[IRtToggleButtonGroup.Size, string]>([
            ['sm', '12px'],
            ['md', '16px'],
            ['lg', '16px'],
        ])('размер %s задаёт размер иконки %s', (size: IRtToggleButtonGroup.Size, expected: string): void => {
            const fixture: ComponentFixture<RtToggleButtonGroupComponent<string>> = setup({ size });

            expect((el(fixture, 'rt-icon')?.nativeElement as HTMLElement).style.width).toBe(expected);
        });

        it('растягивание на всю ширину помечает host', (): void => {
            expect(hostClasses(setup({ fullWidth: true }))).toContain('rt-toggle-button-group--full-width');
        });

        it('иконка рисуется только у вариантов, где она задана', (): void => {
            const fixture: ComponentFixture<RtToggleButtonGroupComponent<string>> = setup();

            expect(buttons(fixture)[0].querySelector('rt-icon')).not.toBeNull();
            expect(buttons(fixture)[1].querySelector('rt-icon')).toBeNull();
        });
    });

    it('значение варианта продублировано атрибутом данных', (): void => {
        expect(buttons(setup())[1].getAttribute('data-value')).toBe('week');
    });
});
