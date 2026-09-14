import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtButtonDirective } from '../../../button/rt-button.directive';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtBottomSheetComponent } from '../../rt-bottom-sheet.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TBottomSheetMatrixPart = 'open' | 'content' | 'presets' | 'themes';

/**
 * Матрицы состояний `rt-bottom-sheet` для витрины.
 *
 * Вход у листа один и двоичный — открыт он или нет, — но показать надо обе стороны: **закрытый
 * лист остаётся в разметке**, прячут его стили, а не условие. Ячейка закрытого поэтому не
 * пустая: в ней стоит тот же лист, просто уведённый вниз.
 *
 * Лист занимает всю ширину и высоту показа, поэтому каждая ячейка — своя область с
 * `position: relative`: иначе панели легли бы поверх страницы и накрыли подписи соседей.
 *
 * Одного `position: relative` области мало. Лист прибит к окну — `position: fixed`, — и такому
 * потомку относительное положение предка не указ: он считает своё место от окна. Ящик становится
 * ему блоком-контейнером свойством `contain: paint`, и оно же режет по ящику — прежнее
 * `overflow: hidden` в нём больше не нужно. Сдвиг слоя и светофильтр дают то же самое, но поднимают
 * узел в отдельный слой отрисовки, а это меняет растеризацию подписей.
 *
 * Своя ширина ящику нужна затем, что ячейка ряда объявлена гибкой строкой: ящик без ширины
 * ужимается по содержимому, а содержимого в нём нет — лист ушёл к окну. Ящик мерился двумя точками
 * при ячейке в 288, и в кадре от него оставалась одна пунктирная линия.
 *
 * Открытость задаётся привязкой `[open]="true"`, а не голым атрибутом: вход листа объявлен
 * логическим и строку в истину не превращает. Голый атрибут даёт ему пустую строку, и лист
 * остаётся закрытым — разметка при этом выглядит верной.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-bottom-sheet-matrix',
    template: `
        @switch (part) {
            @case ('open') {
                <app-story-presets caption="Открытость в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="18rem" [items]="opens" [itemLabel]="openLabel">
                            <ng-template let-value>
                                <div
                                    style="position: relative; contain: paint; inline-size: 100%; height: 16rem; border: 1px dashed var(--rt-color-border-subtle)">
                                    <rt-bottom-sheet [open]="value">
                                        <span sheetHeader>Действия с договором</span>
                                        <button rtButton label="Скачать" aria-label="Скачать" appearance="text"></button>
                                        <button rtButton label="Отправить" aria-label="Отправить" appearance="text"></button>
                                    </rt-bottom-sheet>
                                </div>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('content') {
                <app-story-presets caption="Чем наполнен в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="18rem" [items]="contents">
                            <ng-template let-content>
                                <div
                                    style="position: relative; contain: paint; inline-size: 100%; height: 16rem; border: 1px dashed var(--rt-color-border-subtle)">
                                    @switch (content) {
                                        @case ('без шапки') {
                                            <rt-bottom-sheet [open]="true">
                                                <button rtButton label="Скачать" aria-label="Скачать" appearance="text"></button>
                                            </rt-bottom-sheet>
                                        }
                                        @case ('с шапкой') {
                                            <rt-bottom-sheet [open]="true">
                                                <span sheetHeader>Действия с договором</span>
                                                <button rtButton label="Скачать" aria-label="Скачать" appearance="text"></button>
                                            </rt-bottom-sheet>
                                        }
                                        @case ('длинное содержимое') {
                                            <rt-bottom-sheet [open]="true">
                                                <span sheetHeader>Действия с договором</span>
                                                @for (action of manyActions; track action) {
                                                    <button rtButton appearance="text" [label]="action" [attr.aria-label]="action"></button>
                                                }
                                            </rt-bottom-sheet>
                                        }
                                        @case ('пусто') {
                                            <rt-bottom-sheet [open]="true" />
                                        }
                                    }
                                </div>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Лист в обоих наборах">
                    <ng-template>
                        <div
                            style="position: relative; contain: paint; height: 16rem; width: 18rem; border: 1px dashed var(--rt-color-border-subtle)">
                            <rt-bottom-sheet [open]="true">
                                <span sheetHeader>Действия с договором</span>
                                <button rtButton label="Скачать" aria-label="Скачать" appearance="text"></button>
                            </rt-bottom-sheet>
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Лист в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <div
                                    style="position: relative; contain: paint; height: 16rem; width: 18rem; border: 1px dashed var(--rt-color-border-subtle)">
                                    <rt-bottom-sheet [open]="true">
                                        <span sheetHeader>Действия с договором</span>
                                        <button rtButton label="Скачать" aria-label="Скачать" appearance="text"></button>
                                    </rt-bottom-sheet>
                                </div>
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
        RtBottomSheetComponent,

        // directives
        RtButtonDirective,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtBottomSheetMatrixComponent {
    public part: TBottomSheetMatrixPart = 'open';

    public readonly opens: readonly boolean[] = [false, true];
    public readonly contents: readonly string[] = ['без шапки', 'с шапкой', 'длинное содержимое', 'пусто'];

    public readonly manyActions: readonly string[] = ['Скачать', 'Отправить', 'Переименовать', 'Дублировать', 'Архивировать', 'Удалить'];

    public readonly openLabel: (value: boolean) => string = (value: boolean): string => (value ? 'открыт' : 'закрыт — остаётся в разметке');
}
