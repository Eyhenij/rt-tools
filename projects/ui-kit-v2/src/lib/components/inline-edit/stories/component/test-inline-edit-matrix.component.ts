import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_CONTROL_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IRtInput } from '../../../input/rt-input.model';
import { RtInlineEditComponent } from '../../rt-inline-edit.component';
import { IRtInlineEdit } from '../../rt-inline-edit.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TInlineEditMatrixPart = 'look' | 'chip-field' | 'editing' | 'size' | 'states' | 'presets' | 'themes';

/** Случай ячейки: подпись и что передано компоненту. */
interface IInlineEditCase {
    readonly name: string;
    readonly value: string;
    readonly look?: IRtInlineEdit.Look;
    readonly size?: IRtInput.Size;
    readonly editing?: boolean;
    readonly saving?: boolean;
    readonly disabled?: boolean;
    readonly slotWidth?: string;
    readonly icon?: string;
    readonly state?: string;
    readonly truncate?: IRtInlineEdit.Truncate;
}

const NAME: string = 'Отчёт по продажам';
const LONG: string = 'Отчёт по продажам всех филиалов за второй квартал с разбивкой по менеджерам';

/**
 * Матрицы `rt-inline-edit` для витрины. Открытое поле показано входом `editing`: тот же путь, что у
 * приложения, которое открывает правку само.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-inline-edit-matrix',
    templateUrl: './test-inline-edit-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtInlineEditComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtInlineEditMatrixComponent {
    public part: TInlineEditMatrixPart = 'look';

    public readonly name: string = NAME;
    public readonly placeholder: string = 'Название отчёта';

    public readonly lookCases: readonly IInlineEditCase[] = [
        { name: 'текст', value: NAME },
        { name: 'плашка', value: NAME, look: 'chip' },
        { name: 'пусто, подсказка', value: '' },
        { name: 'плашка, пусто', value: '', look: 'chip' },
        { name: 'длинное в 200px', value: LONG, slotWidth: '200px' },
        { name: 'недоступно', value: NAME, disabled: true },
    ];

    public readonly chipFieldCases: readonly IInlineEditCase[] = [
        { name: 'значение', value: NAME },
        { name: 'в фокусе', value: NAME, state: 'focus-within' },
        { name: 'пусто, подсказка', value: '' },
        { name: 'длинное — до 24rem', value: LONG },
        { name: 'длинное, обрезка посередине', value: LONG, truncate: 'middle' },
        { name: 'свой значок', value: NAME, icon: 'tag' },
        { name: 'недоступно', value: NAME, disabled: true },
    ];

    public readonly editingCases: readonly IInlineEditCase[] = [
        { name: 'поле открыто', value: NAME, editing: true },
        { name: 'пустой черновик', value: '', editing: true },
        { name: 'сохранение', value: NAME, editing: true, saving: true },
    ];

    public readonly sizeCases: readonly IInlineEditCase[] = [
        { name: 'sm', value: NAME, size: 'sm' },
        { name: 'md', value: NAME, size: 'md' },
        { name: 'lg', value: NAME, size: 'lg' },
        { name: 'sm, открыто', value: NAME, size: 'sm', editing: true },
        { name: 'md, открыто', value: NAME, size: 'md', editing: true },
        { name: 'lg, открыто', value: NAME, size: 'lg', editing: true },
    ];

    public readonly states: readonly IStoryState[] = STORY_CONTROL_STATES;

    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;
    public readonly caseLabel: (value: IInlineEditCase) => string = (value: IInlineEditCase): string => value.name;
}
