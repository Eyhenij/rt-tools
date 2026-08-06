import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { createRtFixture, el, hostClasses, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtInputComponent } from '../input/rt-input.component';
import { RtFieldHintDirective } from './rt-field-hint.directive';
import { RtFieldComponent } from './rt-field.component';
import { IRtField } from './rt-field.model';

/** Поле читает спроецированный контрол — без него половина его работы не видна. */
@Component({
    selector: 'rt-field-host',
    template: `
        <rt-field
            [label]="label()"
            [hint]="hint()"
            [help]="help()"
            [readonly]="readonly()"
            [loading]="loading()"
            [hideRequiredMark]="hideRequiredMark()"
            [reserveHintSpace]="reserveHintSpace()"
            [errors]="errors()">
            <rt-input [formControl]="control" />
        </rt-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtFieldComponent, RtInputComponent, ReactiveFormsModule],
})
class FieldHostComponent {
    public readonly control: FormControl<string | null> = new FormControl<string | null>('', [Validators.required]);
    public readonly label: WritableSignal<string> = signal<string>('Имя');
    public readonly hint: WritableSignal<string> = signal<string>('');
    public readonly help: WritableSignal<string> = signal<string>('');
    public readonly readonly: WritableSignal<boolean> = signal<boolean>(false);
    public readonly loading: WritableSignal<boolean> = signal<boolean>(false);
    public readonly hideRequiredMark: WritableSignal<boolean> = signal<boolean>(false);
    public readonly reserveHintSpace: WritableSignal<boolean> = signal<boolean>(false);
    public readonly errors: WritableSignal<IRtField.ErrorMessages> = signal<IRtField.ErrorMessages>({});
}

/** Подсказка с разметкой приходит проекцией, а не строкой. */
@Component({
    selector: 'rt-field-projected-hint-host',
    template: `
        <rt-field label="Имя" hint="Строковая подсказка">
            <rt-input [formControl]="control" />
            <span rtFieldHint>
                Не короче
                <strong>трёх</strong>
                символов
            </span>
        </rt-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtFieldComponent, RtInputComponent, RtFieldHintDirective, ReactiveFormsModule],
})
class ProjectedHintHostComponent {
    public readonly control: FormControl<string | null> = new FormControl<string | null>('');
}

