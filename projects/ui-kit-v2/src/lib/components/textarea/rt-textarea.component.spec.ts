import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { createRtFixture, hostClasses, qa, textOf } from '../../../testing/rt-kit-testing';
import { IRtTextareaResize, RtTextareaComponent } from './rt-textarea.component';

@Component({
    selector: 'rt-textarea-host',
    template: '<rt-textarea [formControl]="control" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTextareaComponent, ReactiveFormsModule],
})
class TextareaHostComponent {
    public readonly control: FormControl<string | null> = new FormControl<string | null>('');
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtTextareaComponent> {
    return createRtFixture(RtTextareaComponent, inputs);
}

function field<T>(fixture: ComponentFixture<T>): HTMLTextAreaElement {
    return qa(fixture, 'textarea-control')?.nativeElement as HTMLTextAreaElement;
}

function type<T>(fixture: ComponentFixture<T>, text: string): void {
    const node: HTMLTextAreaElement = field(fixture);
    node.value = text;
    node.dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

describe('RtTextareaComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-textarea');
    });

    it('без входов — три строки высотой', (): void => {
        expect(field(setup()).rows).toBe(3);
    });

    it('число строк задаётся входом и принимает строку из атрибута разметки', (): void => {
        expect(field(setup({ rows: 8 })).rows).toBe(8);
        expect(field(setup({ rows: '5' })).rows).toBe(5);
    });

    it('подсказка уезжает на нативное поле', (): void => {
        expect(field(setup({ placeholder: 'Комментарий' })).placeholder).toBe('Комментарий');
    });

    describe('изменение размера', (): void => {
        it('по умолчанию тянется только по вертикали', (): void => {
            expect(field(setup()).style.resize).toBe('vertical');
        });

        it.each<IRtTextareaResize>(['none', 'vertical'])('режим %s уезжает в стиль поля', (resize: IRtTextareaResize): void => {
            expect(field(setup({ resize })).style.resize).toBe(resize);
        });
    });

    describe('размер', (): void => {
        it('средний размер класса не выводит', (): void => {
            expect(hostClasses(setup()).filter((cls: string): boolean => cls.startsWith('rt-textarea--size'))).toEqual([]);
        });

        it('крайние размеры выводят свой класс', (): void => {
            expect(hostClasses(setup({ size: 'sm' }))).toContain('rt-textarea--size--sm');
            expect(hostClasses(setup({ size: 'lg' }))).toContain('rt-textarea--size--lg');
        });
    });

    describe('крестик очистки', (): void => {
        it('не рисуется даже при значении — в многострочном поле он нетипичен', (): void => {
            // Вход `clearable` наследуется от общей основы полей, но разметка
            // многострочного поля его не использует.
            const fixture: ComponentFixture<RtTextareaComponent> = setup({ clearable: true });

            type(fixture, 'Длинный текст');

            expect(qa(fixture, 'textarea-clear')).toBeNull();
        });
    });

    describe('только для чтения', (): void => {
        it('собственный вход оставляет поле на месте, но запрещает правку', (): void => {
            const fixture: ComponentFixture<RtTextareaComponent> = setup({ readonly: true });

            expect(field(fixture).readOnly).toBe(true);
            expect(hostClasses(fixture)).toContain('rt-textarea--readonly');
        });

        it('режим от вмещающего поля подменяет контрол плоским текстом', (): void => {
            const fixture: ComponentFixture<RtTextareaComponent> = setup();
            type(fixture, 'Заметка');

            fixture.componentInstance.setReadonly(true);
            fixture.detectChanges();

            expect(qa(fixture, 'textarea-control')).toBeNull();
            expect(textOf(qa(fixture, 'textarea-readonly'))).toBe('Заметка');
        });

        it('пустое значение в плоском виде рисуется прочерком', (): void => {
            const fixture: ComponentFixture<RtTextareaComponent> = setup();

            fixture.componentInstance.setReadonly(true);
            fixture.detectChanges();

            expect(textOf(qa(fixture, 'textarea-readonly'))).toBe('—');
        });
    });

    describe('реактивная форма', (): void => {
        it('значение формы отражается в поле', (): void => {
            const fixture: ComponentFixture<TextareaHostComponent> = createRtFixture(TextareaHostComponent);

            fixture.componentInstance.control.setValue('Текст');
            fixture.detectChanges();

            expect(field(fixture).value).toBe('Текст');
        });

        it('ввод пишет значение в форму', (): void => {
            const fixture: ComponentFixture<TextareaHostComponent> = createRtFixture(TextareaHostComponent);

            type(fixture, 'Ответ');

            expect(fixture.componentInstance.control.value).toBe('Ответ');
        });

        it('уход фокуса помечает контрол тронутым', (): void => {
            const fixture: ComponentFixture<TextareaHostComponent> = createRtFixture(TextareaHostComponent);

            field(fixture).dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            expect(fixture.componentInstance.control.touched).toBe(true);
        });

        it('отключение формой отключает нативное поле', (): void => {
            const fixture: ComponentFixture<TextareaHostComponent> = createRtFixture(TextareaHostComponent);

            fixture.componentInstance.control.disable();
            fixture.detectChanges();

            expect(field(fixture).disabled).toBe(true);
        });
    });

    it('отключение входом тоже доходит до нативного поля', (): void => {
        expect(field(setup({ disabled: true })).disabled).toBe(true);
    });
});
