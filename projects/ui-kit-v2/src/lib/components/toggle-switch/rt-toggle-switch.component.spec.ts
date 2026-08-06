import { ChangeDetectionStrategy, Component, DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { classesOf, createRtFixture, el, qa } from '../../../testing/rt-kit-testing';
import { RtToggleSwitchComponent } from './rt-toggle-switch.component';
import { IRtToggleSwitch } from './rt-toggle-switch.model';

@Component({
    selector: 'rt-toggle-switch-host',
    template: '<rt-toggle-switch [formControl]="control" ariaLabel="Уведомления" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtToggleSwitchComponent, ReactiveFormsModule],
})
class ToggleSwitchHostComponent {
    public readonly control: FormControl<boolean | null> = new FormControl<boolean | null>(false);
}

/** Контрол создан уже отключённым — форма скажет об этом до первого рендера. */
@Component({
    selector: 'rt-toggle-switch-disabled-host',
    template: '<rt-toggle-switch [formControl]="control" ariaLabel="Уведомления" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtToggleSwitchComponent, ReactiveFormsModule],
})
class ToggleSwitchDisabledHostComponent {
    public readonly control: FormControl<boolean | null> = new FormControl<boolean | null>({ value: false, disabled: true });
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtToggleSwitchComponent> {
    return createRtFixture(RtToggleSwitchComponent, inputs);
}

function control<T>(fixture: ComponentFixture<T>): DebugElement | null {
    return qa(fixture, 'toggle-switch-control');
}

describe('RtToggleSwitchComponent', (): void => {
    it('объявлен переключателем, а не чекбоксом', (): void => {
        // Скринридер произносит «switch off/on» вместо «checkbox unchecked» —
        // для тумблера это точнее описывает происходящее.
        expect(control(setup())?.nativeElement.getAttribute('role')).toBe('switch');
    });

    describe('состояние', (): void => {
        it('без входов выключен', (): void => {
            expect(control(setup())?.attributes['aria-checked']).toBe('false');
            expect(classesOf(control(setup()))).not.toContain('rt-toggle-switch--on');
        });

        it('клик включает', (): void => {
            const fixture: ComponentFixture<RtToggleSwitchComponent> = setup();

            control(fixture)?.nativeElement.click();
            fixture.detectChanges();

            expect(control(fixture)?.attributes['aria-checked']).toBe('true');
            expect(classesOf(control(fixture))).toContain('rt-toggle-switch--on');
        });

        it('повторный клик выключает', (): void => {
            const fixture: ComponentFixture<RtToggleSwitchComponent> = setup();

            control(fixture)?.nativeElement.click();
            fixture.detectChanges();
            control(fixture)?.nativeElement.click();
            fixture.detectChanges();

            expect(control(fixture)?.attributes['aria-checked']).toBe('false');
        });
    });

    describe('размер', (): void => {
        it('без входа — плотный размер, ровняющийся по высоте с полями формы', (): void => {
            expect(classesOf(control(setup()))).toContain('rt-toggle-switch--sm');
        });

        it.each<IRtToggleSwitch.Size>(['sm', 'md', 'lg'])('размер %s выводит свой модификатор', (size: IRtToggleSwitch.Size): void => {
            expect(classesOf(control(setup({ size })))).toContain(`rt-toggle-switch--${size}`);
        });
    });

    describe('иконки в треке', (): void => {
        it('без входов иконок нет и модификатор не выводится', (): void => {
            const fixture: ComponentFixture<RtToggleSwitchComponent> = setup();

            expect(el(fixture, '.rt-toggle-switch__icon-off')).toBeNull();
            expect(classesOf(control(fixture))).not.toContain('rt-toggle-switch--with-icons');
        });

        it('одной иконки хватает, чтобы включить режим с иконками', (): void => {
            const fixture: ComponentFixture<RtToggleSwitchComponent> = setup({ iconOn: 'check' });

            expect(classesOf(control(fixture))).toContain('rt-toggle-switch--with-icons');
            expect(el(fixture, '.rt-toggle-switch__icon-on use')?.attributes['href']).toBe('#rt-icon-check');
        });

        it('обе иконки рисуются в своих половинах трека', (): void => {
            const fixture: ComponentFixture<RtToggleSwitchComponent> = setup({ iconOff: 'minus', iconOn: 'check' });

            expect(el(fixture, '.rt-toggle-switch__icon-off use')?.attributes['href']).toBe('#rt-icon-minus');
            expect(el(fixture, '.rt-toggle-switch__icon-on use')?.attributes['href']).toBe('#rt-icon-check');
        });
    });

    describe('отключение', (): void => {
        it('вход отключает кнопку и выводит модификатор', (): void => {
            const fixture: ComponentFixture<RtToggleSwitchComponent> = setup({ disabled: true });

            expect((control(fixture)?.nativeElement as HTMLButtonElement).disabled).toBe(true);
            expect(classesOf(control(fixture))).toContain('rt-toggle-switch--disabled');
        });

        it('отключённый тумблер не переключается', (): void => {
            const fixture: ComponentFixture<RtToggleSwitchComponent> = setup({ disabled: true });
            const changes: jest.Mock = jest.fn();
            fixture.componentInstance.registerOnChange(changes);

            control(fixture)?.nativeElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(changes).not.toHaveBeenCalled();
        });
    });

    describe('реактивная форма', (): void => {
        it('значение формы отражается на тумблере', (): void => {
            const fixture: ComponentFixture<ToggleSwitchHostComponent> = createRtFixture(ToggleSwitchHostComponent);

            fixture.componentInstance.control.setValue(true);
            fixture.detectChanges();

            expect(control(fixture)?.attributes['aria-checked']).toBe('true');
        });

        it('клик пишет значение и помечает контрол тронутым', (): void => {
            const fixture: ComponentFixture<ToggleSwitchHostComponent> = createRtFixture(ToggleSwitchHostComponent);

            control(fixture)?.nativeElement.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.control.value).toBe(true);
            expect(fixture.componentInstance.control.touched).toBe(true);
        });

        it('отключение формой равносильно отключению входом', (): void => {
            const fixture: ComponentFixture<ToggleSwitchHostComponent> = createRtFixture(ToggleSwitchHostComponent);

            fixture.componentInstance.control.disable();
            fixture.detectChanges();

            expect((control(fixture)?.nativeElement as HTMLButtonElement).disabled).toBe(true);
        });

        it('контрол, созданный отключённым, отключён уже на первом рендере', (): void => {
            // Форма зовёт setDisabledState при связывании — раньше, чем тумблер
            // обновит своё вью. Если вход дозатирает её слово, отключённая
            // форма приезжает к пользователю кликабельной.
            const fixture: ComponentFixture<ToggleSwitchDisabledHostComponent> = createRtFixture(ToggleSwitchDisabledHostComponent);

            expect((control(fixture)?.nativeElement as HTMLButtonElement).disabled).toBe(true);
        });

        it('включение формы возвращает тумблер в работу', (): void => {
            const fixture: ComponentFixture<ToggleSwitchDisabledHostComponent> = createRtFixture(ToggleSwitchDisabledHostComponent);

            fixture.componentInstance.control.enable();
            fixture.detectChanges();

            expect((control(fixture)?.nativeElement as HTMLButtonElement).disabled).toBe(false);
        });
    });

    describe('доступность', (): void => {
        it('подпись задаётся входом — своего текста у тумблера нет', (): void => {
            expect(control(setup({ ariaLabel: 'Тёмная тема' }))?.attributes['aria-label']).toBe('Тёмная тема');
        });

        it('идентификатор кладётся на кнопку — по нему связывается внешний label', (): void => {
            expect(control(setup({ inputId: 'dark' }))?.attributes['id']).toBe('dark');
        });
    });
});
