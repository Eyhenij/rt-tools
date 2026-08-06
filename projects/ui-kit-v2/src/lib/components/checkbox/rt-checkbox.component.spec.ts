import { ChangeDetectionStrategy, Component, DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { classesOf, createRtFixture, el, qa, setInputs, textOf } from '../../../testing/rt-kit-testing';
import { RtCheckboxComponent } from './rt-checkbox.component';

/** Подпись приходит проекцией, значение — через реактивную форму. */
@Component({
    selector: 'rt-checkbox-host',
    template: '<rt-checkbox [formControl]="control">Согласен</rt-checkbox>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtCheckboxComponent, ReactiveFormsModule],
})
class CheckboxHostComponent {
    public readonly control: FormControl<boolean | null> = new FormControl<boolean | null>(false);
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtCheckboxComponent> {
    return createRtFixture(RtCheckboxComponent, inputs);
}

function control<T>(fixture: ComponentFixture<T>): DebugElement | null {
    return qa(fixture, 'checkbox-control');
}

describe('RtCheckboxComponent', (): void => {
    it('это кнопка с ролью чекбокса — клавиатурное переключение достаётся даром', (): void => {
        // `<button role="checkbox">` вместо `<input type="checkbox">`: Enter и
        // Space обрабатывает браузер, отдельных keydown-обработчиков нет.
        const node: HTMLButtonElement = control(setup())?.nativeElement as HTMLButtonElement;

        expect(node.tagName).toBe('BUTTON');
        expect(node.type).toBe('button');
        expect(node.getAttribute('role')).toBe('checkbox');
    });

    describe('состояние', (): void => {
        it('без входов не отмечен', (): void => {
            expect(control(setup())?.attributes['aria-checked']).toBe('false');
        });

        it('клик отмечает и выводит модификатор с галочкой', (): void => {
            const fixture: ComponentFixture<RtCheckboxComponent> = setup();

            control(fixture)?.nativeElement.click();
            fixture.detectChanges();

            expect(control(fixture)?.attributes['aria-checked']).toBe('true');
            expect(classesOf(control(fixture))).toContain('rt-checkbox--checked');
            expect(el(fixture, 'use')?.attributes['href']).toBe('#rt-icon-check');
        });

        it('повторный клик снимает отметку', (): void => {
            const fixture: ComponentFixture<RtCheckboxComponent> = setup();

            control(fixture)?.nativeElement.click();
            fixture.detectChanges();
            control(fixture)?.nativeElement.click();
            fixture.detectChanges();

            expect(control(fixture)?.attributes['aria-checked']).toBe('false');
        });
    });

    describe('смешанное состояние', (): void => {
        it('объявляется как mixed и рисуется прочерком', (): void => {
            const fixture: ComponentFixture<RtCheckboxComponent> = setup({ indeterminate: true });

            expect(control(fixture)?.attributes['aria-checked']).toBe('mixed');
            expect(classesOf(control(fixture))).toContain('rt-checkbox--indeterminate');
            expect(el(fixture, 'use')?.attributes['href']).toBe('#rt-icon-minus');
        });

        it('клик по смешанному разрешает его в отмеченное, а не в снятое', (): void => {
            const fixture: ComponentFixture<RtCheckboxComponent> = setup({ indeterminate: true });
            const seen: boolean[] = [];
            fixture.componentInstance.registerOnChange((value: boolean): void => {
                seen.push(value);
            });

            control(fixture)?.nativeElement.click();
            fixture.detectChanges();

            expect(seen).toEqual([true]);
        });

        it('пока вход держит смешанное состояние, галочка не рисуется', (): void => {
            // Вход визуальный: снять его — дело потребителя, компонент сам его
            // не сбрасывает.
            const fixture: ComponentFixture<RtCheckboxComponent> = setup({ indeterminate: true });

            control(fixture)?.nativeElement.click();
            fixture.detectChanges();

            expect(el(fixture, 'use')?.attributes['href']).toBe('#rt-icon-minus');
        });
    });

    describe('отключение', (): void => {
        it('вход отключает кнопку и выводит модификатор', (): void => {
            const fixture: ComponentFixture<RtCheckboxComponent> = setup({ disabled: true });

            expect((control(fixture)?.nativeElement as HTMLButtonElement).disabled).toBe(true);
            expect(classesOf(control(fixture))).toContain('rt-checkbox--disabled');
        });

        it('отключённый чекбокс не меняет значения', (): void => {
            const fixture: ComponentFixture<RtCheckboxComponent> = setup({ disabled: true });
            const changes: jest.Mock = jest.fn();
            fixture.componentInstance.registerOnChange(changes);

            control(fixture)?.nativeElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(changes).not.toHaveBeenCalled();
            expect(control(fixture)?.attributes['aria-checked']).toBe('false');
        });

        it('снятие входа возвращает кнопку в работу', (): void => {
            const fixture: ComponentFixture<RtCheckboxComponent> = setup({ disabled: true });

            setInputs(fixture, { disabled: false });
            fixture.detectChanges();

            expect((control(fixture)?.nativeElement as HTMLButtonElement).disabled).toBe(false);
        });
    });

    describe('реактивная форма', (): void => {
        it('значение формы отражается на контроле', (): void => {
            const fixture: ComponentFixture<CheckboxHostComponent> = createRtFixture(CheckboxHostComponent);

            fixture.componentInstance.control.setValue(true);
            fixture.detectChanges();

            expect(control(fixture)?.attributes['aria-checked']).toBe('true');
        });

        it('клик пишет значение в форму', (): void => {
            const fixture: ComponentFixture<CheckboxHostComponent> = createRtFixture(CheckboxHostComponent);

            control(fixture)?.nativeElement.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.control.value).toBe(true);
        });

        it('клик помечает контрол тронутым', (): void => {
            const fixture: ComponentFixture<CheckboxHostComponent> = createRtFixture(CheckboxHostComponent);

            control(fixture)?.nativeElement.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.control.touched).toBe(true);
        });

        it('отключение формой равносильно отключению входом', (): void => {
            // Оба пути пишут в один и тот же внутренний сигнал — иначе
            // `[disabled]` и `FormControl.disable()` расходились бы.
            const fixture: ComponentFixture<CheckboxHostComponent> = createRtFixture(CheckboxHostComponent);

            fixture.componentInstance.control.disable();
            fixture.detectChanges();

            expect((control(fixture)?.nativeElement as HTMLButtonElement).disabled).toBe(true);
        });

        it('null в форме читается как «не отмечен»', (): void => {
            const fixture: ComponentFixture<CheckboxHostComponent> = createRtFixture(CheckboxHostComponent);

            fixture.componentInstance.control.setValue(null);
            fixture.detectChanges();

            expect(control(fixture)?.attributes['aria-checked']).toBe('false');
        });
    });

    it('подпись проецируется рядом с боксом', (): void => {
        const fixture: ComponentFixture<CheckboxHostComponent> = createRtFixture(CheckboxHostComponent);

        expect(textOf(qa(fixture, 'checkbox-label'))).toBe('Согласен');
    });

    it('подпись для скринридера задаётся отдельно — проекция ему не видна как имя контрола', (): void => {
        expect(control(setup({ ariaLabel: 'Согласие' }))?.attributes['aria-label']).toBe('Согласие');
    });

    it('идентификатор кладётся на кнопку — по нему связывается внешний label', (): void => {
        expect(control(setup({ inputId: 'agree' }))?.attributes['id']).toBe('agree');
    });
});
