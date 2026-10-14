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
    template: `
        <ng-template #area let-cell>
            <rt-drawer-container class="app-drawer-matrix__area">
                <rt-drawer
                    ariaLabel="Фильтры"
                    [mode]="cell.mode"
                    [position]="cell.position"
                    [opened]="cell.opened"
                    [resizable]="cell.resizable"
                    [width]="128">
                    <div class="app-drawer-matrix__panel">Фильтры</div>
                </rt-drawer>
                <div class="app-drawer-matrix__content">Отчёт по продажам за квартал</div>
            </rt-drawer-container>
        </ng-template>

        @switch (part) {
            @case ('mode') {
                <app-story-presets caption="Место × край в обоих наборах">
                    <ng-template>
                        <app-story-grid [rows]="modes" [columns]="positions">
                            <ng-template let-mode let-position="col">
                                <ng-container
                                    [ngTemplateOutlet]="area"
                                    [ngTemplateOutletContext]="{ $implicit: { mode, position, opened: true, resizable: false } }" />
                            </ng-template>
                        </app-story-grid>
                    </ng-template>
                </app-story-presets>
            }

            @case ('states') {
                <app-story-presets caption="Открытая, закрытая и с ручкой ширины">
                    <ng-template>
                        <app-story-grid [rows]="modes" [columns]="states" [columnLabel]="stateLabel">
                            <ng-template let-mode let-state="col">
                                <ng-container
                                    [ngTemplateOutlet]="area"
                                    [ngTemplateOutletContext]="{ $implicit: stateCells[mode][state] }" />
                            </ng-template>
                        </app-story-grid>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Панель рядом с содержимым в обоих наборах">
                    <ng-template>
                        <ng-container [ngTemplateOutlet]="area" [ngTemplateOutletContext]="{ $implicit: sideCell }" />
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Панель в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <ng-container [ngTemplateOutlet]="area" [ngTemplateOutletContext]="{ $implicit: sideCell }" />
                                <ng-container [ngTemplateOutlet]="area" [ngTemplateOutletContext]="{ $implicit: overCell }" />
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
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
