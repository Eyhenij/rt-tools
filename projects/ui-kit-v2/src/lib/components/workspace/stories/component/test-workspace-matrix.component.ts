import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtWorkspaceComponent } from '../../rt-workspace.component';
import { RtWorkspaceAsideDirective, RtWorkspaceCenterDirective, RtWorkspaceListDirective } from '../../rt-workspace.directives';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TWorkspaceMatrixPart = 'slots' | 'active' | 'widths' | 'presets' | 'themes';

/**
 * Матрицы состояний `rt-workspace` для витрины.
 *
 * Входы рабочего стола — числовые границы ширин, и осью значений они не служат: показывать надо
 * не перечисление чисел, а какие слоты объявлены и что меняется от `hasActive`.
 *
 * **`storageKey` в матрицах не задан намеренно.** С ключом ширины переживают пересоздание
 * компонента, и соседние ячейки, поделив один ключ, показывали бы ширину, которую перетащили в
 * соседней, — матрица врала бы тем убедительнее, чем дольше на неё смотреть.
 *
 * Узкую полосу с кнопками «назад» и «подробности» видно только на узком кадре: её включает
 * медиазапрос, а не вход, и порог объявлен в самих историях.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-workspace-matrix',
    template: `
        @switch (part) {
            @case ('slots') {
                <app-story-row caption="Какие слоты объявлены" [items]="slotCases">
                    <ng-template let-slot>
                        <div style="height: 18rem; border: 1px dashed var(--rt-color-border-subtle)">
                            @switch (slot) {
                                @case ('список и центр') {
                                    <rt-workspace>
                                        <ng-template rtWorkspaceList>
                                            <div style="padding: 0.5rem">Список переписок</div>
                                        </ng-template>
                                        <ng-template rtWorkspaceCenter>
                                            <div style="padding: 0.5rem">Содержимое переписки</div>
                                        </ng-template>
                                    </rt-workspace>
                                }
                                @case ('все три') {
                                    <rt-workspace hasActive>
                                        <ng-template rtWorkspaceList>
                                            <div style="padding: 0.5rem">Список переписок</div>
                                        </ng-template>
                                        <ng-template rtWorkspaceCenter>
                                            <div style="padding: 0.5rem">Содержимое переписки</div>
                                        </ng-template>
                                        <ng-template rtWorkspaceAside>
                                            <div style="padding: 0.5rem">Подробности</div>
                                        </ng-template>
                                    </rt-workspace>
                                }
                                @case ('только центр') {
                                    <rt-workspace>
                                        <ng-template rtWorkspaceCenter>
                                            <div style="padding: 0.5rem">Содержимое во всю ширину</div>
                                        </ng-template>
                                    </rt-workspace>
                                }
                            }
                        </div>
                    </ng-template>
                </app-story-row>
            }

            @case ('active') {
                <app-story-row caption="Выбрана ли запись" [items]="activeCases" [itemLabel]="activeLabel">
                    <ng-template let-value>
                        <div style="height: 18rem; border: 1px dashed var(--rt-color-border-subtle)">
                            <rt-workspace [hasActive]="value">
                                <ng-template rtWorkspaceList>
                                    <div style="padding: 0.5rem">Список переписок</div>
                                </ng-template>
                                <ng-template rtWorkspaceCenter>
                                    <div style="padding: 0.5rem">Содержимое переписки</div>
                                </ng-template>
                                <ng-template rtWorkspaceAside>
                                    <div style="padding: 0.5rem">Подробности</div>
                                </ng-template>
                            </rt-workspace>
                        </div>
                    </ng-template>
                </app-story-row>
            }

            @case ('widths') {
                <app-story-row caption="Начальные ширины панелей" [items]="widthCases" [itemLabel]="widthLabel">
                    <ng-template let-item>
                        <div style="height: 18rem; border: 1px dashed var(--rt-color-border-subtle)">
                            <rt-workspace hasActive [listDefaultWidth]="item.list" [asideDefaultWidth]="item.aside" [centerMinWidth]="240">
                                <ng-template rtWorkspaceList>
                                    <div style="padding: 0.5rem">Список</div>
                                </ng-template>
                                <ng-template rtWorkspaceCenter>
                                    <div style="padding: 0.5rem">Содержимое</div>
                                </ng-template>
                                <ng-template rtWorkspaceAside>
                                    <div style="padding: 0.5rem">Подробности</div>
                                </ng-template>
                            </rt-workspace>
                        </div>
                    </ng-template>
                </app-story-row>
            }

            @case ('presets') {
                <app-story-presets caption="Рабочий стол в обоих наборах">
                    <ng-template>
                        <div style="height: 16rem; width: 30rem; border: 1px dashed var(--rt-color-border-subtle)">
                            <rt-workspace hasActive>
                                <ng-template rtWorkspaceList>
                                    <div style="padding: 0.5rem">Список</div>
                                </ng-template>
                                <ng-template rtWorkspaceCenter>
                                    <div style="padding: 0.5rem">Содержимое</div>
                                </ng-template>
                                <ng-template rtWorkspaceAside>
                                    <div style="padding: 0.5rem">Подробности</div>
                                </ng-template>
                            </rt-workspace>
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-themes caption="Рабочий стол в обеих темах">
                    <ng-template>
                        <div style="height: 16rem; width: 30rem; border: 1px dashed var(--rt-color-border-subtle)">
                            <rt-workspace hasActive>
                                <ng-template rtWorkspaceList>
                                    <div style="padding: 0.5rem">Список</div>
                                </ng-template>
                                <ng-template rtWorkspaceCenter>
                                    <div style="padding: 0.5rem">Содержимое</div>
                                </ng-template>
                                <ng-template rtWorkspaceAside>
                                    <div style="padding: 0.5rem">Подробности</div>
                                </ng-template>
                            </rt-workspace>
                        </div>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtWorkspaceComponent,

        // directives
        RtWorkspaceAsideDirective,
        RtWorkspaceCenterDirective,
        RtWorkspaceListDirective,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtWorkspaceMatrixComponent {
    public part: TWorkspaceMatrixPart = 'slots';

    public readonly slotCases: readonly string[] = ['список и центр', 'все три', 'только центр'];
    public readonly activeCases: readonly boolean[] = [false, true];

    public readonly widthCases: readonly { name: string; list: number; aside: number }[] = [
        { name: 'узкий список', list: 200, aside: 280 },
        { name: 'широкий список', list: 360, aside: 280 },
        { name: 'широкие подробности', list: 240, aside: 400 },
    ];

    public readonly activeLabel: (value: boolean) => string = (value: boolean): string =>
        value ? 'запись выбрана — подробности есть' : 'запись не выбрана';

    public readonly widthLabel: (value: { name: string }) => string = (value: { name: string }): string => value.name;
}
