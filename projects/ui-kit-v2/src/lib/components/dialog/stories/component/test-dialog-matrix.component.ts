import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtButtonDirective } from '../../../button/rt-button.directive';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtIconComponent } from '../../../icon/rt-icon.component';
import { RtDialogContentComponent } from '../../content/rt-dialog-content.component';
import { RtDialogFooterComponent } from '../../footer/rt-dialog-footer.component';
import { RtDialogHeaderComponent } from '../../header/rt-dialog-header.component';
import { RtDialogComponent } from '../../rt-dialog.component';
import { TRtDialogSize } from '../../rt-dialog.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TDialogMatrixPart = 'size' | 'width' | 'parts' | 'content' | 'properties' | 'presets' | 'themes';

/** Абзац демонстрационного тела: длинного хватает, чтобы тело под потолком прокручивалось. */
const CONTRACT_TEXT: string =
    'Стороны договорились, что исполнитель выполняет работы в срок, а заказчик принимает их по акту и оплачивает в течение десяти дней.';

/** Тело окна: короткое и длинное под потолком высоты. */
interface IDialogContentCase {
    readonly name: string;
    readonly style: Readonly<Record<string, string>>;
    readonly paragraphs: readonly string[];
}

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
                <app-story-presets caption="Размер в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="sizes">
                            <ng-template let-size>
                                <rt-dialog [size]="size" [ariaLabel]="'Окно ' + size">
                                    <rt-dialog-header title="Удалить запись?" />
                                    <p class="app-dialog-matrix__text">
                                        Действие необратимо: запись исчезнет вместе с приложенными файлами.
                                    </p>
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
                    </ng-template>
                </app-story-presets>
            }

            @case ('width') {
                <app-story-presets caption="Своя ширина поверх размера в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="widths">
                            <ng-template let-width>
                                <rt-dialog size="md" ariaLabel="Окно своей ширины" [width]="width">
                                    <rt-dialog-header title="Удалить запись?" />
                                    <p class="app-dialog-matrix__text">Ширина задана входом и перекрывает размер.</p>
                                </rt-dialog>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('parts') {
                <app-story-presets caption="Наполнение окна в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="partsCases" [itemLabel]="caseLabel">
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
                    </ng-template>
                </app-story-presets>
            }

            @case ('content') {
                <app-story-presets caption="Тело окна в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="contentCases" [itemLabel]="caseLabel">
                            <ng-template let-contentCase>
                                <rt-dialog size="sm" [ariaLabel]="contentCase.name" [style]="contentCase.style">
                                    <rt-dialog-header title="Условия договора" />
                                    <rt-dialog-content>
                                        @for (paragraph of contentCase.paragraphs; track $index) {
                                            <p class="app-dialog-matrix__paragraph">{{ paragraph }}</p>
                                        }
                                    </rt-dialog-content>
                                    <rt-dialog-footer>
                                        <button rtButton type="button" theme="primary" label="Принять" aria-label="Принять"></button>
                                    </rt-dialog-footer>
                                </rt-dialog>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            <!-- Свойства задаёт приложение на корне страницы; здесь их несёт тег окна — до рамки и
                 её частей они доходят тем же наследованием. Пары наборов нет: свойства приложения
                 одинаковы в обоих. -->
            @case ('properties') {
                <app-story-row [items]="propertiesCases" [itemLabel]="caseLabel">
                    <ng-template>
                        <rt-dialog size="sm" ariaLabel="Свойства окна" [style]="propertiesStyle">
                            <rt-dialog-header title="Удалить запись?">
                                <rt-icon rtDialogHeaderLead size="md" color="danger" name="exclamation-circle" />
                            </rt-dialog-header>
                            <rt-dialog-content>
                                <p class="app-dialog-matrix__paragraph">Действие необратимо: запись исчезнет вместе с файлами.</p>
                            </rt-dialog-content>
                            <rt-dialog-footer align="between">
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

            @case ('presets') {
                <app-story-presets caption="Окно в обоих наборах">
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
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Окно в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
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
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
    styles: `
        /* Текст окна — демонстрационное содержимое: своих отступов у проекции нет,
           и без них он прижимался к самой рамке, будто вылезал за неё. Отступ равен
           тому, что шапка и подвал берут от --rt-space-lg, — тогда три части окна
           стоят по одной вертикали. */
        .app-dialog-matrix__paragraph {
            margin: 0 0 var(--rt-space-sm);
            color: var(--rt-color-text-primary);
            font-size: var(--rt-text-sm);
        }

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
        RtDialogContentComponent,
        RtDialogFooterComponent,
        RtDialogHeaderComponent,
        RtIconComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtDialogMatrixComponent {
    public part: TDialogMatrixPart = 'size';

    public readonly sizes: readonly TRtDialogSize[] = ['sm', 'md', 'lg'];

    /** Своя ширина: вход перекрывает размер, и рядом видно, что размер он и правда перекрывает. */
    public readonly widths: readonly string[] = ['280px', '440px'];

    public readonly partsCases: readonly IDialogPartsCase[] = [
        { name: 'шапка и подвал', header: true, footer: true },
        { name: 'без подвала', header: true, footer: false },
        { name: 'без шапки', header: false, footer: true },
    ];

    /** Короткое тело и длинное под потолком высоты: длинное прокручивается между шапкой и подвалом. */
    public readonly contentCases: readonly IDialogContentCase[] = [
        { name: 'короткое тело', style: {}, paragraphs: [CONTRACT_TEXT] },
        {
            name: 'длинное под потолком',
            style: { '--rt-dialog-content-max-height': 'var(--rt-size-30)' },
            paragraphs: [CONTRACT_TEXT, CONTRACT_TEXT, CONTRACT_TEXT, CONTRACT_TEXT],
        },
    ];

    /** Один случай: ряд нужен ради корня показа и подписи. */
    public readonly propertiesCases: readonly { readonly name: string }[] = [{ name: 'свойства приложения' }];

    /** Свойства вида окна — то, что приложение задаёт на корне страницы под материальный вид. */
    public readonly propertiesStyle: Readonly<Record<string, string>> = {
        '--rt-dialog-bg': 'var(--rt-color-bg-surface-subtle)',
        '--rt-dialog-border': 'var(--rt-border-width-thin) solid var(--rt-color-border-strong)',
        '--rt-dialog-header-padding': 'var(--rt-space-md) var(--rt-space-lg)',
        '--rt-dialog-header-border': 'none',
        '--rt-dialog-title-font-size': 'var(--rt-text-md)',
        '--rt-dialog-title-weight': 'var(--rt-font-weight-medium)',
        '--rt-dialog-title-transform': 'uppercase',
        '--rt-dialog-content-padding': 'var(--rt-space-sm) var(--rt-space-lg)',
        '--rt-dialog-footer-padding': 'var(--rt-space-md) var(--rt-space-lg)',
        '--rt-dialog-footer-border': 'none',
    };

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