/** Контрол, у которого сразу два валидатора не проходят. */
@Component({
    selector: 'rt-field-two-errors-host',
    template: `
        <rt-field label="Код">
            <rt-input [formControl]="control" />
        </rt-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtFieldComponent, RtInputComponent, ReactiveFormsModule],
})
class TwoErrorsHostComponent {
    public readonly control: FormControl<string | null> = new FormControl<string | null>('ab', [
        Validators.minLength(3),
        Validators.pattern(/^\d+$/),
    ]);
}

function setup(): ComponentFixture<FieldHostComponent> {
    return createRtFixture(FieldHostComponent);
}

function touch(fixture: ComponentFixture<FieldHostComponent>): void {
    fixture.componentInstance.control.markAsTouched();
    fixture.componentInstance.control.updateValueAndValidity();
    fixture.detectChanges();
}

describe('RtFieldComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(createRtFixture(RtFieldComponent))).toContain('rt-field');
    });

    describe('подпись', (): void => {
        it('рисуется, когда задана', (): void => {
            expect(textOf(qa(setup(), 'field-label'))).toContain('Имя');
        });

        it('пустая подпись не создаёт пустой строки', (): void => {
            const fixture: ComponentFixture<FieldHostComponent> = setup();

            fixture.componentInstance.label.set('');
            fixture.detectChanges();

            expect(qa(fixture, 'field-label')).toBeNull();
        });

        it('связывается с контролом по идентификатору, назначенному самим полем', (): void => {
            // Идентификатор поле выдаёт само, если контрол не задал свой, —
            // иначе клик по подписи не переводил бы фокус в контрол.
            const fixture: ComponentFixture<FieldHostComponent> = setup();
            const forId: string | null | undefined = qa(fixture, 'field-label')?.attributes['for'];
            const controlId: string = (qa(fixture, 'input-control')?.nativeElement as HTMLInputElement).id;

            expect(forId).toMatch(/^rt-field-\d+$/);
            expect(controlId).toBe(forId);
        });
    });

    describe('маркер обязательности', (): void => {
        it('появляется сам, когда у контрола есть валидатор обязательности', (): void => {
            expect(qa(setup(), 'field-required')).not.toBeNull();
        });

        it('глушится входом — в форме, где обязательны все поля, маркер лишний', (): void => {
            const fixture: ComponentFixture<FieldHostComponent> = setup();

            fixture.componentInstance.hideRequiredMark.set(true);
            fixture.detectChanges();

            expect(qa(fixture, 'field-required')).toBeNull();
        });

        it('спрятан от скринридера — обязательность он читает из самого контрола', (): void => {
            expect(qa(setup(), 'field-required')?.attributes['aria-hidden']).toBe('true');
        });
    });

    describe('ошибка', (): void => {
        it('не показывается, пока контрола не коснулись', (): void => {
            expect(qa(setup(), 'field-error')).toBeNull();
        });

        it('после касания показывает переведённое умолчание по имени валидатора', (): void => {
            const fixture: ComponentFixture<FieldHostComponent> = setup();

            touch(fixture);

            expect(textOf(qa(fixture, 'field-error'))).toBe('Required field');
        });

        it('свой текст формы перебивает умолчание', (): void => {
            const fixture: ComponentFixture<FieldHostComponent> = setup();
            fixture.componentInstance.errors.set({ required: 'Без имени не пустим' });

            touch(fixture);

            expect(textOf(qa(fixture, 'field-error'))).toBe('Без имени не пустим');
        });

        it('при двух сработавших валидаторах показывается одно сообщение — первое', (): void => {
            // Сообщения показываются по одному: список ошибок под полем читается
            // хуже, чем одна причина, которую надо исправить сейчас.
            const fixture: ComponentFixture<TwoErrorsHostComponent> = createRtFixture(TwoErrorsHostComponent);

            fixture.componentInstance.control.markAsTouched();
            fixture.componentInstance.control.updateValueAndValidity();
            fixture.detectChanges();

            expect(qaAll(fixture, 'field-error').length).toBe(1);
            expect(textOf(qa(fixture, 'field-error'))).toBe('Value is too short');
        });

        it('исчезает, как только контрол стал валидным', (): void => {
            const fixture: ComponentFixture<FieldHostComponent> = setup();
            touch(fixture);

            fixture.componentInstance.control.setValue('Иван');
            fixture.detectChanges();

            expect(qa(fixture, 'field-error')).toBeNull();
        });
    });

    describe('подсказка', (): void => {
        it('строковая рисуется под контролом', (): void => {
            const fixture: ComponentFixture<FieldHostComponent> = setup();

            fixture.componentInstance.hint.set('Как в паспорте');
            fixture.detectChanges();

            expect(textOf(qa(fixture, 'field-hint'))).toBe('Как в паспорте');
        });

        it('уступает место ошибке', (): void => {
            const fixture: ComponentFixture<FieldHostComponent> = setup();
            fixture.componentInstance.hint.set('Как в паспорте');
            fixture.detectChanges();

            touch(fixture);

            expect(qa(fixture, 'field-hint')).toBeNull();
            expect(qa(fixture, 'field-error')).not.toBeNull();
        });

        it('с резервом места остаётся в потоке под ошибкой, но спрятана от скринридера', (): void => {
            // Резерв держит высоту строки постоянной, чтобы появление ошибки
            // не сдвигало форму вниз.
            const fixture: ComponentFixture<FieldHostComponent> = setup();
            fixture.componentInstance.hint.set('Как в паспорте');
            fixture.componentInstance.reserveHintSpace.set(true);
            fixture.detectChanges();

            touch(fixture);

            expect(qa(fixture, 'field-hint')).not.toBeNull();
            expect(qa(fixture, 'field-hint')?.attributes['aria-hidden']).toBe('true');
        });

        it('проецируемая подсказка с разметкой важнее строковой', (): void => {
            const fixture: ComponentFixture<ProjectedHintHostComponent> = createRtFixture(ProjectedHintHostComponent);

            expect(textOf(qa(fixture, 'field-hint'))).toContain('Не короче');
            expect(el(fixture, '[qa-dataid="field-hint"] strong')).not.toBeNull();
        });
    });

    describe('пояснение', (): void => {
        it('кнопки нет, пока пояснение не задано', (): void => {
            expect(qa(setup(), 'field-help')).toBeNull();
        });

        it('кнопка появляется и подписана переведённой подписью', (): void => {
            const fixture: ComponentFixture<FieldHostComponent> = setup();

            fixture.componentInstance.help.set('Как в документе');
            fixture.detectChanges();

            expect(qa(fixture, 'field-help')?.attributes['aria-label']).toBe('Hint');
        });

        it('текст пояснения лежит в поповере и до наведения не отрисован', (): void => {
            const fixture: ComponentFixture<FieldHostComponent> = setup();

            fixture.componentInstance.help.set('Как в документе');
            fixture.detectChanges();

            expect(qa(fixture, 'field-help-popover')).toBeNull();
        });
    });

    describe('режим только для чтения', (): void => {
        it('прокидывается в спроецированный контрол', (): void => {
            const fixture: ComponentFixture<FieldHostComponent> = setup();
            fixture.componentInstance.control.setValue('Иван');
            fixture.componentInstance.readonly.set(true);
            fixture.detectChanges();

            expect(qa(fixture, 'input-control')).toBeNull();
            expect(textOf(qa(fixture, 'input-readonly'))).toBe('Иван');
        });

        it('снятие возвращает контрол', (): void => {
            const fixture: ComponentFixture<FieldHostComponent> = setup();
            fixture.componentInstance.readonly.set(true);
            fixture.detectChanges();

            fixture.componentInstance.readonly.set(false);
            fixture.detectChanges();

            expect(qa(fixture, 'input-control')).not.toBeNull();
        });
    });

    describe('загрузка', (): void => {
        it('подменяет заглушкой только зону контрола, оставляя подпись', (): void => {
            const fixture: ComponentFixture<FieldHostComponent> = setup();

            fixture.componentInstance.loading.set(true);
            fixture.detectChanges();

            expect(qa(fixture, 'skeleton-wrapper-placeholder')).not.toBeNull();
            expect(qa(fixture, 'input-control')).toBeNull();
            expect(textOf(qa(fixture, 'field-label'))).toContain('Имя');
        });
    });
});
