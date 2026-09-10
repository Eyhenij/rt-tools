import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../../showcase/story-themes.component';
import { RtButtonDirective } from '../../../../button/rt-button.directive';
import { RtDialogFooterComponent } from '../../rt-dialog-footer.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TDialogFooterMatrixPart = 'content' | 'presets' | 'themes';

/** Набор проецируемого содержимого: своих входов у футера нет. */
interface IDialogFooterContentCase {
    readonly name: string;
    readonly note: string | null;
    readonly cancel: boolean;
    readonly confirm: boolean;
}

/**
 * Матрицы `rt-dialog-footer` для витрины.
 *
 * У футера окна нет ни одного входа, и в отличие от футера панели он принимает любое
 * содержимое без атрибутов. Весь его вид — верхняя граница и прижатие к правому краю, поэтому
 * матрица перебирает наборы проецируемого содержимого.
 *
 * Ширина ячейки задана: футер занимает всю ширину окна, и по содержимому он бы схлопнулся —
 * прижатие к правому краю в такой ячейке не видно вовсе.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-dialog-footer-matrix',
    template: `
        @switch (part) {
            @case ('content') {
                <app-story-row caption="Содержимое футера" [items]="contentCases" [itemLabel]="caseLabel" [slotWidth]="footerWidth">
                    <ng-template let-contentCase>
                        <rt-dialog-footer class="app-dialog-footer-matrix__footer">
                            @if (contentCase.note !== null) {
                                <span class="app-dialog-footer-matrix__note">{{ contentCase.note }}</span>
                            }
                            @if (contentCase.cancel) {
                                <button rtButton appearance="text">Отмена</button>
                            }
                            @if (contentCase.confirm) {
                                <button rtButton theme="primary">Сохранить</button>
                            }
                        </rt-dialog-footer>
                    </ng-template>
                </app-story-row>
            }

            @case ('presets') {
                <app-story-presets caption="Футер окна в обоих наборах оформления">
                    <ng-template>
                        <rt-dialog-footer class="app-dialog-footer-matrix__footer">
                            <button rtButton appearance="text">Отмена</button>
                            <button rtButton theme="primary">Сохранить</button>
                        </rt-dialog-footer>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-themes caption="Футер окна в обеих темах">
                    <ng-template>
                        <rt-dialog-footer class="app-dialog-footer-matrix__footer">
                            <button rtButton appearance="text">Отмена</button>
                            <button rtButton theme="primary">Сохранить</button>
                        </rt-dialog-footer>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    styles: `
        /* Ячейка ряда центрирует содержимое, а раскладка футера — «к правому краю»: взятый по
           начинке, он показал бы не прижатие, а его отсутствие. */
        .app-dialog-footer-matrix__footer {
            width: 100%;
        }

        /* Статусная строка слева от кнопок: в футер кладут не только кнопки. */
        .app-dialog-footer-matrix__note {
            margin-right: auto;
            align-self: center;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtButtonDirective,
        RtDialogFooterComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtDialogFooterMatrixComponent {
    public part: TDialogFooterMatrixPart = 'content';

    /** Ширина ячейки: футер занимает всю ширину окна и по содержимому схлопнулся бы. */
    public readonly footerWidth: string = '24rem';

    public readonly contentCases: readonly IDialogFooterContentCase[] = [
        { name: 'одна кнопка', note: null, cancel: false, confirm: true },
        { name: 'отмена и подтверждение', note: null, cancel: true, confirm: true },
        { name: 'со статусной строкой', note: 'Черновик сохранён', cancel: true, confirm: true },
        { name: 'пустой', note: null, cancel: false, confirm: false },
    ];

    public readonly caseLabel: (value: IDialogFooterContentCase) => string = (value: IDialogFooterContentCase): string => value.name;
}
