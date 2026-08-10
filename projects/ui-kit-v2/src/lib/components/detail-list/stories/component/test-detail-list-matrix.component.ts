import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtDetailListComponent } from '../../rt-detail-list.component';
import { RtDetailRowComponent } from '../../rt-detail-row.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type DetailListMatrixPart = 'loading' | 'value' | 'length' | 'edges' | 'themes';

/**
 * Матрицы состояний `rt-detail-list` и `rt-detail-row` для витрины.
 *
 * Список своих входов не имеет вовсе — он только раскладывает строки, — а у строки их два:
 * подпись и признак загрузки. Показывать надо не перечисление, а то, чем строка наполнена:
 * значение приходит проекцией, и длинное значение ведёт себя иначе короткого.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-detail-list-matrix',
    template: `
        @switch (part) {
            @case ('loading') {
                <app-story-row caption="Загрузка значения" slotWidth="20rem" [items]="loadings" [itemLabel]="loadingLabel">
                    <ng-template let-value>
                        <rt-detail-list>
                            <rt-detail-row label="Договор" [loading]="value">№2024-118</rt-detail-row>
                            <rt-detail-row label="Подписан" [loading]="value">14 марта 2024</rt-detail-row>
                        </rt-detail-list>
                    </ng-template>
                </app-story-row>
            }

            @case ('value') {
                <app-story-row caption="Чем наполнено значение" slotWidth="20rem" [items]="values">
                    <ng-template let-value>
                        @switch (value) {
                            @case ('текст') {
                                <rt-detail-list>
                                    <rt-detail-row label="Договор">№2024-118</rt-detail-row>
                                </rt-detail-list>
                            }
                            @case ('длинный текст') {
                                <rt-detail-list>
                                    <rt-detail-row label="Основание">
                                        Дополнительное соглашение №4 к договору от 14 марта 2024 года
                                    </rt-detail-row>
                                </rt-detail-list>
                            }
                            @case ('разметка') {
                                <rt-detail-list>
                                    <rt-detail-row label="Ссылка">
                                        <a href="#">Открыть документ</a>
                                    </rt-detail-row>
                                </rt-detail-list>
                            }
                            @case ('пусто') {
                                <rt-detail-list>
                                    <rt-detail-row label="Комментарий" />
                                </rt-detail-list>
                            }
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('length') {
                <app-story-row caption="Длина списка" slotWidth="20rem" [items]="lengths">
                    <ng-template let-count>
                        <rt-detail-list>
                            @for (row of rows.slice(0, count); track row.label) {
                                <rt-detail-row [label]="row.label">{{ row.value }}</rt-detail-row>
                            }
                        </rt-detail-list>
                    </ng-template>
                </app-story-row>
            }

            @case ('edges') {
                <app-story-row caption="Края" slotWidth="20rem" [items]="edges">
                    <ng-template let-edge>
                        @switch (edge) {
                            @case ('пустой список') {
                                <rt-detail-list />
                            }
                            @case ('длинная подпись') {
                                <rt-detail-list>
                                    <rt-detail-row label="Ответственный за подключение">Иванов И. И.</rt-detail-row>
                                </rt-detail-list>
                            }
                            @case ('загрузка одной строки') {
                                <rt-detail-list>
                                    <rt-detail-row label="Договор">№2024-118</rt-detail-row>
                                    <rt-detail-row loading label="Сумма">—</rt-detail-row>
                                </rt-detail-list>
                            }
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Список в обеих темах">
                    <ng-template>
                        <div style="width: 20rem">
                            <rt-detail-list>
                                @for (row of rows; track row.label) {
                                    <rt-detail-row [label]="row.label">{{ row.value }}</rt-detail-row>
                                }
                            </rt-detail-list>
                        </div>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtDetailListComponent,
        RtDetailRowComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtDetailListMatrixComponent {
    public part: DetailListMatrixPart = 'loading';

    public readonly rows: readonly { label: string; value: string }[] = [
        { label: 'Договор', value: '№2024-118' },
        { label: 'Подписан', value: '14 марта 2024' },
        { label: 'Действует до', value: '14 марта 2027' },
        { label: 'Сумма', value: '148 000 ₽' },
    ];

    public readonly loadings: readonly boolean[] = [false, true];
    public readonly values: readonly string[] = ['текст', 'длинный текст', 'разметка', 'пусто'];
    public readonly lengths: readonly number[] = [1, 2, 4];
    public readonly edges: readonly string[] = ['пустой список', 'длинная подпись', 'загрузка одной строки'];

    public readonly loadingLabel: (value: boolean) => string = (value: boolean): string =>
        value ? 'загрузка — скелет вместо значения' : 'значение на месте';
}
