import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtButtonDirective } from '../../../button/rt-button.directive';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtToolbarCenterDirective, RtToolbarComponent, RtToolbarLeftDirective, RtToolbarRightDirective } from '../../rt-toolbar.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type ToolbarMatrixPart = 'slots' | 'fill' | 'dense' | 'themes';

/**
 * Матрицы состояний `rt-toolbar` для витрины.
 *
 * Входов у панели нет вовсе — её вид решают объявленные слоты, — поэтому ось здесь одна:
 * какие из трёх слотов заданы. Показывать её надо всеми сочетаниями сразу: **без единого слота
 * панель не рисуется вовсе**, ни одного узла в разметке, и отличить это от пустой полосы можно
 * только рядом с полосой, у которой слот есть.
 *
 * Порог ширины панель объявляет сама (768 px), поэтому у историй есть второй кадр — на нём
 * слоты перестраиваются в столбец. Вход `dense` это перестроение отменяет, и увидеть его можно
 * только на узком кадре: в широком обе панели выглядят одинаково.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-toolbar-matrix',
    template: `
        @switch (part) {
            @case ('slots') {
                <app-story-row caption="Какие слоты заданы" [items]="slotCases">
                    <ng-template let-slot>
                        @switch (slot) {
                            @case ('ни одного — панели нет') {
                                <rt-toolbar />
                            }
                            @case ('только левый') {
                                <rt-toolbar>
                                    <ng-template rtToolbarLeft>
                                        <button rtButton label="Назад" aria-label="Назад" appearance="text"></button>
                                    </ng-template>
                                </rt-toolbar>
                            }
                            @case ('левый и правый') {
                                <rt-toolbar>
                                    <ng-template rtToolbarLeft>
                                        <button rtButton label="Назад" aria-label="Назад" appearance="text"></button>
                                    </ng-template>
                                    <ng-template rtToolbarRight>
                                        <button rtButton label="Сохранить" aria-label="Сохранить"></button>
                                    </ng-template>
                                </rt-toolbar>
                            }
                            @case ('все три') {
                                <rt-toolbar>
                                    <ng-template rtToolbarLeft>
                                        <button rtButton label="Назад" aria-label="Назад" appearance="text"></button>
                                    </ng-template>
                                    <ng-template rtToolbarCenter>
                                        <span>Договор №2024-118</span>
                                    </ng-template>
                                    <ng-template rtToolbarRight>
                                        <button rtButton label="Сохранить" aria-label="Сохранить"></button>
                                    </ng-template>
                                </rt-toolbar>
                            }
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('fill') {
                <app-story-row caption="Чем наполнены слоты" [items]="fillCases">
                    <ng-template let-fill>
                        @switch (fill) {
                            @case ('по кнопке') {
                                <rt-toolbar>
                                    <ng-template rtToolbarLeft>
                                        <button rtButton label="Назад" aria-label="Назад" appearance="text"></button>
                                    </ng-template>
                                    <ng-template rtToolbarRight>
                                        <button rtButton label="Сохранить" aria-label="Сохранить"></button>
                                    </ng-template>
                                </rt-toolbar>
                            }
                            @case ('несколько кнопок') {
                                <rt-toolbar>
                                    <ng-template rtToolbarLeft>
                                        <button rtButton label="Назад" aria-label="Назад" appearance="text"></button>
                                    </ng-template>
                                    <ng-template rtToolbarRight>
                                        <button rtButton label="Отменить" aria-label="Отменить" appearance="outlined"></button>
                                        <button rtButton label="Сохранить" aria-label="Сохранить"></button>
                                        <button rtButton label="Удалить" aria-label="Удалить" theme="danger"></button>
                                    </ng-template>
                                </rt-toolbar>
                            }
                            @case ('длинный текст в центре') {
                                <rt-toolbar>
                                    <ng-template rtToolbarLeft>
                                        <button rtButton label="Назад" aria-label="Назад" appearance="text"></button>
                                    </ng-template>
                                    <ng-template rtToolbarCenter>
                                        <span>Дополнительное соглашение №4 к договору от 14 марта 2024 года</span>
                                    </ng-template>
                                    <ng-template rtToolbarRight>
                                        <button rtButton label="Сохранить" aria-label="Сохранить"></button>
                                    </ng-template>
                                </rt-toolbar>
                            }
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('dense') {
                <app-story-row caption="Плотная панель — видно только на узком кадре" [items]="denseCases" [itemLabel]="denseLabel">
                    <ng-template let-value>
                        <rt-toolbar [dense]="value">
                            <ng-template rtToolbarLeft>
                                <button rtButton label="Назад" aria-label="Назад" appearance="text"></button>
                            </ng-template>
                            <ng-template rtToolbarCenter>
                                <span>Договор №2024-118</span>
                            </ng-template>
                            <ng-template rtToolbarRight>
                                <button rtButton label="Сохранить" aria-label="Сохранить"></button>
                            </ng-template>
                        </rt-toolbar>
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Панель в обеих темах">
                    <ng-template>
                        <rt-toolbar>
                            <ng-template rtToolbarLeft>
                                <button rtButton label="Назад" aria-label="Назад" appearance="text"></button>
                            </ng-template>
                            <ng-template rtToolbarCenter>
                                <span>Договор №2024-118</span>
                            </ng-template>
                            <ng-template rtToolbarRight>
                                <button rtButton label="Сохранить" aria-label="Сохранить"></button>
                            </ng-template>
                        </rt-toolbar>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtToolbarComponent,

        // directives
        RtButtonDirective,
        RtToolbarCenterDirective,
        RtToolbarLeftDirective,
        RtToolbarRightDirective,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtToolbarMatrixComponent {
    public part: ToolbarMatrixPart = 'slots';

    public readonly slotCases: readonly string[] = ['ни одного — панели нет', 'только левый', 'левый и правый', 'все три'];
    public readonly fillCases: readonly string[] = ['по кнопке', 'несколько кнопок', 'длинный текст в центре'];

    /** `dense` держит три зоны в строку и на узком экране: узкой шапке колонка неверна. */
    public readonly denseCases: readonly boolean[] = [false, true];

    public readonly denseLabel: (value: boolean) => string = (value: boolean): string =>
        value ? 'dense — остаётся строкой' : 'обычная — стекается в колонку';
}
