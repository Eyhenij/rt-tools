import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IQuillDelta } from '../../../../util/quill-delta.model';
import { RtDeltaViewComponent } from '../../rt-delta-view.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type DeltaViewMatrixPart = 'formats' | 'blocks' | 'empty' | 'themes';

/** Случай модели: подпись для ряда и сама модель. */
interface IDeltaCase {
    readonly name: string;
    readonly delta: IQuillDelta | null;
}

/**
 * Матрицы `rt-delta-view` для витрины.
 *
 * Ось здесь одна и она не перечислимая — модель редактора. Различимых её значений столько,
 * сколько форматов компонент понимает, поэтому ряд собран по поддержанному набору: то, чего
 * в нём нет, в разметку не попадёт, и это и есть защита от чужого HTML.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-delta-view-matrix',
    template: `
        @switch (part) {
            @case ('formats') {
                <app-story-row caption="Начертание" [items]="inlineCases" [itemLabel]="caseLabel">
                    <ng-template let-deltaCase>
                        <rt-delta-view [delta]="deltaCase.delta" />
                    </ng-template>
                </app-story-row>
            }

            @case ('blocks') {
                <app-story-row caption="Блоки" [items]="blockCases" [itemLabel]="caseLabel">
                    <ng-template let-deltaCase>
                        <rt-delta-view [delta]="deltaCase.delta" />
                    </ng-template>
                </app-story-row>
            }

            @case ('empty') {
                <app-story-row caption="Нечего показывать" [items]="emptyCases" [itemLabel]="caseLabel">
                    <ng-template let-deltaCase>
                        <span class="app-delta-view-matrix__slot">
                            <rt-delta-view [delta]="deltaCase.delta" />
                        </span>
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Разметка в обеих темах">
                    <ng-template>
                        <rt-delta-view [delta]="mixed" />
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    styles: `
        .app-delta-view-matrix__slot {
            display: inline-block;
            min-width: 6rem;
            min-height: 1.5rem;
            border: 1px dashed var(--rt-color-border-subtle);
            border-radius: var(--rt-radius-sm);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtDeltaViewComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtDeltaViewMatrixComponent {
    public part: DeltaViewMatrixPart = 'formats';

    public readonly inlineCases: readonly IDeltaCase[] = [
        { name: 'обычный', delta: { ops: [{ insert: 'Обычный текст\n' }] } },
        { name: 'жирный', delta: { ops: [{ insert: 'Жирный', attributes: { bold: true } }, { insert: '\n' }] } },
        { name: 'курсив', delta: { ops: [{ insert: 'Курсив', attributes: { italic: true } }, { insert: '\n' }] } },
        { name: 'подчёркнутый', delta: { ops: [{ insert: 'Подчёркнутый', attributes: { underline: true } }, { insert: '\n' }] } },
        { name: 'зачёркнутый', delta: { ops: [{ insert: 'Зачёркнутый', attributes: { strike: true } }, { insert: '\n' }] } },
        {
            name: 'всё сразу',
            delta: { ops: [{ insert: 'Всё сразу', attributes: { bold: true, italic: true, underline: true } }, { insert: '\n' }] },
        },
    ];

    public readonly blockCases: readonly IDeltaCase[] = [
        {
            name: 'маркированный список',
            delta: {
                ops: [
                    { insert: 'Первый' },
                    { insert: '\n', attributes: { list: 'bullet' } },
                    { insert: 'Второй' },
                    { insert: '\n', attributes: { list: 'bullet' } },
                ],
            },
        },
        {
            name: 'нумерованный список',
            delta: {
                ops: [
                    { insert: 'Первый' },
                    { insert: '\n', attributes: { list: 'ordered' } },
                    { insert: 'Второй' },
                    { insert: '\n', attributes: { list: 'ordered' } },
                ],
            },
        },
        {
            name: 'цитата',
            delta: { ops: [{ insert: 'Цитата' }, { insert: '\n', attributes: { blockquote: true } }] },
        },
        {
            name: 'блок кода',
            delta: { ops: [{ insert: 'const x = 1;' }, { insert: '\n', attributes: { 'code-block': true } }] },
        },
    ];

    public readonly emptyCases: readonly IDeltaCase[] = [
        { name: 'модели нет (null)', delta: null },
        { name: 'модель без операций', delta: { ops: [] } },
    ];

    public readonly mixed: IQuillDelta = {
        ops: [
            { insert: 'Абзац с ' },
            { insert: 'жирным', attributes: { bold: true } },
            { insert: ' и ' },
            { insert: 'курсивом', attributes: { italic: true } },
            { insert: '.\n' },
            { insert: 'Пункт списка' },
            { insert: '\n', attributes: { list: 'bullet' } },
        ],
    };

    public readonly caseLabel: (value: IDeltaCase) => string = (value: IDeltaCase): string => value.name;
}
