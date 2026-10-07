import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtButtonDirective } from '../../../button/rt-button.directive';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IRtTree } from '../../../tree/rt-tree.model';
import { RtTreeSelectorComponent } from '../../rt-tree-selector.component';
import { RtTreeSelectorControlsDirective } from '../../rt-tree-selector.directives';
import { TREE_SELECTOR_STORY_NODES } from './tree-selector-story-nodes';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TTreeSelectorMatrixPart = 'form' | 'search' | 'controls' | 'mode' | 'presets' | 'themes';

/** Одна ячейка ряда: подпись и то, чем селектор в ней отличается от соседей. */
interface ITreeSelectorCase {
    readonly name: string;
    readonly mode: IRtTree.Mode;
    readonly value: ReadonlyArray<string>;
    readonly confirm: boolean;
    readonly emptyAllowed: boolean;
    readonly expandControls: boolean;
    readonly clearable: boolean;
    readonly revertable: boolean;
    readonly multiToggle: boolean;
    readonly searchTerm: string;
    readonly label: string;
    readonly disabled: boolean;
    readonly selectAll: boolean;
    /** Рисовать ли свой контрол приложения в строке. */
    readonly own: boolean;
}

/** Ячейка, где история снимает отметку с узла: откат в ней включён. Имя читает история. */
export const REVERT_CHANGED: string = 'откат: черновик изменён';

function selectorCase(name: string, patch: Partial<ITreeSelectorCase> = {}): ITreeSelectorCase {
    return {
        name,
        mode: 'multiple',
        value: ['ararat', 'mtac'],
        confirm: false,
        emptyAllowed: true,
        expandControls: false,
        clearable: false,
        revertable: false,
        multiToggle: false,
        searchTerm: '',
        label: '',
        disabled: false,
        selectAll: true,
        own: false,
        ...patch,
    };
}

/**
 * Матрицы `rt-tree-selector` для витрины.
 *
 * Каждая матрица стоит парой половин под двумя наборами оформления. Селектор берёт высоту места,
 * куда его поставили, поэтому каждая ячейка — коробка своей ширины и высоты: без неё дерево
 * растянулось бы по содержимому, и прокрутка внутри не была бы видна.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-tree-selector-matrix',
    templateUrl: './test-tree-selector-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        NgTemplateOutlet,
        // components
        RtButtonDirective,
        RtTreeSelectorComponent,
        RtTreeSelectorControlsDirective,
        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtTreeSelectorMatrixComponent {
    public part: TTreeSelectorMatrixPart = 'form';

    public readonly nodes: ReadonlyArray<IRtTree.Node<string>> = TREE_SELECTOR_STORY_NODES;
    public readonly defaultValue: ReadonlyArray<string> = ['ararat', 'mtac'];

    public readonly formCases: readonly ITreeSelectorCase[] = [
        selectorCase('прямая форма', { expandControls: true }),
        selectorCase('подтверждаемая: «Применить» выключено', { confirm: true }),
        selectorCase('пустой выбор запрещён', { confirm: true, emptyAllowed: false, value: [] }),
        selectorCase('выключен', {
            confirm: true,
            disabled: true,
            expandControls: true,
            clearable: true,
            revertable: true,
            multiToggle: true,
        }),
    ];

    public readonly searchCases: readonly ITreeSelectorCase[] = [
        selectorCase('«гост 4*» — каждое слово', { searchTerm: 'гост 4*' }),
        selectorCase('«ереван» — группа целиком', { searchTerm: 'ереван' }),
        selectorCase('ничего не нашлось', { searchTerm: 'нет такого' }),
    ];

    public readonly controlCases: readonly ITreeSelectorCase[] = [
        selectorCase('без кнопок — умолчание'),
        selectorCase('развернуть и свернуть', { expandControls: true }),
        selectorCase('заголовок и очистка', { label: 'Гостиницы', clearable: true }),
        selectorCase('откат: черновик не изменён', { confirm: true, revertable: true }),
        selectorCase(REVERT_CHANGED, { confirm: true, revertable: true }),
        selectorCase('переключатель множественного выбора', { multiToggle: true }),
        selectorCase('контрол приложения', { expandControls: true, own: true }),
    ];

    public readonly modeCases: readonly ITreeSelectorCase[] = [
        selectorCase('флажки — multiple'),
        selectorCase('радио — single', { mode: 'single', value: ['kaskad'], confirm: true }),
        selectorCase('без отметок — none', { mode: 'none', value: [] }),
    ];

    public readonly caseLabel: (value: ITreeSelectorCase) => string = (value: ITreeSelectorCase): string => value.name;
}
