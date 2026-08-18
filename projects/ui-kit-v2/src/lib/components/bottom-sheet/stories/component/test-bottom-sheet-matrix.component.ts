import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtButtonDirective } from '../../../button/rt-button.directive';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtBottomSheetComponent } from '../../rt-bottom-sheet.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TBottomSheetMatrixPart = 'open' | 'content' | 'themes';

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
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-bottom-sheet-matrix',
    template: `
        @switch (part) {
            @case ('open') {
                <app-story-row caption="Открытость" slotWidth="18rem" [items]="opens" [itemLabel]="openLabel">
                    <ng-template let-value>
                        <div style="position: relative; height: 16rem; overflow: hidden; border: 1px dashed var(--rt-color-border-subtle)">
                            <rt-bottom-sheet [open]="value">
                                <span sheetHeader>Действия с договором</span>
                                <button rtButton label="Скачать" aria-label="Скачать" appearance="text"></button>
                                <button rtButton label="Отправить" aria-label="Отправить" appearance="text"></button>
                            </rt-bottom-sheet>
                        </div>
                    </ng-template>
                </app-story-row>
            }

            @case ('content') {
                <app-story-row caption="Чем наполнен" slotWidth="18rem" [items]="contents">
                    <ng-template let-content>
                        <div style="position: relative; height: 16rem; overflow: hidden; border: 1px dashed var(--rt-color-border-subtle)">
                            @switch (content) {
                                @case ('без шапки') {
                                    <rt-bottom-sheet open>
                                        <button rtButton label="Скачать" aria-label="Скачать" appearance="text"></button>
                                    </rt-bottom-sheet>
                                }
                                @case ('с шапкой') {
                                    <rt-bottom-sheet open>
                                        <span sheetHeader>Действия с договором</span>
                                        <button rtButton label="Скачать" aria-label="Скачать" appearance="text"></button>
                                    </rt-bottom-sheet>
                                }
                                @case ('длинное содержимое') {
                                    <rt-bottom-sheet open>
                                        <span sheetHeader>Действия с договором</span>
                                        @for (action of manyActions; track action) {
                                            <button rtButton appearance="text" [label]="action" [attr.aria-label]="action"></button>
                                        }
                                    </rt-bottom-sheet>
                                }
                                @case ('пусто') {
                                    <rt-bottom-sheet open />
                                }
                            }
                        </div>
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Лист в обеих темах">
                    <ng-template>
                        <div
                            style="position: relative; height: 16rem; width: 18rem; overflow: hidden; border: 1px dashed var(--rt-color-border-subtle)">
                            <rt-bottom-sheet open>
                                <span sheetHeader>Действия с договором</span>
                                <button rtButton label="Скачать" aria-label="Скачать" appearance="text"></button>
                            </rt-bottom-sheet>
                        </div>
                    </ng-template>
                </app-story-themes>
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
