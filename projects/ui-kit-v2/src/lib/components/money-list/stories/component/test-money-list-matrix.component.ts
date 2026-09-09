import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtMoneyListComponent } from '../../rt-money-list.component';
import { RtMoneyRowComponent } from '../../rt-money-row.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TMoneyListMatrixPart = 'total' | 'loading' | 'length' | 'edges' | 'presets' | 'themes';

/**
 * Матрицы состояний `rt-money-list` и `rt-money-row` для витрины.
 *
 * **Считать компонент не умеет.** Итог — это просто строка с признаком `total`, выделенная
 * начертанием; складывает суммы вызывающий код. Ось итога поэтому показана рядом, где сумма
 * итога намеренно не равна сложению строк над ней: так видно, что число берётся снаружи.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-money-list-matrix',
    template: `
        @switch (part) {
            @case ('total') {
                <app-story-row caption="Итоговая строка" slotWidth="20rem" [items]="totals">
                    <ng-template let-total>
                        @switch (total) {
                            @case ('без итога') {
                                <rt-money-list>
                                    <rt-money-row label="Работы">120 000 ₽</rt-money-row>
                                    <rt-money-row label="Материалы">28 000 ₽</rt-money-row>
                                </rt-money-list>
                            }
                            @case ('с итогом') {
                                <rt-money-list>
                                    <rt-money-row label="Работы">120 000 ₽</rt-money-row>
                                    <rt-money-row label="Материалы">28 000 ₽</rt-money-row>
                                    <rt-money-row total label="Итого">148 000 ₽</rt-money-row>
                                </rt-money-list>
                            }
                            @case ('итог не равен сумме') {
                                <rt-money-list>
                                    <rt-money-row label="Работы">120 000 ₽</rt-money-row>
                                    <rt-money-row label="Материалы">28 000 ₽</rt-money-row>
                                    <rt-money-row total label="К оплате со скидкой">140 600 ₽</rt-money-row>
                                </rt-money-list>
                            }
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('loading') {
                <app-story-row caption="Загрузка суммы" slotWidth="20rem" [items]="loadings" [itemLabel]="loadingLabel">
                    <ng-template let-value>
                        <rt-money-list>
                            <rt-money-row label="Работы" [loading]="value">120 000 ₽</rt-money-row>
                            <rt-money-row total label="Итого" [loading]="value">148 000 ₽</rt-money-row>
                        </rt-money-list>
                    </ng-template>
                </app-story-row>
            }

            @case ('length') {
                <app-story-row caption="Длина списка" slotWidth="20rem" [items]="lengths">
                    <ng-template let-count>
                        <rt-money-list>
                            @for (row of rows.slice(0, count); track row.label) {
                                <rt-money-row [label]="row.label">{{ row.value }}</rt-money-row>
                            }
                            <rt-money-row total label="Итого">148 000 ₽</rt-money-row>
                        </rt-money-list>
                    </ng-template>
                </app-story-row>
            }

            @case ('edges') {
                <app-story-row caption="Края" slotWidth="20rem" [items]="edges">
                    <ng-template let-edge>
                        @switch (edge) {
                            @case ('пустой список') {
                                <rt-money-list />
                            }
                            @case ('только итог') {
                                <rt-money-list>
                                    <rt-money-row total label="Итого">0 ₽</rt-money-row>
                                </rt-money-list>
                            }
                            @case ('длинная подпись') {
                                <rt-money-list>
                                    <rt-money-row label="Пусконаладочные работы на объекте заказчика">64 000 ₽</rt-money-row>
                                </rt-money-list>
                            }
                            @case ('пустая сумма') {
                                <rt-money-list>
                                    <rt-money-row label="Комиссия" />
                                </rt-money-list>
                            }
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('presets') {
                <app-story-presets caption="Список в обоих наборах">
                    <ng-template>
                        <div style="width: 20rem">
                            <rt-money-list>
                                @for (row of rows; track row.label) {
                                    <rt-money-row [label]="row.label">{{ row.value }}</rt-money-row>
                                }
                                <rt-money-row total label="Итого">148 000 ₽</rt-money-row>
                            </rt-money-list>
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-themes caption="Список в обеих темах">
                    <ng-template>
                        <div style="width: 20rem">
                            <rt-money-list>
                                @for (row of rows; track row.label) {
                                    <rt-money-row [label]="row.label">{{ row.value }}</rt-money-row>
                                }
                                <rt-money-row total label="Итого">148 000 ₽</rt-money-row>
                            </rt-money-list>
                        </div>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtMoneyListComponent,
        RtMoneyRowComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtMoneyListMatrixComponent {
    public part: TMoneyListMatrixPart = 'total';

    public readonly rows: readonly { label: string; value: string }[] = [
        { label: 'Работы', value: '120 000 ₽' },
        { label: 'Материалы', value: '28 000 ₽' },
        { label: 'Доставка', value: '0 ₽' },
    ];

    public readonly totals: readonly string[] = ['без итога', 'с итогом', 'итог не равен сумме'];
    public readonly loadings: readonly boolean[] = [false, true];
    public readonly lengths: readonly number[] = [1, 3];
    public readonly edges: readonly string[] = ['пустой список', 'только итог', 'длинная подпись', 'пустая сумма'];

    public readonly loadingLabel: (value: boolean) => string = (value: boolean): string =>
        value ? 'загрузка — заглушка вместо суммы' : 'сумма на месте';
}
