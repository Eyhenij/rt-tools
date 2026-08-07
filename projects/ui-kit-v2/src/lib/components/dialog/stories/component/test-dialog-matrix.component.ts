import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtButtonDirective } from '../../../button/rt-button.directive';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtDialogFooterComponent } from '../../footer/rt-dialog-footer.component';
import { RtDialogHeaderComponent } from '../../header/rt-dialog-header.component';
import { RtDialogComponent } from '../../rt-dialog.component';
import { IRtDialogSize } from '../../rt-dialog.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type DialogMatrixPart = 'size' | 'width' | 'parts' | 'themes';

/** Наполнение окна: шапка и подвал необязательны, и без них окно выглядит иначе. */
interface IDialogPartsCase {
    readonly name: string;
    readonly header: boolean;
    readonly footer: boolean;
}

/**
 * Матрицы состояний `rt-dialog` для витрины.
 *
 * Окно поставлено **прямо в разметку**, а не открыто службой: в оверлей его уносит
 * `RtDialogService`, а сам компонент — обычная коробка и рисуется где угодно. Так размеры
 * встают рядом, а светло-тёмная пара ловит окно целиком; под службой оно уехало бы в контейнер
 * оверлеев, за пределы блока истории.
 *
 * Чего этим не показать — подложку, блокировку прокрутки и ловушку фокуса: их ставит служба.
 * Это объявлено на странице-обзоре.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-dialog-matrix',
    template: `
        @switch (part) {
            @case ('size') {
                <app-story-row caption="Размер" [items]="sizes">
                    <ng-template let-size>
                        <rt-dialog [size]="size" [ariaLabel]="'Окно ' + size">
                            <rt-dialog-header title="Удалить запись?" />
                            <p class="app-dialog-matrix__text">Действие необратимо: запись исчезнет вместе с приложенными файлами.</p>
                            <rt-dialog-footer>
                                <button
                                    rtButton
                                    type="button"
                                    theme="secondary"
                                    appearance="text"
                                    label="Отмена"
                                    aria-label="Отмена"></button>
                                <button rtButton type="button" theme="danger" label="Удалить" aria-label="Удалить"></button>
                            </rt-dialog-footer>
                        </rt-dialog>
                    </ng-template>
                </app-story-row>
            }

            @case ('width') {
                <app-story-row caption="Своя ширина поверх размера" [items]="widths">
                    <ng-template let-width>
                        <rt-dialog size="md" ariaLabel="Окно своей ширины" [width]="width">
                            <rt-dialog-header title="Удалить запись?" />
                            <p class="app-dialog-matrix__text">Ширина задана входом и перекрывает размер.</p>
                        </rt-dialog>
                    </ng-template>
                </app-story-row>
            }

            @case ('parts') {
                <app-story-row caption="Наполнение окна" [items]="partsCases" [itemLabel]="caseLabel">
                    <ng-template let-partsCase>
                        <rt-dialog size="sm" [ariaLabel]="partsCase.name">
                            @if (partsCase.header) {
                                <rt-dialog-header title="Удалить запись?" />
                            }
                            <p class="app-dialog-matrix__text">Действие необратимо.</p>
                            @if (partsCase.footer) {
                                <rt-dialog-footer>
                                    <button
                                        rtButton
                                        type="button"
                                        theme="secondary"
                                        appearance="text"
                                        label="Отмена"
                                        aria-label="Отмена"></button>
                                    <button rtButton type="button" theme="danger" label="Удалить" aria-label="Удалить"></button>
                                </rt-dialog-footer>
                            }
                        </rt-dialog>
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Окно в обеих темах">
                    <ng-template>
                        <rt-dialog size="sm" ariaLabel="Удаление">
                            <rt-dialog-header title="Удалить запись?" />
                            <p class="app-dialog-matrix__text">Действие необратимо.</p>
                            <rt-dialog-footer>
                                <button
                                    rtButton
                                    type="button"
                                    theme="secondary"
                                    appearance="text"
                                    label="Отмена"
                                    aria-label="Отмена"></button>
                                <button rtButton type="button" theme="danger" label="Удалить" aria-label="Удалить"></button>
                            </rt-dialog-footer>
                        </rt-dialog>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    styles: `
        /* Текст окна — демонстрационное содержимое: своих отступов у проекции нет,
           и без них он прижимался к самой рамке, будто вылезал за неё. Отступ равен
           тому, что шапка и подвал берут от --rt-space-lg, — тогда три части окна
           стоят по одной вертикали. */
        .app-dialog-matrix__text {
            margin: 0;
            padding: 0 var(--rt-space-lg);
            color: var(--rt-color-text-primary);
            font-size: var(--rt-text-sm);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtButtonDirective,
        RtDialogComponent,
        RtDialogFooterComponent,
        RtDialogHeaderComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtDialogMatrixComponent {
    public part: DialogMatrixPart = 'size';

    public readonly sizes: readonly IRtDialogSize[] = ['sm', 'md', 'lg'];

    /** Своя ширина: вход перекрывает размер, и рядом видно, что размер он и правда перекрывает. */
    public readonly widths: readonly string[] = ['280px', '440px'];

    public readonly partsCases: readonly IDialogPartsCase[] = [
        { name: 'шапка и подвал', header: true, footer: true },
        { name: 'без подвала', header: true, footer: false },
        { name: 'без шапки', header: false, footer: true },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
