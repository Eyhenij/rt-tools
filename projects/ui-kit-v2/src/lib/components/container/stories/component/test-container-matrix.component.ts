import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtContainerComponent } from '../../rt-container.component';
import {
    RtContainerContentDirective,
    RtContainerHeaderDirective,
    RtContainerLeftSidenavDirective,
    RtContainerToolbarLeftDirective,
    RtContainerToolbarRightDirective,
} from '../../rt-container.directives';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type ContainerMatrixPart = 'zones' | 'themes';

/** Какие зоны объявлены: необъявленная зона не создаёт пустого узла, и каркас меняет вид. */
interface IContainerZonesCase {
    readonly name: string;
    readonly header: boolean;
    readonly leftSidenav: boolean;
    readonly toolbar: boolean;
}

/**
 * Матрицы состояний `rt-container` для витрины.
 *
 * Каркас показан уменьшенным: настоящий занимает окно целиком, и рядом два таких не поставить.
 * Зоны наполнены демонстрационными полосками, а не компонентами кита: каркас решает, **где**
 * лежат зоны, а не что в них.
 *
 * Правой панели здесь нет: её создаёт оверлей, открывается она вызовом `openRight()`, а событие
 * открытия привязано к концу перехода — в статичной ячейке этого не показать. Объявлено на
 * странице-обзоре.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-container-matrix',
    template: `
        @switch (part) {
            @case ('zones') {
                <app-story-row caption="Объявленные зоны" [items]="zoneCases" [itemLabel]="caseLabel" [slotWidth]="frameWidth">
                    <ng-template let-zonesCase>
                        <div class="app-container-matrix__frame">
                            <rt-container height="auto">
                                @if (zonesCase.header) {
                                    <ng-template rtContainerHeader>
                                        <div class="app-container-matrix__band">шапка</div>
                                    </ng-template>
                                }
                                @if (zonesCase.leftSidenav) {
                                    <ng-template rtContainerLeftSidenav>
                                        <div class="app-container-matrix__band app-container-matrix__band--tall">меню</div>
                                    </ng-template>
                                }
                                @if (zonesCase.toolbar) {
                                    <ng-template rtContainerToolbarLeft>
                                        <div class="app-container-matrix__band">фильтр</div>
                                    </ng-template>
                                    <ng-template rtContainerToolbarRight>
                                        <div class="app-container-matrix__band">действия</div>
                                    </ng-template>
                                }
                                <ng-template rtContainerContent>
                                    <div class="app-container-matrix__band app-container-matrix__band--tall">содержимое</div>
                                </ng-template>
                            </rt-container>
                        </div>
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Каркас в обеих темах">
                    <ng-template>
                        <div class="app-container-matrix__frame">
                            <rt-container height="auto">
                                <ng-template rtContainerHeader>
                                    <div class="app-container-matrix__band">шапка</div>
                                </ng-template>
                                <ng-template rtContainerLeftSidenav>
                                    <div class="app-container-matrix__band app-container-matrix__band--tall">меню</div>
                                </ng-template>
                                <ng-template rtContainerToolbarLeft>
                                    <div class="app-container-matrix__band">фильтр</div>
                                </ng-template>
                                <ng-template rtContainerContent>
                                    <div class="app-container-matrix__band app-container-matrix__band--tall">содержимое</div>
                                </ng-template>
                            </rt-container>
                        </div>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    styles: `
        /* Настоящий каркас занимает окно целиком: в ячейке он показан уменьшенным, иначе рядом
           два таких не поставить. */
        .app-container-matrix__frame {
            height: 16rem;
            overflow: hidden;
            border: 1px solid var(--rt-color-border-subtle);
            border-radius: var(--rt-radius-sm);
        }

        /* Полоска вместо настоящего содержимого: каркас решает, где лежат зоны, а не что в них. */
        .app-container-matrix__band {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--rt-space-xs);
            background: var(--rt-color-bg-hover);
            color: var(--rt-color-text-muted);
            font-size: var(--rt-text-xs);
        }

        .app-container-matrix__band--tall {
            height: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtContainerComponent,
        RtContainerContentDirective,
        RtContainerHeaderDirective,
        RtContainerLeftSidenavDirective,
        RtContainerToolbarLeftDirective,
        RtContainerToolbarRightDirective,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtContainerMatrixComponent {
    public part: ContainerMatrixPart = 'zones';

    /** Ширина ячейки: каркас тянется на всю ширину родителя и по содержимому схлопнулся бы. */
    public readonly frameWidth: string = '20rem';

    public readonly zoneCases: readonly IContainerZonesCase[] = [
        { name: 'весь каркас', header: true, leftSidenav: true, toolbar: true },
        { name: 'без меню', header: true, leftSidenav: false, toolbar: true },
        { name: 'только содержимое', header: false, leftSidenav: false, toolbar: false },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
