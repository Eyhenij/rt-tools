import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { IPageModel } from '@rt-tools/utils';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtDynamicListComponent } from '../../rt-dynamic-list.component';
import { RtDynamicListToolbarActionsDirective, RtDynamicListToolbarSelectorsDirective } from '../../rt-dynamic-list.directives';

/** Какую матрицу рисовать: у каждой оси свой показ, и выбирает его этот вход. */
export type TDynamicListMatrixPart = 'toolbar' | 'empty' | 'narrow' | 'presets' | 'themes';

/** Случай панели: сколько действий заказано и стоит ли отбор. */
interface IDynamicListToolbarCase {
    readonly name: string;
    readonly refresh: boolean;
    readonly columns: boolean;
    readonly clear: boolean;
    readonly filtered: boolean;
}

/** Случай пустоты: пустой раздел и пустой ответ под отбором говорят разное. */
interface IDynamicListEmptyCase {
    readonly name: string;
    readonly filtered: boolean;
}

/** Три страницы: ряд номеров под списком нужен. */
const PAGE: IPageModel = { pageNumber: 1, pageSize: 20, totalCount: 55 };

/**
 * Матрицы состояний `rt-dynamic-list` для витрины.
 *
 * Список берёт сто процентов своего хоста, поэтому в каждой ячейке стоит коробка показа: без неё
 * список вытянулся бы по записям, и панель с нумерацией разъехались бы по экрану.
 *
 * Узкий вид семья объявляет медиазапросом по порогу кита, а не входом, поэтому увидеть его можно
 * только на кадре порога — часть `narrow` и ширины в показе.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-dynamic-list-matrix',
    template: `
        @switch (part) {
            @case ('toolbar') {
                <app-story-presets caption="Панель инструментов в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="toolbarCases" [itemLabel]="caseLabel" [slotWidth]="boxWidth">
                            <ng-template let-toolbarCase>
                                <div class="app-dynamic-list-matrix__box">
                                    <rt-dynamic-list
                                        [showRefresh]="toolbarCase.refresh"
                                        [showColumnSettings]="toolbarCase.columns"
                                        [showClearFilters]="toolbarCase.clear"
                                        [filtered]="toolbarCase.filtered"
                                        [selectable]="true">
                                        <ng-template rtDynamicListSelectors>
                                            <span class="app-dynamic-list-matrix__hint">Смена 2</span>
                                        </ng-template>
                                        <ng-template rtDynamicListActions>
                                            <span class="app-dynamic-list-matrix__hint">Своё</span>
                                        </ng-template>
                                        <ng-container [ngTemplateOutlet]="rowsTpl" />
                                    </rt-dynamic-list>
                                </div>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('empty') {
                <app-story-presets caption="Две причины пустоты в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="emptyCases" [itemLabel]="caseLabel" [slotWidth]="boxWidth">
                            <ng-template let-emptyCase>
                                <div class="app-dynamic-list-matrix__box">
                                    <rt-dynamic-list
                                        [empty]="true"
                                        [filtered]="emptyCase.filtered"
                                        [showClearFilters]="true"
                                        [showRefresh]="true" />
                                </div>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('narrow') {
                <app-story-presets fill caption="Узкий вид: отбор над действиями, поиск во всю ширину">
                    <ng-template>
                        <div class="app-dynamic-list-matrix__box">
                            <rt-dynamic-list
                                [pageModel]="page"
                                [showRefresh]="true"
                                [showColumnSettings]="true"
                                [showClearFilters]="true"
                                [filtered]="true"
                                [selectable]="true">
                                <ng-template rtDynamicListSelectors>
                                    <span class="app-dynamic-list-matrix__hint">Смена 2</span>
                                </ng-template>
                                <ng-container [ngTemplateOutlet]="rowsTpl" />
                            </rt-dynamic-list>
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets fill caption="Список в обоих наборах">
                    <ng-template>
                        <div class="app-dynamic-list-matrix__box">
                            <rt-dynamic-list [pageModel]="page" [showRefresh]="true" [showColumnSettings]="true">
                                <ng-container [ngTemplateOutlet]="rowsTpl" />
                            </rt-dynamic-list>
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets fill caption="Список в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <div class="app-dynamic-list-matrix__box">
                                    <rt-dynamic-list [pageModel]="page" [showRefresh]="true" [showColumnSettings]="true">
                                        <ng-container [ngTemplateOutlet]="rowsTpl" />
                                    </rt-dynamic-list>
                                </div>
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }

        <ng-template #rowsTpl>
            <div class="app-dynamic-list-matrix__rows">
                @for (row of rows; track row) {
                    <div class="app-dynamic-list-matrix__row">{{ row }}</div>
                }
            </div>
        </ng-template>
    `,
    styles: `
        /* Коробка показа — экран потребителя: список берёт её высоту и по ней обрезает записи. */
        .app-dynamic-list-matrix__box {
            height: 19rem;
            max-width: 100%;
            min-width: 0;
            border: 1px solid var(--rt-color-border-subtle);
            border-radius: var(--rt-radius-sm);
            padding: var(--rt-space-2);
            background: var(--rt-color-bg-surface);
        }

        .app-dynamic-list-matrix__rows {
            display: flex;
            flex-direction: column;
        }

        .app-dynamic-list-matrix__row {
            border-bottom: 1px solid var(--rt-color-border-subtle);
            padding: var(--rt-space-2) 0;
            color: var(--rt-color-text-primary);
            font-size: var(--rt-text-xs);
        }

        .app-dynamic-list-matrix__hint {
            color: var(--rt-color-text-muted);
            font-size: var(--rt-text-xs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // Angular
        NgTemplateOutlet,

        // components
        RtDynamicListComponent,
        RtDynamicListToolbarActionsDirective,
        RtDynamicListToolbarSelectorsDirective,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtDynamicListMatrixComponent {
    public part: TDynamicListMatrixPart = 'toolbar';

    /**
     * Ширина ячейки: список тянется на всю ширину родителя и по содержимому схлопнулся бы. Число
     * измерено по половине пары наборов: в неё встаёт одна ячейка, и полоса панели стоит одной
     * строкой — так её и видит человек. Ужатую полосу показывает история узкого вида.
     */
    public readonly boxWidth: string = '28rem';

    public readonly page: IPageModel = PAGE;

    public readonly toolbarCases: readonly IDynamicListToolbarCase[] = [
        { name: 'все действия, отбор стоит', refresh: true, columns: true, clear: true, filtered: true },
        { name: 'сбрасывать нечего', refresh: true, columns: true, clear: true, filtered: false },
        { name: 'только поиск', refresh: false, columns: false, clear: false, filtered: false },
    ];

    public readonly emptyCases: readonly IDynamicListEmptyCase[] = [
        { name: 'в разделе пусто', filtered: false },
        { name: 'отбор ничего не нашёл', filtered: true },
    ];

    public readonly rows: readonly string[] = [
        'Замена фильтра, цех 2',
        'Поверка манометра, узел 7',
        'Обход трассы, участок 14',
        'Приёмка смены, бригада 3',
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
