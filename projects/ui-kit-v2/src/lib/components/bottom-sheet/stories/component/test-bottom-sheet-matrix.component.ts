import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { RtButtonDirective } from '../../../button/rt-button.directive';
import { RtIconButtonComponent } from '../../../icon-button/rt-icon-button.component';
import { RtToggleSwitchComponent } from '../../../toggle-switch/rt-toggle-switch.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtBottomSheetComponent } from '../../rt-bottom-sheet.component';
import { RtSheetFooterDirective } from '../../rt-sheet-footer.directive';
import { RtSheetMoreDirective } from '../../rt-sheet-more.directive';
import { RtSheetHeaderDirective } from '../../rt-sheet-header.directive';
import { OwnSheetStackDirective } from './own-sheet-stack.directive';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TBottomSheetMatrixPart = 'open' | 'content' | 'header' | 'footer' | 'presets' | 'themes';

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
 * Подвал показан на содержимом длиннее предела панели: тело прокручивается, а переключатель и две
 * кнопки стоят внизу. Предел панели задан свойством `--rt-bottom-sheet-max-height` ниже высоты
 * ящика: так в кадре видно, что панель упёрлась в предел приложения, а не во всю высоту ящика.
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
                                    rtStoryOwnSheetStack
                                    style="position: relative; contain: paint; inline-size: 100%; height: 16rem; border: 1px dashed var(--rt-color-border-subtle)">
                                    <rt-bottom-sheet [open]="value">
                                        <span sheetHeader>Действия с договором</span>
                                        <button type="button" rtButton label="Скачать" aria-label="Скачать" appearance="text"></button>
                                        <button type="button" rtButton label="Отправить" aria-label="Отправить" appearance="text"></button>
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
                                    rtStoryOwnSheetStack
                                    style="position: relative; contain: paint; inline-size: 100%; height: 16rem; border: 1px dashed var(--rt-color-border-subtle)">
                                    @switch (content) {
                                        @case ('без шапки') {
                                            <rt-bottom-sheet [open]="true">
                                                <button
                                                    type="button"
                                                    rtButton
                                                    label="Скачать"
                                                    aria-label="Скачать"
                                                    appearance="text"></button>
                                            </rt-bottom-sheet>
                                        }
                                        @case ('с шапкой') {
                                            <rt-bottom-sheet [open]="true">
                                                <span sheetHeader>Действия с договором</span>
                                                <button
                                                    type="button"
                                                    rtButton
                                                    label="Скачать"
                                                    aria-label="Скачать"
                                                    appearance="text"></button>
                                            </rt-bottom-sheet>
                                        }
                                        @case ('длинное содержимое') {
                                            <rt-bottom-sheet [open]="true">
                                                <span sheetHeader>Действия с договором</span>
                                                @for (action of manyActions; track action) {
                                                    <button
                                                        type="button"
                                                        rtButton
                                                        appearance="text"
                                                        [label]="action"
                                                        [attr.aria-label]="action"></button>
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

            @case ('header') {
                <app-story-presets caption="Шапка, высота и вопрос перед закрытием в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="23.4375rem" [items]="headers">
                            <ng-template let-header>
                                <div
                                    rtStoryOwnSheetStack
                                    style="position: relative; contain: paint; inline-size: 100%; height: 26rem; border: 1px dashed var(--rt-color-border-subtle)">
                                    @switch (header) {
                                        @case ('значок в шапке, действие в подвале') {
                                            <rt-bottom-sheet [open]="true">
                                                <span sheetHeader>Каналы связи</span>
                                                <rt-icon-button
                                                    sheetAction
                                                    variant="secondary"
                                                    radius="full"
                                                    icon="reset"
                                                    ariaLabel="Сбросить" />
                                                <button type="button" rtButton label="Почта" aria-label="Почта" appearance="text"></button>
                                                <button
                                                    type="button"
                                                    rtButton
                                                    label="Телефон"
                                                    aria-label="Телефон"
                                                    appearance="text"></button>
                                                <span sheetInfo>Выбрано: 2</span>
                                                <button
                                                    type="button"
                                                    sheetPrimary
                                                    rtButton
                                                    size="md"
                                                    label="Готово"
                                                    aria-label="Готово"></button>
                                            </rt-bottom-sheet>
                                        }
                                        @case ('во всю высоту') {
                                            <rt-bottom-sheet fullHeight [open]="true">
                                                <span sheetHeader>Отборы</span>
                                                <rt-icon-button
                                                    sheetAction
                                                    variant="secondary"
                                                    radius="full"
                                                    icon="reset"
                                                    ariaLabel="Сбросить" />
                                                <button
                                                    type="button"
                                                    rtButton
                                                    label="Статус"
                                                    aria-label="Статус"
                                                    appearance="text"></button>
                                                <button
                                                    type="button"
                                                    sheetPrimary
                                                    rtButton
                                                    size="md"
                                                    label="Применить"
                                                    aria-label="Применить"></button>
                                            </rt-bottom-sheet>
                                        }
                                        @case ('вопрос перед закрытием') {
                                            <rt-bottom-sheet fullHeight unsaved data-story-ask [open]="true">
                                                <span sheetHeader>Отборы</span>
                                                <rt-icon-button
                                                    sheetAction
                                                    variant="secondary"
                                                    radius="full"
                                                    icon="reset"
                                                    ariaLabel="Сбросить" />
                                                <button
                                                    type="button"
                                                    rtButton
                                                    label="Статус"
                                                    aria-label="Статус"
                                                    appearance="text"></button>
                                                <button
                                                    type="button"
                                                    sheetPrimary
                                                    rtButton
                                                    size="md"
                                                    label="Применить"
                                                    aria-label="Применить"></button>
                                            </rt-bottom-sheet>
                                        }
                                        @case ('свои шапка и подвал') {
                                            <rt-bottom-sheet [open]="true">
                                                <ng-template rtSheetHeader let-close>
                                                    <button
                                                        type="button"
                                                        rtButton
                                                        size="sm"
                                                        appearance="text"
                                                        label="Назад"
                                                        aria-label="Назад"
                                                        (click)="close()"></button>
                                                    <strong style="flex: 1 1 auto; text-align: center">Свой заголовок</strong>
                                                    <rt-icon-button variant="secondary" radius="full" icon="reset" ariaLabel="Сбросить" />
                                                </ng-template>
                                                <button
                                                    type="button"
                                                    rtButton
                                                    label="Статус"
                                                    aria-label="Статус"
                                                    appearance="text"></button>
                                                <ng-template rtSheetFooter let-close>
                                                    <button
                                                        type="button"
                                                        rtButton
                                                        label="Показать 12"
                                                        aria-label="Показать 12"
                                                        style="flex: 1 1 auto"
                                                        (click)="close()"></button>
                                                </ng-template>
                                            </rt-bottom-sheet>
                                        }
                                    }
                                </div>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('footer') {
                <app-story-presets caption="Подвал под длинным содержимым в обоих наборах">
                    <ng-template>
                        <div
                            rtStoryOwnSheetStack
                            style="position: relative; contain: paint; height: 32rem; width: 28rem; border: 1px dashed var(--rt-color-border-subtle); --rt-bottom-sheet-max-height: 28rem">
                            <rt-bottom-sheet [open]="true">
                                <span sheetHeader>Фильтры</span>
                                @for (action of longActions; track action) {
                                    <button type="button" rtButton appearance="text" [label]="action" [attr.aria-label]="action"></button>
                                }
                                <rt-icon-button sheetAction variant="secondary" radius="full" icon="reset" ariaLabel="Сбросить" />
                                <span sheetInfo>Найдено: 12</span>
                                <!-- Дополнительное — за «⋮» в шапке: второй экран той же шторки. -->
                                <ng-template rtSheetMore>
                                    <div style="padding: var(--rt-space-5) var(--rt-space-5) var(--rt-space-2)">
                                        <rt-toggle-switch label="Свободные" size="md" [formControl]="onlyFree" />
                                    </div>
                                </ng-template>
                                <button type="button" sheetPrimary rtButton size="md" label="Применить" aria-label="Применить"></button>
                            </rt-bottom-sheet>
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Лист в обоих наборах">
                    <ng-template>
                        <div
                            rtStoryOwnSheetStack
                            style="position: relative; contain: paint; height: 16rem; width: 18rem; border: 1px dashed var(--rt-color-border-subtle)">
                            <rt-bottom-sheet [open]="true">
                                <span sheetHeader>Действия с договором</span>
                                <button type="button" rtButton label="Скачать" aria-label="Скачать" appearance="text"></button>
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
                                    rtStoryOwnSheetStack
                                    style="position: relative; contain: paint; height: 16rem; width: 18rem; border: 1px dashed var(--rt-color-border-subtle)">
                                    <rt-bottom-sheet [open]="true">
                                        <span sheetHeader>Действия с договором</span>
                                        <button type="button" rtButton label="Скачать" aria-label="Скачать" appearance="text"></button>
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
        RtIconButtonComponent,
        RtSheetFooterDirective,
        RtSheetMoreDirective,
        RtSheetHeaderDirective,

        // directives
        RtButtonDirective,
        OwnSheetStackDirective,

        // forms
        ReactiveFormsModule,
        RtToggleSwitchComponent,

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
    /**
     * Значок сброса в шапке и главное действие в подвале на всю ширину со справкой над ним, шторка во всю
     * высоту ящика, вопрос, который история открывает нажатием «×», и шторка со своими шаблонами шапки
     * и подвала.
     */
    public readonly headers: readonly string[] = [
        'значок в шапке, действие в подвале',
        'во всю высоту',
        'вопрос перед закрытием',
        'свои шапка и подвал',
    ];

    public readonly manyActions: readonly string[] = ['Скачать', 'Отправить', 'Переименовать', 'Дублировать', 'Архивировать', 'Удалить'];

    public readonly longActions: readonly string[] = Array.from(
        { length: 16 },
        (_: unknown, index: number): string => `Пункт ${index + 1}`
    );

    public readonly onlyFree: FormControl<boolean> = new FormControl<boolean>(true, { nonNullable: true });

    public readonly openLabel: (value: boolean) => string = (value: boolean): string => (value ? 'открыт' : 'закрыт — остаётся в разметке');
}
