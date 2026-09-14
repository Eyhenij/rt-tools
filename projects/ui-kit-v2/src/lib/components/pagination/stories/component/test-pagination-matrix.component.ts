import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IPageModel } from '@rt-tools/utils';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtPaginationComponent } from '../../rt-pagination.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TPaginationMatrixPart = 'position' | 'total' | 'loading' | 'container' | 'edges' | 'presets' | 'themes';

/** Случай полосы: имя для подписи ячейки и модель страницы. */
interface IPaginationCase {
    readonly name: string;
    readonly pageModel: IPageModel;
}

const PER_PAGE: readonly number[] = [20, 50, 100];

/**
 * Матрицы состояний `rt-pagination` для витрины.
 *
 * **Компонент не листает — он просит.** Страницу меняет потребитель, передав новый `pageModel`,
 * поэтому осью значений здесь служит сама модель: где стоит открытая страница, сколько их
 * всего и что происходит на краях диапазона.
 *
 * Узкая и широкая разметки живут в разметке одновременно, и какую показать, решает запрос по
 * ширине **контейнера**, а не окна. Кадром на пороге окна это не поймать вовсе — поэтому обе
 * формы стоят рядом в ряду «Ширина контейнера», каждая в своей обёртке заданной ширины.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-pagination-matrix',
    // Ширина ячейки ряда задана нарочно: хост полосы в узком ряду схлопывается в ноль, содержимое
    // выходит за него, и в половине пары случаи наезжают друг на друга. Своя ширина ячейки
    // заставляет ряд переноситься, а не сжимать полосу.
    template: `
        @switch (part) {
            @case ('position') {
                <app-story-presets caption="Где стоит открытая страница в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="20rem" [items]="positions" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <rt-pagination [pageModel]="item.pageModel" [perPageOptions]="perPage" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('total') {
                <app-story-presets caption="Сколько страниц всего в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="20rem" [items]="totals" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <rt-pagination [pageModel]="item.pageModel" [perPageOptions]="perPage" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('loading') {
                <app-story-presets caption="Загрузка в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="20rem" [items]="loadings" [itemLabel]="loadingLabel">
                            <ng-template let-value>
                                <rt-pagination [pageModel]="middle" [perPageOptions]="perPage" [loading]="value" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('container') {
                <app-story-presets caption="Ширина контейнера в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="containerWidths" [itemLabel]="containerLabel">
                            <ng-template let-width>
                                <div style="container-type: inline-size" [style.width]="width">
                                    <rt-pagination [pageModel]="middle" [perPageOptions]="perPage" />
                                </div>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('edges') {
                <app-story-presets caption="Края в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="20rem" [items]="edges" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <rt-pagination [pageModel]="item.pageModel" [perPageOptions]="perPage" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Полоса в обоих наборах">
                    <ng-template>
                        <rt-pagination [pageModel]="middle" [perPageOptions]="perPage" />
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Полоса в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <rt-pagination [pageModel]="middle" [perPageOptions]="perPage" />
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtPaginationComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtPaginationMatrixComponent {
    public part: TPaginationMatrixPart = 'position';

    public readonly perPage: readonly number[] = PER_PAGE;
    public readonly middle: IPageModel = { pageNumber: 5, pageSize: 20, totalCount: 400 };

    /** Полоса номеров показывает первую, последнюю и по одному соседу открытой; между ними — «…». */
    public readonly positions: readonly IPaginationCase[] = [
        { name: 'первая страница', pageModel: { pageNumber: 1, pageSize: 20, totalCount: 400 } },
        { name: 'вторая — многоточия слева нет', pageModel: { pageNumber: 2, pageSize: 20, totalCount: 400 } },
        { name: 'середина — многоточия с обеих сторон', pageModel: { pageNumber: 10, pageSize: 20, totalCount: 400 } },
        { name: 'последняя', pageModel: { pageNumber: 20, pageSize: 20, totalCount: 400 } },
    ];

    public readonly totals: readonly IPaginationCase[] = [
        { name: 'две страницы', pageModel: { pageNumber: 1, pageSize: 20, totalCount: 34 } },
        { name: 'пять страниц — многоточий нет', pageModel: { pageNumber: 3, pageSize: 20, totalCount: 97 } },
        { name: 'двадцать страниц', pageModel: { pageNumber: 10, pageSize: 20, totalCount: 400 } },
    ];

    /** Во время загрузки заблокированы и номера, и стрелки: второй клик ушёл бы поверх неответа. */
    public readonly loadings: readonly boolean[] = [false, true];

    /**
     * Единственная страница номеров не показывает вовсе, а набор меньше самого мелкого размера
     * страницы прячет полосу целиком — `display: none` на хосте.
     */
    /**
     * Края идут парой «показана / спрятана»: полоса прячет себя целиком, когда записей не
     * больше наименьшего размера страницы, и порознь спрятанная ячейка неотличима от
     * несработавшей истории.
     */
    public readonly edges: readonly IPaginationCase[] = [
        { name: 'одна страница — номеров нет, полоса показана', pageModel: { pageNumber: 1, pageSize: 50, totalCount: 21 } },
        { name: 'ровно наименьший размер — полоса спрятана', pageModel: { pageNumber: 1, pageSize: 20, totalCount: 20 } },
        { name: 'пустой набор — полоса спрятана', pageModel: { pageNumber: 1, pageSize: 20, totalCount: 0 } },
        { name: 'последняя страница неполная', pageModel: { pageNumber: 3, pageSize: 20, totalCount: 41 } },
    ];

    /** Форму выбирает запрос по ширине контейнера: до 460 px — свёрнутая «‹ Стр. N из M ›». */
    public readonly containerWidths: readonly string[] = ['360px', '460px', '720px'];

    public readonly containerLabel: (value: string) => string = (value: string): string =>
        value === '720px' ? `${value} — номера` : `${value} — свёрнутая форма`;

    public readonly caseLabel: (value: IPaginationCase) => string = (value: IPaginationCase): string => value.name;

    public readonly loadingLabel: (value: boolean) => string = (value: boolean): string =>
        value ? 'загрузка — номера и стрелки заблокированы' : 'обычное';
}
