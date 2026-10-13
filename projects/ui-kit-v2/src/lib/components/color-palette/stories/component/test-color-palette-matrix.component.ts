import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { StoryGridComponent } from '../../../../../showcase/story-grid.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_CONTROL_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtColorPickerComponent } from '../../picker/rt-color-picker.component';
import { RtColorPaletteComponent } from '../../rt-color-palette.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TColorPaletteMatrixPart = 'value' | 'colors' | 'readonly' | 'states' | 'picker' | 'presets' | 'themes';

interface IColorPaletteCase {
    readonly name: string;
    readonly control: FormControl<string | null>;
}

interface IColorPaletteColorsCase {
    readonly name: string;
    readonly colors: readonly string[];
}

interface IColorPickerCase {
    readonly name: string;
    readonly value: string;
    readonly channels: boolean;
}

/** Цвета темы приложения — короткий набор, каким его передают входом `colors`. */
const THEME_COLORS: readonly string[] = ['#1e88e5', '#43a047', '#fb8c00', '#e53935', '#8e24aa', '#546e7a'];

function control(value: string | null, disabled: boolean = false): FormControl<string | null> {
    return new FormControl<string | null>({ value, disabled });
}

/**
 * Матрицы состояний `rt-color-palette` для витрины.
 *
 * Значение палитры живёт в форме, поэтому у каждой ячейки свой элемент формы с нужным цветом. Панель
 * своего цвета показана отдельной историей без оверлея: она стоит в ячейке, как стояла бы на панели,
 * и попадает в кадр вместе с набором половины.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-color-palette-matrix',
    templateUrl: './test-color-palette-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // components
        RtColorPaletteComponent,
        RtColorPickerComponent,

        // showcase
        StoryGridComponent,
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtColorPaletteMatrixComponent {
    public part: TColorPaletteMatrixPart = 'value';

    public readonly themeColors: readonly string[] = THEME_COLORS;

    public readonly states: readonly IStoryState[] = STORY_CONTROL_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    public readonly valueCases: readonly IColorPaletteCase[] = [
        { name: 'без цвета', control: control(null) },
        { name: 'цвет из набора', control: control('#43a047') },
        { name: 'свой цвет', control: control('#123456') },
    ];

    public readonly colorsCases: readonly IColorPaletteColorsCase[] = [
        { name: 'набор кита', colors: [] },
        { name: 'цвета темы', colors: THEME_COLORS },
    ];

    public readonly readonlyCases: readonly IColorPaletteCase[] = [
        { name: 'с цветом', control: control('#e53935') },
        { name: 'без цвета', control: control(null) },
    ];

    public readonly disabledCases: readonly IColorPaletteCase[] = [
        { name: 'отключена, без цвета', control: control(null, true) },
        { name: 'отключена, с цветом', control: control('#43a047', true) },
    ];

    /** Наборы показаны без выбора: цвет одного набора лёг бы в другой чужим образцом. */
    public readonly colorsControl: FormControl<string | null> = control(null);

    public readonly stateControl: FormControl<string | null> = control('#1e88e5');

    public readonly pickerCases: readonly IColorPickerCase[] = [
        { name: 'насыщенный', value: '#1e88e5', channels: false },
        { name: 'серый', value: '#808080', channels: false },
        { name: 'с полями каналов', value: '#1e88e5', channels: true },
    ];

    public readonly presetControl: FormControl<string | null> = control('#43a047');
    public readonly themeControl: FormControl<string | null> = control('#43a047');

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
