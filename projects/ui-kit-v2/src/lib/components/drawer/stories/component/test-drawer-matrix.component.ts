import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryGridComponent } from '../../../../../showcase/story-grid.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtDrawerContainerComponent } from '../../rt-drawer-container.component';
import { RtDrawerComponent } from '../../rt-drawer.component';
import { IRtDrawer } from '../../rt-drawer.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TDrawerMatrixPart = 'mode' | 'states' | 'presets' | 'themes';

interface IDrawerCell {
    readonly mode: IRtDrawer.Mode;
    readonly position: IRtDrawer.Position;
    readonly opened: boolean;
    readonly resizable: boolean;
}

function cellsOf(mode: IRtDrawer.Mode): Readonly<Record<string, IDrawerCell>> {
    return {
        opened: { mode, position: 'start', opened: true, resizable: false },
        closed: { mode, position: 'start', opened: false, resizable: false },
        resizable: { mode, position: 'start', opened: true, resizable: true },
    };
}

/**
 * Матрицы `rt-drawer` для витрины.
 *
 * Перемножены место и край: рядом с содержимым панель сужает его, поверх — ложится на него с
 * подложкой, и у каждого края своя граница и своя ручка. Состояния — открытая, закрытая и с ручкой
 * ширины. Панель показана в участке с содержимым: без него не видно, что она сужает или накрывает.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-drawer-matrix',
    templateUrl: './test-drawer-matrix.component.html',
    // native-ok: рамка участка страницы в ячейке матрицы, в пакет не уезжает
    styles: `
        .app-drawer-matrix__area {
            width: 20rem;
            height: 8rem;
            border: 1px solid var(--rt-color-border-subtle);
        }

        .app-drawer-matrix__panel,
        .app-drawer-matrix__content {
            padding: var(--rt-space-3);
            font-size: var(--rt-text-sm);
            text-align: start;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgTemplateOutlet,

        // components
        RtDrawerComponent,
        RtDrawerContainerComponent,

        // showcase
        StoryGridComponent,
        StoryPresetsComponent,
        StoryThemesComponent,
    ],
})
export class TestRtDrawerMatrixComponent {
    public part: TDrawerMatrixPart = 'mode';

    public readonly modes: readonly IRtDrawer.Mode[] = ['side', 'over'];
    public readonly positions: readonly IRtDrawer.Position[] = ['start', 'end'];
    public readonly states: readonly string[] = ['opened', 'closed', 'resizable'];

    public readonly sideCell: IDrawerCell = { mode: 'side', position: 'start', opened: true, resizable: false };
    public readonly overCell: IDrawerCell = { mode: 'over', position: 'end', opened: true, resizable: false };

    /** Ячейки состояний заранее: шаблон берёт готовую, а не собирает её вызовом. */
    public readonly stateCells: Readonly<Record<IRtDrawer.Mode, Readonly<Record<string, IDrawerCell>>>> = {
        side: cellsOf('side'),
        over: cellsOf('over'),
    };

    public readonly stateLabel: (value: string) => string = (value: string): string =>
        ({ opened: 'открыта', closed: 'закрыта', resizable: 'с ручкой' })[value] ?? value;
}
