import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { QuillMock, quillInstances, resetQuillInstances } from '../../../testing/quill-mock';
import { createRtFixture, hostClasses, qa, textOf } from '../../../testing/rt-kit-testing';
import { IQuillDelta } from '../../util';
import { RtFieldComponent } from '../field/rt-field.component';
import { RtRichEditorComponent } from './rt-rich-editor.component';

// Сам Quill в jsdom не поднимается — подменяем модуль целиком. `__esModule`
// обязателен: без него интероп кладёт весь макет в `default`.
jest.mock('quill', (): { __esModule: true; default: typeof QuillMock } => ({ __esModule: true, default: QuillMock }));

@Component({
    selector: 'rt-rich-editor-host',
    template: '<rt-rich-editor [formControl]="control" placeholder="Опишите задачу" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtRichEditorComponent, ReactiveFormsModule],
})
class RichEditorHostComponent {
    public readonly control: FormControl<IQuillDelta | null> = new FormControl<IQuillDelta | null>(null);
}

/** Редактор внутри обёртки поля — так его ставят в форме, и так видно, что обёртка его нашла. */
@Component({
    selector: 'rt-rich-editor-field-host',
    template: `
        <rt-field label="Описание">
            <rt-rich-editor [formControl]="control" />
        </rt-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtFieldComponent, RtRichEditorComponent, ReactiveFormsModule],
})
class RichEditorFieldHostComponent {
    public readonly control: FormControl<IQuillDelta | null> = new FormControl<IQuillDelta | null>(null, [Validators.required]);
}

async function setup(inputs: Readonly<Record<string, unknown>> = {}): Promise<ComponentFixture<RtRichEditorComponent>> {
    const fixture: ComponentFixture<RtRichEditorComponent> = createRtFixture(RtRichEditorComponent, inputs);
    // Редактор создаётся асинхронно (динамический импорт) — ждём его появления.
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
}

async function setupHost(): Promise<ComponentFixture<RichEditorHostComponent>> {
    const fixture: ComponentFixture<RichEditorHostComponent> = createRtFixture(RichEditorHostComponent);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
}

function editor(): QuillMock {
    return quillInstances[quillInstances.length - 1];
}

describe('RtRichEditorComponent', (): void => {
    beforeEach((): void => {
        resetQuillInstances();
    });

    it('несёт свой BEM-блок и поверхность под редактор', async (): Promise<void> => {
        const fixture: ComponentFixture<RtRichEditorComponent> = await setup();

        expect(hostClasses(fixture)).toContain('rt-rich-editor');
        expect(qa(fixture, 'rich-editor-surface')).not.toBeNull();
    });

    it('редактор создаётся только после отрисовки — до неё его нет', (): void => {
        // Он тяжёлый и грузится динамическим импортом, чтобы не тянуть его
        // в основную сборку приложения.
        createRtFixture(RtRichEditorComponent);

        expect(quillInstances.length).toBe(0);
    });

    it('редактор поднимается после отрисовки', async (): Promise<void> => {
        await setup();

        expect(quillInstances.length).toBe(1);
    });

    describe('значение', (): void => {
        it('правка в редакторе пишет содержимое в форму', async (): Promise<void> => {
            const fixture: ComponentFixture<RichEditorHostComponent> = await setupHost();

            editor().typeText('Привет');
            fixture.detectChanges();

            expect(fixture.componentInstance.control.value).toEqual({ ops: [{ insert: 'Привет' }] });
        });

        it('пустой текст пишет null, а не пустой набор операций', async (): Promise<void> => {
            // Так «пусто» отличимо от «есть форматирование без текста»:
            // на этом стоит проверка обязательности поля.
            const fixture: ComponentFixture<RichEditorHostComponent> = await setupHost();
            editor().typeText('Привет');
            fixture.detectChanges();

            editor().typeText('');
            fixture.detectChanges();

            expect(fixture.componentInstance.control.value).toBeNull();
        });

        it('значение формы уходит в редактор', async (): Promise<void> => {
            const fixture: ComponentFixture<RichEditorHostComponent> = await setupHost();

            fixture.componentInstance.control.setValue({ ops: [{ insert: 'Из формы' }] } as IQuillDelta);
            fixture.detectChanges();

            expect(editor().getText()).toBe('Из формы');
        });

        it('значение, пришедшее до готовности редактора, не теряется', async (): Promise<void> => {
            // Форма может подставить значение раньше, чем догрузится редактор:
            // тогда оно откладывается и применяется при его создании.
            const fixture: ComponentFixture<RichEditorHostComponent> = createRtFixture(
                RichEditorHostComponent,
                {},
                {
                    skipInitialDetect: true,
                }
            );
            fixture.componentInstance.control.setValue({ ops: [{ insert: 'Раннее' }] } as IQuillDelta);
            fixture.detectChanges();

            // Ждём именно очередь задач: редактор приходит динамическим
            // импортом, и `whenStable` о нём ничего не знает.
            await new Promise<void>((resolve: () => void): void => {
                setTimeout(resolve, 0);
            });
            fixture.detectChanges();

            expect(editor().getText()).toBe('Раннее');
        });
    });

    describe('отключение', (): void => {
        it('отключение формой гасит редактор', async (): Promise<void> => {
            const fixture: ComponentFixture<RichEditorHostComponent> = await setupHost();

            fixture.componentInstance.control.disable();
            fixture.detectChanges();

            expect(editor().enabled).toBe(false);
        });

        it('включение формой возвращает его в работу', async (): Promise<void> => {
            const fixture: ComponentFixture<RichEditorHostComponent> = await setupHost();
            fixture.componentInstance.control.disable();
            fixture.detectChanges();

            fixture.componentInstance.control.enable();
            fixture.detectChanges();

            expect(editor().enabled).toBe(true);
        });
    });

    describe('Enter', (): void => {
        it('без Shift поднимает событие вместо переноса строки', async (): Promise<void> => {
            const fixture: ComponentFixture<RtRichEditorComponent> = await setup();
            const enters: jest.Mock = jest.fn();
            fixture.componentInstance.enterPressed.subscribe(enters);

            const passedThrough: boolean | undefined = editor().press('enterSubmit');

            expect(enters).toHaveBeenCalledTimes(1);
            // `false` гасит перенос: иначе к отправке добавилась бы пустая строка.
            expect(passedThrough).toBe(false);
        });

        it('c Shift переносом и остаётся — привязка на него не заявлена', async (): Promise<void> => {
            // Привязка объявлена с `shiftKey: false`, поэтому Shift+Enter до неё
            // не доходит и уходит в поведение редактора по умолчанию.
            await setup();

            expect(editor().bindings['enterSubmit']?.shiftKey).toBe(false);
        });
    });

    it('вмещающее поле находит редактор и рисует по нему звёздочку и текст ошибки', async (): Promise<void> => {
        // Поле ищет контрол через `contentChild(RtFormControlBase)` — query по абстрактному
        // классу. Без алиаса базового токена редактор в этот запрос не попадает, и обёртка
        // молча теряет и обязательность, и ошибку: подпись есть, а сообщения под ней нет.
        const fixture: ComponentFixture<RichEditorFieldHostComponent> = createRtFixture(RichEditorFieldHostComponent);
        await fixture.whenStable();
        fixture.componentInstance.control.markAsTouched();
        fixture.detectChanges();

        expect(qa(fixture, 'field-required')).not.toBeNull();
        expect(textOf(qa(fixture, 'field-error'))).toBe('Required field');
    });

    it('плоский текст значения читается для режима только для чтения', async (): Promise<void> => {
        const fixture: ComponentFixture<RtRichEditorComponent> = await setup();

        fixture.componentInstance.writeValue({ ops: [{ insert: 'Простой текст' }] } as IQuillDelta);
        fixture.detectChanges();

        expect(fixture.componentInstance.displayText()).toBe('Простой текст');
    });
});
