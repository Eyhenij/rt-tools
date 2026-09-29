import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtScrollAreaComponent } from '../../rt-scroll-area.component';
import { RtScrollAreaContentDirective, RtScrollAreaFooterDirective, RtScrollAreaHeaderDirective } from '../../rt-scroll-area.directives';

/** Какую матрицу рисовать: у каждой оси свой показ, и выбирает его этот вход. */
export type TScrollAreaMatrixPart = 'parts' | 'hint' | 'presets' | 'themes';

/** Какие части объявлены: необъявленная не рисуется вовсе, и область меняет вид. */
interface IScrollAreaPartsCase {
    readonly name: string;
    readonly header: boolean;
    readonly footer: boolean;
}

/** Виден ли признак непоказанного снизу: вход выключен, список влез, список не влез. */
interface IScrollAreaHintCase {
    readonly name: string;
    readonly hint: boolean;
    readonly short: boolean;
}

/**
 * Матрицы состояний `rt-scroll-area` для витрины.
 *
 * Область берёт сто процентов своего хоста, поэтому в каждой ячейке стоит коробка показа: без
 * неё область вытянулась бы по списку, и признака непоказанного снизу не увидеть вовсе.
 *
 * Наведение, фокус и нажатие на значок ячейкой не показать: значок появляется только над
 * непоказанным снизу, а наведение в кадр не попадает. Названо на странице-обзоре.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-scroll-area-matrix',
    template: `
        @switch (part) {
            @case ('parts') {
                <app-story-presets caption="Объявленные части в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="partsCases" [itemLabel]="caseLabel" [slotWidth]="boxWidth">
                            <ng-template let-partsCase>
                                <div class="app-scroll-area-matrix__box">
                                    <rt-scroll-area [isScrollHintShown]="true">
                                        @if (partsCase.header) {
                                            <ng-template rtScrollAreaHeader>
                                                <div class="app-scroll-area-matrix__title">Заявки смены</div>
                                            </ng-template>
                                        }
                                        <ng-template rtScrollAreaContent>
                                            @for (row of rows; track row) {
                                                <div class="app-scroll-area-matrix__row">{{ row }}</div>
                                            }
                                        </ng-template>
                                        @if (partsCase.footer) {
                                            <ng-template rtScrollAreaFooter>
                                                <div class="app-scroll-area-matrix__total">Всего: {{ rows.length }}</div>
                                            </ng-template>
                                        }
                                    </rt-scroll-area>
                                </div>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('hint') {
                <app-story-presets caption="Признак непоказанного снизу в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="hintCases" [itemLabel]="caseLabel" [slotWidth]="boxWidth">
                            <ng-template let-hintCase>
                                <div class="app-scroll-area-matrix__box">
                                    <rt-scroll-area [isScrollHintShown]="hintCase.hint">
                                        <ng-template rtScrollAreaContent>
                                            @for (row of hintCase.short ? shortRows : rows; track row) {
                                                <div class="app-scroll-area-matrix__row">{{ row }}</div>
                                            }
                                        </ng-template>
                                        <ng-template rtScrollAreaFooter>
                                            <div class="app-scroll-area-matrix__total">Итого</div>
                                        </ng-template>
                                    </rt-scroll-area>
                                </div>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Область в обоих наборах">
                    <ng-template>
                        <div class="app-scroll-area-matrix__box">
                            <rt-scroll-area [isScrollHintShown]="true">
                                <ng-template rtScrollAreaHeader>
                                    <div class="app-scroll-area-matrix__title">Заявки смены</div>
                                </ng-template>
                                <ng-template rtScrollAreaContent>
                                    @for (row of rows; track row) {
                                        <div class="app-scroll-area-matrix__row">{{ row }}</div>
                                    }
                                </ng-template>
                                <ng-template rtScrollAreaFooter>
                                    <div class="app-scroll-area-matrix__total">Всего: {{ rows.length }}</div>
                                </ng-template>
                            </rt-scroll-area>
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Область в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <div class="app-scroll-area-matrix__box">
                                    <rt-scroll-area [isScrollHintShown]="true">
                                        <ng-template rtScrollAreaHeader>
                                            <div class="app-scroll-area-matrix__title">Заявки смены</div>
                                        </ng-template>
                                        <ng-template rtScrollAreaContent>
                                            @for (row of rows; track row) {
                                                <div class="app-scroll-area-matrix__row">{{ row }}</div>
                                            }
                                        </ng-template>
                                        <ng-template rtScrollAreaFooter>
                                            <div class="app-scroll-area-matrix__total">Всего: {{ rows.length }}</div>
                                        </ng-template>
                                    </rt-scroll-area>
                                </div>
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
    styles: `
        /* Коробка показа — экран потребителя: область берёт её высоту и по ней обрезает. */
        .app-scroll-area-matrix__box {
            height: 12rem;
            border: 1px solid var(--rt-color-border-subtle);
            border-radius: var(--rt-radius-sm);
            background: var(--rt-color-bg-surface);
        }

        .app-scroll-area-matrix__title {
            color: var(--rt-color-text-primary);
            font-size: var(--rt-text-sm);
        }

        .app-scroll-area-matrix__row {
            padding: var(--rt-space-2) 0;
            color: var(--rt-color-text-muted);
            font-size: var(--rt-text-xs);
        }

        /* Разделитель первой строкой подвала: ровно до него доходит полоса растушёвки. */
        .app-scroll-area-matrix__total {
            border-top: 1px solid var(--rt-color-border-subtle);
            padding-top: var(--rt-space-2);
            color: var(--rt-color-text-primary);
            font-size: var(--rt-text-xs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtScrollAreaComponent,
        RtScrollAreaContentDirective,
        RtScrollAreaFooterDirective,
        RtScrollAreaHeaderDirective,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtScrollAreaMatrixComponent {
    public part: TScrollAreaMatrixPart = 'parts';

    /** Ширина ячейки: область тянется на всю ширину родителя и по содержимому схлопнулась бы. */
    public readonly boxWidth: string = '18rem';

    public readonly partsCases: readonly IScrollAreaPartsCase[] = [
        { name: 'все три части', header: true, footer: true },
        { name: 'без подвала', header: true, footer: false },
        { name: 'только тело', header: false, footer: false },
    ];

    public readonly hintCases: readonly IScrollAreaHintCase[] = [
        { name: 'снизу осталось', hint: true, short: false },
        { name: 'список влез', hint: true, short: true },
        { name: 'признак выключен', hint: false, short: false },
    ];

    public readonly rows: readonly string[] = [
        'Замена фильтра, цех 2',
        'Поверка манометра, узел 7',
        'Обход трассы, участок 14',
        'Приёмка смены, бригада 3',
        'Проверка уплотнений, насос 1',
        'Ревизия задвижки, линия 9',
    ];

    /** Короткий список влезает в коробку целиком: признака над ним быть не должно. */
    public readonly shortRows: readonly string[] = ['Замена фильтра, цех 2', 'Поверка манометра, узел 7'];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
