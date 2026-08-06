import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { createRtFixture, el, fileListOf, hostClasses, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtFileInputComponent } from './rt-file-input.component';

@Component({
    selector: 'rt-file-input-host',
    template: '<rt-file-input [formControl]="control" [multiple]="true" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtFileInputComponent, ReactiveFormsModule],
})
class FileInputHostComponent {
    public readonly control: FormControl<File[] | null> = new FormControl<File[] | null>([]);
}

function file(name: string, size: number = 10): File {
    return new File([new Uint8Array(size)], name, { type: 'application/pdf' });
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtFileInputComponent> {
    return createRtFixture(RtFileInputComponent, inputs);
}

function nativeInput<T>(fixture: ComponentFixture<T>): HTMLInputElement {
    return qa(fixture, 'file-input-native')?.nativeElement as HTMLInputElement;
}

/** Подсовываем выбранные файлы так же, как это делает браузер. */
function pick<T>(fixture: ComponentFixture<T>, files: File[]): void {
    const input: HTMLInputElement = nativeInput(fixture);
    Object.defineProperty(input, 'files', {
        configurable: true,
        value: fileListOf(files),
    });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
}

describe('RtFileInputComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-file-input');
    });

    it('нативное поле спрятано — выбор открывает своя кнопка', (): void => {
        // Нативную кнопку выбора файла нельзя оформить, поэтому её прячут и
        // кликают программно из своей кнопки.
        const fixture: ComponentFixture<RtFileInputComponent> = setup();

        expect(nativeInput(fixture).hidden).toBe(true);
        expect(qa(fixture, 'file-input-trigger')).not.toBeNull();
    });

    it('кнопка открывает выбор файлов', (): void => {
        const fixture: ComponentFixture<RtFileInputComponent> = setup();
        const opens: jest.Mock = jest.fn();
        nativeInput(fixture).click = opens;

        qa(fixture, 'file-input-trigger')?.nativeElement.click();
        fixture.detectChanges();

        expect(opens).toHaveBeenCalledTimes(1);
    });

    it('отключённое поле выбор не открывает', (): void => {
        const fixture: ComponentFixture<RtFileInputComponent> = setup({ disabled: true });
        const opens: jest.Mock = jest.fn();
        nativeInput(fixture).click = opens;

        qa(fixture, 'file-input-trigger')?.nativeElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        fixture.detectChanges();

        expect(opens).not.toHaveBeenCalled();
    });

    describe('выбор файлов', (): void => {
        it('выбранный файл рисуется карточкой', (): void => {
            const fixture: ComponentFixture<RtFileInputComponent> = setup();

            pick(fixture, [file('Договор.pdf')]);

            expect(qaAll(fixture, 'file-input-file').length).toBe(1);
            expect(textOf(qa(fixture, 'file-card-name'))).toBe('Договор.pdf');
        });

        it('без входа множественности берётся только первый файл', (): void => {
            // Браузер отдаёт весь набор даже одиночному полю, если его выбрали
            // перетаскиванием: лишнее отсекается здесь.
            const fixture: ComponentFixture<RtFileInputComponent> = setup();

            pick(fixture, [file('Первый.pdf'), file('Второй.pdf')]);

            expect(qaAll(fixture, 'file-input-file').length).toBe(1);
        });

        it('со входом множественности берутся все', (): void => {
            const fixture: ComponentFixture<RtFileInputComponent> = setup({ multiple: true });

            pick(fixture, [file('Первый.pdf'), file('Второй.pdf')]);

            expect(qaAll(fixture, 'file-input-file').length).toBe(2);
        });

        it('крестик на карточке убирает файл из набора', (): void => {
            const fixture: ComponentFixture<RtFileInputComponent> = setup({ multiple: true });
            pick(fixture, [file('Первый.pdf'), file('Второй.pdf')]);

            el(fixture, '[qa-dataid="file-card-remove"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
            fixture.detectChanges();

            expect(qaAll(fixture, 'file-input-file').length).toBe(1);
            expect(textOf(qa(fixture, 'file-card-name'))).toBe('Второй.pdf');
        });
    });

    describe('ограничения выбора', (): void => {
        it('типы файлов уезжают на нативное поле', (): void => {
            expect(nativeInput(setup({ accept: '.pdf,.docx' })).getAttribute('accept')).toBe('.pdf,.docx');
        });

        it('выбор папки включается отдельным входом', (): void => {
            expect(nativeInput(setup({ directory: true })).getAttribute('webkitdirectory')).toBe('');
            expect(nativeInput(setup()).getAttribute('webkitdirectory')).toBeNull();
        });
    });

    describe('подпись кнопки', (): void => {
        it('без входа берётся из словаря кита', (): void => {
            expect(qa(setup(), 'file-input-trigger')?.attributes['aria-label']).toBe('Choose file');
        });

        it('своя подпись перебивает переведённую', (): void => {
            expect(qa(setup({ buttonLabel: 'Прикрепить смету' }), 'file-input-trigger')?.attributes['aria-label']).toBe('Прикрепить смету');
        });
    });

    describe('реактивная форма', (): void => {
        it('выбор пишет набор файлов в форму и помечает контрол тронутым', (): void => {
            const fixture: ComponentFixture<FileInputHostComponent> = createRtFixture(FileInputHostComponent);

            pick(fixture, [file('Договор.pdf')]);

            expect(fixture.componentInstance.control.value?.length).toBe(1);
            expect(fixture.componentInstance.control.touched).toBe(true);
        });

        it('удаление файла тоже уходит в форму', (): void => {
            const fixture: ComponentFixture<FileInputHostComponent> = createRtFixture(FileInputHostComponent);
            pick(fixture, [file('Договор.pdf')]);

            el(fixture, '[qa-dataid="file-card-remove"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.control.value).toEqual([]);
        });
    });

    describe('режим только для чтения', (): void => {
        it('перечисляет имена файлов через запятую', (): void => {
            const fixture: ComponentFixture<RtFileInputComponent> = setup({ multiple: true });
            pick(fixture, [file('Первый.pdf'), file('Второй.pdf')]);

            fixture.componentInstance.setReadonly(true);
            fixture.detectChanges();

            expect(textOf(qa(fixture, 'file-input-readonly'))).toBe('Первый.pdf, Второй.pdf');
        });

        it('без файлов рисуется прочерк', (): void => {
            const fixture: ComponentFixture<RtFileInputComponent> = setup();

            fixture.componentInstance.setReadonly(true);
            fixture.detectChanges();

            expect(textOf(qa(fixture, 'file-input-readonly'))).toBe('—');
        });
    });
});
