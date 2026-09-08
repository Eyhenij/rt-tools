import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { CATEGORY_ORDER, categoryOf, TIconCategory } from '../../icon-categories';
import { iconMaterialDrawn, iconMaterialMap, IRtIconMaterialEntry } from '../../rt-icon-material-map';
import { iconsName } from '../../rt-icon-names';
import { RtIconComponent } from '../../rt-icon.component';
import { IRtIcon } from '../../rt-icon.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TIconMatrixPart = 'catalog' | 'size' | 'color' | 'rotate' | 'themes' | 'social' | 'material' | 'presets';

/** Категория набора со своими именами — строка каталога. */
interface IIconCategoryGroup {
    readonly category: TIconCategory;
    readonly names: readonly IRtIcon.Name[];
}

/**
 * Матрицы `rt-icon` для витрины.
 *
 * Главная ось здесь — имя: их больше трёхсот, и «показать все значения» значит каталог, а
 * не ряд из выборки. Категории для него уже посчитаны `categoryOf` рядом с компонентом.
 * Размер и цвет друг на друга не влияют — они идут рядами, а не сеткой.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-icon-matrix',
    template: `
        @switch (part) {
            @case ('catalog') {
                @for (group of catalog; track group.category) {
                    <app-story-row [caption]="group.category" [items]="group.names">
                        <ng-template let-name>
                            <rt-icon size="lg" [name]="name" />
                        </ng-template>
                    </app-story-row>
                }
            }

            @case ('size') {
                <app-story-row caption="Размер" [items]="sizes">
                    <ng-template let-size>
                        <rt-icon name="alarm-clock" [size]="size" />
                    </ng-template>
                </app-story-row>
            }

            @case ('color') {
                <app-story-row caption="Цвет" [items]="colors">
                    <ng-template let-color>
                        <rt-icon name="alarm-clock" size="lg" [color]="color" />
                    </ng-template>
                </app-story-row>

                <p class="app-icon-matrix__note">
                    <code>inverse</code>
                    рассчитан на тёмную подложку — на светлой странице он сливается с фоном, и это его штатный вид, а не пропущенная ячейка.
                </p>
            }

            @case ('rotate') {
                <app-story-row caption="Поворот" [items]="rotations" [itemLabel]="rotateLabel">
                    <ng-template let-value>
                        <rt-icon name="arrow-right" size="lg" [rotate]="value" />
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Цвет в обеих темах">
                    <ng-template>
                        @for (color of colors; track color) {
                            <rt-icon name="alarm-clock" size="lg" [color]="color" />
                        }
                    </ng-template>
                </app-story-themes>
            }

            @case ('material') {
                <app-story-themes caption="Чем закрывается значок первого кита: имя оттуда — рисунок отсюда">
                    <ng-template>
                        <div class="app-icon-matrix__map">
                            @for (entry of materialMap; track entry.from) {
                                <div class="app-icon-matrix__pair">
                                    @if (entry.to) {
                                        <rt-icon size="lg" [name]="entry.to" />
                                    } @else {
                                        <span class="app-icon-matrix__gap">—</span>
                                    }
                                    <code>{{ entry.from }}</code>
                                </div>
                            }
                        </div>
                    </ng-template>
                </app-story-themes>

                <p class="app-icon-matrix__note">
                    Прочерк — имя, которому рисунка в наборе нет вовсе: его дорисовывают. Пара выбрана по смыслу, и смотреть её надо
                    глазами: проверка держит только то, что имя существует и файл на месте.
                </p>
            }

            @case ('presets') {
                <app-story-presets caption="Один и тот же значок в двух наборах: свой рисунок и материальный">
                    <ng-template>
                        <div class="app-icon-matrix__map">
                            @for (entry of materialDrawn; track entry) {
                                <div class="app-icon-matrix__pair">
                                    <rt-icon size="lg" [name]="entry" />
                                    <code>{{ entry }}</code>
                                </div>
                            }
                        </div>
                    </ng-template>
                </app-story-presets>

                <p class="app-icon-matrix__note">
                    Набор рисунков выбирается вместе с набором оформления: признак стоит на половине, и кит меняет рисунок сам. Имена,
                    которых в материальном наборе нет, рисуются своим — набор слой переопределений, а не второй полный каталог.
                </p>
            }

            @case ('social') {
                <app-story-themes caption="Знаки соцсетей в обеих темах: цвет задан в файле, тема его не трогает">
                    <ng-template>
                        @for (name of socialNames; track name) {
                            <rt-icon size="lg" [name]="name" />
                        }
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    styles: `
        .app-icon-matrix__note {
            max-width: 46rem;
            color: var(--rt-color-text-muted);
            font-size: 0.8125rem;
            line-height: 1.6;
        }

        .app-icon-matrix__map {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem 1.25rem;
        }

        .app-icon-matrix__pair {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.75rem;
        }

        .app-icon-matrix__gap {
            display: inline-flex;
            justify-content: center;
            width: 1.5rem;
            color: var(--rt-color-text-muted);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtIconComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtIconMatrixComponent {
    public part: TIconMatrixPart = 'catalog';

    public readonly sizes: readonly IRtIcon.Size[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    public readonly colors: readonly IRtIcon.Color[] = ['current', 'muted', 'info', 'success', 'warning', 'danger', 'inverse'];

    /** Знаки соцсетей: цвет у каждого свой и в файле, поэтому пара тем показывает их без оси цвета. */
    public readonly socialNames: readonly IRtIcon.Name[] = iconsName.filter((name: IRtIcon.Name): boolean => categoryOf(name) === 'Social');
    public readonly rotations: readonly (number | null)[] = [null, 90, 180, 270];

    /** Перечень соответствия значков первого кита: пару выбирают по смыслу, и смотрят её глазами. */
    public readonly materialMap: readonly IRtIconMaterialEntry[] = iconMaterialMap;

    /** Имена, у которых материальный рисунок есть: только их и показывает пара наборов. */
    public readonly materialDrawn: readonly IRtIcon.Name[] = [...iconMaterialDrawn].sort(
        (left: IRtIcon.Name, right: IRtIcon.Name): number => left.localeCompare(right)
    );

    /** Весь набор, разложенный по категориям в порядке `CATEGORY_ORDER`. */
    public readonly catalog: readonly IIconCategoryGroup[] = CATEGORY_ORDER.map((category: TIconCategory): IIconCategoryGroup => ({
        category,
        names: iconsName.filter((name: IRtIcon.Name): boolean => categoryOf(name) === category),
    })).filter((group: IIconCategoryGroup): boolean => group.names.length > 0);

    public readonly rotateLabel: (value: number | null) => string = (value: number | null): string =>
        value === null ? 'без поворота' : `${value}°`;
}
