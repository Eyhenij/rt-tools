import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { STORY_FIELD_WIDTH_WIDE } from '../../../../../showcase/story-metrics';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IQuillDelta } from '../../../../util';
import { RtFieldComponent } from '../../../field/rt-field.component';
import { IRtRichEditorToolbar, RtRichEditorComponent } from '../../rt-rich-editor.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type RichEditorMatrixPart = 'toolbar' | 'filling' | 'states' | 'themes';

/** Случай с подписью и своим значением — моделью Quill, а не HTML. */
interface IRichEditorCase {
    readonly name: string;
    readonly control: FormControl<IQuillDelta | null>;
}

/** Набор кнопок форматирования; он же сужает форматы, принимаемые из буфера. */
interface IRichEditorToolbarCase extends IRichEditorCase {
    readonly toolbar: IRtRichEditorToolbar;
}

/** Состояние, которое задаётся значением, формой или обёрткой. */
interface IRichEditorStateCase extends IRichEditorCase {
    readonly disabled: boolean;
    /** Обёрнут ли в `rt-field`: без него текст ошибки рисовать некому. */
    readonly field: boolean;
    /** Режим чтения — вход вмещающего поля, а не редактора. */
    readonly flat: boolean;
}

/** Правдоподобный набор операций Quill: абзац текста с выделением и списком. */
function delta(): FormControl<IQuillDelta | null> {
    return new FormControl<IQuillDelta | null>({
        ops: [
            { insert: 'Заявка принята ' },
            { insert: 'в работу', attributes: { bold: true } },
            { insert: '. Ожидаем документы:\n' },
            { insert: 'скан договора' },
            { insert: '\n', attributes: { list: 'bullet' } },
            { insert: 'реквизиты' },
            { insert: '\n', attributes: { list: 'bullet' } },
        ],
    });
}

function empty(): FormControl<IQuillDelta | null> {
    return new FormControl<IQuillDelta | null>(null);
}

/** Поле, уже подсвеченное ошибкой: до касания невалидное поле выглядит исправным. */
function invalid(): FormControl<IQuillDelta | null> {
    const control: FormControl<IQuillDelta | null> = new FormControl<IQuillDelta | null>(null, [Validators.required]);
    control.markAsTouched();
    return control;
}

/**
 * Матрицы состояний `rt-rich-editor` для витрины.
 *
 * Редактор создаётся динамическим импортом Quill после первой отрисовки, поэтому ячейка
 * появляется не мгновенно — и значение, пришедшее из формы раньше, применяется при создании.
 * Матрица показывает это как есть: пустая ячейка на долю секунды — часть контракта.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-rich-editor-matrix',
    template: `
        @switch (part) {
            @case ('toolbar') {
                <app-story-row caption="Набор кнопок" [items]="toolbarCases" [itemLabel]="caseLabel" [slotWidth]="editorWidth">
                    <ng-template let-toolbarCase>
                        <rt-rich-editor
                            placeholder="Опишите задачу"
                            [toolbar]="toolbarCase.toolbar"
                            [ariaLabel]="toolbarCase.name"
                            [formControl]="toolbarCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('filling') {
                <app-story-row caption="Наполненность" [items]="fillingCases" [itemLabel]="caseLabel" [slotWidth]="editorWidth">
                    <ng-template let-fillingCase>
                        <rt-rich-editor placeholder="Опишите задачу" [ariaLabel]="fillingCase.name" [formControl]="fillingCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Состояния" [items]="stateCases" [itemLabel]="caseLabel" [slotWidth]="editorWidth">
                    <ng-template let-stateCase>
                        @if (stateCase.field) {
                            <rt-field label="Описание" [readonly]="stateCase.flat">
                                <rt-rich-editor
                                    placeholder="Опишите задачу"
                                    [ariaLabel]="stateCase.name"
                                    [formControl]="stateCase.control" />
                            </rt-field>
                        } @else {
                            <rt-rich-editor
                                placeholder="Опишите задачу"
                                [disabled]="stateCase.disabled"
                                [ariaLabel]="stateCase.name"
                                [formControl]="stateCase.control" />
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Редактор в обеих темах">
                    <ng-template>
                        <rt-rich-editor placeholder="Опишите задачу" toolbar="minimal" [formControl]="themeEmpty" />
                        <rt-rich-editor placeholder="Опишите задачу" toolbar="minimal" [formControl]="themeFilled" />
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // components
        RtFieldComponent,
        RtRichEditorComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtRichEditorMatrixComponent {
    public part: RichEditorMatrixPart = 'toolbar';

    public readonly editorWidth: string = STORY_FIELD_WIDTH_WIDE;

    public readonly themeEmpty: FormControl<IQuillDelta | null> = empty();
    public readonly themeFilled: FormControl<IQuillDelta | null> = delta();

    public readonly toolbarCases: readonly IRichEditorToolbarCase[] = [
        { name: 'full', toolbar: 'full', control: delta() },
        { name: 'minimal', toolbar: 'minimal', control: delta() },
    ];

    public readonly fillingCases: readonly IRichEditorCase[] = [
        { name: 'пусто', control: empty() },
        { name: 'с текстом и списком', control: delta() },
    ];

    public readonly stateCases: readonly IRichEditorStateCase[] = [
        { name: 'ошибка — текст даёт rt-field', control: invalid(), disabled: false, field: true, flat: false },
        { name: 'отключено — набор запрещён, но не показан', control: delta(), disabled: true, field: false, flat: false },
        { name: 'readonly до редактора не доходит', control: delta(), disabled: false, field: true, flat: true },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: IRichEditorCase) => string = (value: IRichEditorCase): string => value.name;
}
