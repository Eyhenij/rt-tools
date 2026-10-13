import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_CONTROL_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtSpeedMenuComponent } from '../../rt-speed-menu.component';
import { IRtSpeedMenu } from '../../rt-speed-menu.model';
import { SPEED_MENU_ZOOM, SPEED_MENU_ZOOM_UNAVAILABLE } from './test-speed-menu.data';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TSpeedMenuMatrixPart = 'size' | 'variant' | 'states' | 'open' | 'open-material' | 'presets' | 'themes';

/** Случай ячейки: подпись и что передано компоненту. */
interface ISpeedMenuCase {
    readonly name: string;
    readonly size?: IRtSpeedMenu.Size;
    readonly variant?: IRtSpeedMenu.Variant;
    readonly disabled?: boolean;
}

/**
 * Матрицы `rt-speed-menu` для витрины. Открытое меню — по одному на историю: нажатие по второму
 * меню считается нажатием снаружи первого и закрыло бы его.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-speed-menu-matrix',
    templateUrl: './test-speed-menu-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtSpeedMenuComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtSpeedMenuMatrixComponent {
    public part: TSpeedMenuMatrixPart = 'size';

    /** Сторона открытого меню в историях направлений. */
    public direction: IRtSpeedMenu.Direction = 'up';

    public readonly actions: readonly IRtSpeedMenu.Action[] = SPEED_MENU_ZOOM;
    public readonly unavailable: readonly IRtSpeedMenu.Action[] = SPEED_MENU_ZOOM_UNAVAILABLE;

    public readonly sizeCases: readonly ISpeedMenuCase[] = [
        { name: 'sm', size: 'sm' },
        { name: 'md', size: 'md' },
        { name: 'lg', size: 'lg' },
        { name: 'xl', size: 'xl' },
    ];

    public readonly variantCases: readonly ISpeedMenuCase[] = [
        { name: 'primary', variant: 'primary' },
        { name: 'secondary', variant: 'secondary' },
        { name: 'ghost', variant: 'ghost' },
        { name: 'недоступно', disabled: true },
    ];

    public readonly states: readonly IStoryState[] = STORY_CONTROL_STATES;

    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;
    public readonly caseLabel: (value: ISpeedMenuCase) => string = (value: ISpeedMenuCase): string => value.name;
}
