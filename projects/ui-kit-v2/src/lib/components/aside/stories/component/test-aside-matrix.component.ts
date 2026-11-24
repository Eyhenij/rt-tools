import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtButtonDirective } from '../../../button/rt-button.directive';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtAsideSectionComponent } from '../../../aside-section/rt-aside-section.component';
import { RtAsideFooterComponent } from '../../footer/rt-aside-footer.component';
import { RtAsideHeaderComponent } from '../../header/rt-aside-header.component';
import { RtTabDirective } from '../../../tabs/rt-tab.directive';
import { RtTabsComponent } from '../../../tabs/rt-tabs.component';
import { RtAsideEmptyDirective } from '../../rt-aside-empty.directive';
import { RtAsideContentDirective } from '../../rt-aside-content.directive';
import { TRtAsideContentLayout, TRtAsideSize, RtAsideComponent } from '../../rt-aside.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TAsideMatrixPart = 'size' | 'width' | 'layout' | 'error' | 'pending' | 'empty' | 'properties' | 'presets' | 'themes';

/** Вид пустой панели: заглушка по умолчанию, со своими входами, свой шаблон, пустая вкладка. */
type TAsideEmptyKind = 'default' | 'inputs' | 'template' | 'tab';

interface IAsideEmptyCase {
    readonly name: string;
    readonly kind: TAsideEmptyKind;
}

/** Раскладка содержимого: с вкладками содержимое не прокручивается целиком, а отдаёт прокрутку внутрь. */
interface IAsideLayoutCase {
    readonly name: string;
    readonly layout: TRtAsideContentLayout;
}

/** Ручки вида: без них и с ними — подвал, отступы и высота строки заголовка меняются рядом. */
interface IAsidePropertiesCase {
    readonly name: string;
    readonly style: string;
}

/**
 * Матрицы состояний `rt-aside` для витрины.
 *
 * Панель поставлена **прямо в разметку**, а не открыта службой: в оверлей её уносит
 * `RtAsideService`, а сам компонент — обычная коробка и рисуется где угодно. Так размеры встают
 * рядом, а светло-тёмная пара ловит панель целиком.
 *
 * Чего этим не показать — выезд сбоку, подложку и двухтактное закрытие: их делает служба. Это
 * объявлено на странице-обзоре.
 *
 * Панель тянется на всю высоту родителя, поэтому у ячеек задана высота: иначе высота читалась бы
 * как свойство панели, а не ячейки.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-aside-matrix',
    template: `
        <div class="app-aside-matrix__room">
            @switch (part) {
                @case ('size') {
                    <app-story-presets caption="Размер в обоих наборах">
                        <ng-template>
                            <app-story-row [items]="sizes">
                                <ng-template let-size>
                                    <div class="app-aside-matrix__box">
                                        <rt-aside [size]="size" [ariaLabel]="'Панель ' + size">
                                            <rt-aside-header title="Тур в Сочи" overline="Заявка № 1024" />
                                            <ng-template rtAsideContent>
                                                <rt-aside-section heading="Клиент">Иванов Иван Иванович</rt-aside-section>
                                            </ng-template>
                                            <rt-aside-footer>
                                                <button
                                                    rtButton
                                                    asideDismiss
                                                    type="button"
                                                    theme="secondary"
                                                    appearance="text"
                                                    label="Закрыть"
                                                    aria-label="Закрыть"></button>
                                                <button
                                                    rtButton
                                                    asidePrimary
                                                    type="button"
                                                    label="Сохранить"
                                                    aria-label="Сохранить"></button>
                                            </rt-aside-footer>
                                        </rt-aside>
                                    </div>
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
                                    <div class="app-aside-matrix__box">
                                        <rt-aside size="md" ariaLabel="Панель своей ширины" [width]="width">
                                            <rt-aside-header title="Тур в Сочи" />
                                            <ng-template rtAsideContent>
                                                <rt-aside-section heading="Клиент">
                                                    Ширина задана входом и перекрывает размер.
                                                </rt-aside-section>
                                            </ng-template>
                                        </rt-aside>
                                    </div>
                                </ng-template>
                            </app-story-row>
                        </ng-template>
                    </app-story-presets>
                }

                @case ('layout') {
                    <app-story-presets caption="Раскладка содержимого в обоих наборах">
                        <ng-template>
                            <app-story-row [items]="layoutCases" [itemLabel]="caseLabel">
                                <ng-template let-layoutCase>
                                    <div class="app-aside-matrix__box">
                                        <rt-aside size="sm" [contentLayout]="layoutCase.layout" [ariaLabel]="layoutCase.name">
                                            <rt-aside-header title="Тур в Сочи" />
                                            <ng-template rtAsideContent>
                                                <rt-aside-section heading="Клиент">Иванов Иван Иванович</rt-aside-section>
                                                <rt-aside-section heading="Даты">12.05.2026 — 26.05.2026</rt-aside-section>
                                            </ng-template>
                                        </rt-aside>
                                    </div>
                                </ng-template>
                            </app-story-row>
                        </ng-template>
                    </app-story-presets>
                }

                @case ('error') {
                    <app-story-presets caption="Ошибка запроса в обеих темах в обоих наборах">
                        <ng-template>
                            <app-story-themes>
                                <ng-template>
                                    <div class="app-aside-matrix__box app-aside-matrix__box--tall">
                                        <rt-aside size="sm" ariaLabel="Карточка тура" [requestError]="requestError">
                                            <rt-aside-header title="Тур в Сочи" overline="Заявка № 1024" />
                                            <ng-template rtAsideContent>
                                                <rt-aside-section heading="Клиент">Иванов Иван Иванович</rt-aside-section>
                                            </ng-template>
                                            <rt-aside-footer>
                                                <button
                                                    rtButton
                                                    asideDismiss
                                                    type="button"
                                                    theme="secondary"
                                                    appearance="text"
                                                    label="Закрыть"
                                                    aria-label="Закрыть"></button>
                                                <button
                                                    rtButton
                                                    asidePrimary
                                                    type="button"
                                                    label="Сохранить"
                                                    aria-label="Сохранить"></button>
                                            </rt-aside-footer>
                                        </rt-aside>
                                    </div>
                                </ng-template>
                            </app-story-themes>
                        </ng-template>
                    </app-story-presets>
                }

                @case ('empty') {
                    <app-story-presets caption="Пустая панель и пустая вкладка в обоих наборах">
                        <ng-template>
                            <app-story-row [items]="emptyCases" [itemLabel]="caseLabel">
                                <ng-template let-emptyCase>
                                    <div class="app-aside-matrix__box app-aside-matrix__box--tall">
                                        @switch (emptyCase.kind) {
                                            @case ('default') {
                                                <rt-aside size="sm" ariaLabel="События" [empty]="true">
                                                    <rt-aside-header title="События" />
                                                    <!-- Пустая панель тела не строит: шаблон ниже не создаётся -->
                                                    <ng-template rtAsideContent>
                                                        <rt-aside-section heading="События">Список событий</rt-aside-section>
                                                    </ng-template>
                                                    <rt-aside-footer>
                                                        <button
                                                            rtButton
                                                            asideDismiss
                                                            type="button"
                                                            theme="secondary"
                                                            appearance="text"
                                                            label="Закрыть"
                                                            aria-label="Закрыть"
                                                            qa-dataid="aside-empty-close"></button>
                                                    </rt-aside-footer>
                                                </rt-aside>
                                            }
                                            @case ('inputs') {
                                                <rt-aside
                                                    size="sm"
                                                    ariaLabel="События"
                                                    emptyIcon="calendar"
                                                    emptyTitle="Событий пока нет"
                                                    emptyDescription="Они появятся после первой брони"
                                                    [empty]="true">
                                                    <rt-aside-header title="События" />
                                                    <!-- Пустая панель тела не строит: шаблон ниже не создаётся -->
                                                    <ng-template rtAsideContent>
                                                        <rt-aside-section heading="События">Список событий</rt-aside-section>
                                                    </ng-template>
                                                </rt-aside>
                                            }
                                            @case ('template') {
                                                <rt-aside size="sm" ariaLabel="События" [empty]="true">
                                                    <rt-aside-header title="События" />
                                                    <!-- Пустая панель тела не строит: шаблон ниже не создаётся -->
                                                    <ng-template rtAsideContent>
                                                        <rt-aside-section heading="События">Список событий</rt-aside-section>
                                                    </ng-template>
                                                    <ng-template rtAsideEmpty>
                                                        <rt-aside-section heading="Своя заглушка">
                                                            Приложение подставило свою разметку целиком.
                                                        </rt-aside-section>
                                                    </ng-template>
                                                </rt-aside>
                                            }
                                            @case ('tab') {
                                                <rt-aside size="sm" ariaLabel="Бронь" contentLayout="tabs">
                                                    <rt-aside-header title="Бронь № 1042" />
                                                    <ng-template rtAsideContent>
                                                        <rt-tabs activeId="events" [animationDuration]="0">
                                                            <ng-template rtTab="main" label="Общее">
                                                                <rt-aside-section heading="Клиент">Иванов Иван Иванович</rt-aside-section>
                                                            </ng-template>
                                                            <ng-template rtTab="events" label="События" [empty]="true" />
                                                        </rt-tabs>
                                                    </ng-template>
                                                </rt-aside>
                                            }
                                        }
                                    </div>
                                </ng-template>
                            </app-story-row>
                        </ng-template>
                    </app-story-presets>
                }

                @case ('pending') {
                    <app-story-presets caption="Панель в ожидании в обеих темах в обоих наборах">
                        <ng-template>
                            <app-story-themes>
                                <ng-template>
                                    <div class="app-aside-matrix__box">
                                        <rt-aside size="sm" ariaLabel="Карточка тура" [pending]="true">
                                            <rt-aside-header title="Тур в Сочи" overline="Заявка № 1024" />
                                            <ng-template rtAsideContent>
                                                <rt-aside-section heading="Клиент">Иванов Иван Иванович</rt-aside-section>
                                            </ng-template>
                                            <rt-aside-footer>
                                                <button
                                                    rtButton
                                                    asideDismiss
                                                    type="button"
                                                    theme="secondary"
                                                    appearance="text"
                                                    label="Закрыть"
                                                    aria-label="Закрыть"></button>
                                                <button
                                                    rtButton
                                                    asidePrimary
                                                    type="button"
                                                    label="Сохранить"
                                                    aria-label="Сохранить"></button>
                                            </rt-aside-footer>
                                        </rt-aside>
                                    </div>
                                </ng-template>
                            </app-story-themes>
                        </ng-template>
                    </app-story-presets>
                }

                @case ('properties') {
                    <app-story-presets caption="Ручки вида панели в обоих наборах">
                        <ng-template>
                            <app-story-row [items]="propertiesCases" [itemLabel]="caseLabel">
                                <ng-template let-propertiesCase>
                                    <div class="app-aside-matrix__box app-aside-matrix__box--tall" [attr.style]="propertiesCase.style">
                                        <rt-aside size="sm" [ariaLabel]="propertiesCase.name" [requestError]="requestError">
                                            <rt-aside-header title="Тур в Сочи" overline="Заявка № 1024" />
                                            <ng-template rtAsideContent>
                                                <rt-aside-section heading="Клиент">Иванов Иван Иванович</rt-aside-section>
                                            </ng-template>
                                            <rt-aside-footer>
                                                <button
                                                    rtButton
                                                    asideDismiss
                                                    type="button"
                                                    theme="secondary"
                                                    appearance="text"
                                                    label="Закрыть"
                                                    aria-label="Закрыть"></button>
                                                <button
                                                    rtButton
                                                    asidePrimary
                                                    type="button"
                                                    label="Сохранить"
                                                    aria-label="Сохранить"></button>
                                            </rt-aside-footer>
                                        </rt-aside>
                                    </div>
                                </ng-template>
                            </app-story-row>
                        </ng-template>
                    </app-story-presets>
                }

                @case ('presets') {
                    <app-story-presets caption="Панель в обоих наборах">
                        <ng-template>
                            <div class="app-aside-matrix__box">
                                <rt-aside size="sm" ariaLabel="Карточка тура">
                                    <rt-aside-header title="Тур в Сочи" overline="Заявка № 1024" />
                                    <ng-template rtAsideContent>
                                        <rt-aside-section heading="Клиент">Иванов Иван Иванович</rt-aside-section>
                                    </ng-template>
                                    <rt-aside-footer>
                                        <button
                                            rtButton
                                            asideDismiss
                                            type="button"
                                            theme="secondary"
                                            appearance="text"
                                            label="Закрыть"
                                            aria-label="Закрыть"></button>
                                        <button rtButton asidePrimary type="button" label="Сохранить" aria-label="Сохранить"></button>
                                    </rt-aside-footer>
                                </rt-aside>
                            </div>
                        </ng-template>
                    </app-story-presets>
                }

                @case ('themes') {
                    <app-story-presets caption="Панель в обеих темах в обоих наборах">
                        <ng-template>
                            <app-story-themes>
                                <ng-template>
                                    <div class="app-aside-matrix__box">
                                        <rt-aside size="sm" ariaLabel="Карточка тура">
                                            <rt-aside-header title="Тур в Сочи" overline="Заявка № 1024" />
                                            <ng-template rtAsideContent>
                                                <rt-aside-section heading="Клиент">Иванов Иван Иванович</rt-aside-section>
                                            </ng-template>
                                            <rt-aside-footer>
                                                <button
                                                    rtButton
                                                    asideDismiss
                                                    type="button"
                                                    theme="secondary"
                                                    appearance="text"
                                                    label="Закрыть"
                                                    aria-label="Закрыть"></button>
                                                <button
                                                    rtButton
                                                    asidePrimary
                                                    type="button"
                                                    label="Сохранить"
                                                    aria-label="Сохранить"></button>
                                            </rt-aside-footer>
                                        </rt-aside>
                                    </div>
                                </ng-template>
                            </app-story-themes>
                        </ng-template>
                    </app-story-presets>
                }
            }
        </div>
    `,
    styles: `
        /* Высота задаётся ящику вокруг панели, а не самой панели.

           Хост панели объявлен \`display: contents\` нарочно: рамка должна быть прямым ребёнком
           панели оверлея, и боксом хост не становится. Высота, заданная по классу блока, ложилась
           на хост и пропадала — он мерился 0 на 0 при объявленных 320 точках, а содержимое
           вываливалось в ячейку показа и резалось её краем. До рамки внутри хоста правило обёртки
           не достаёт вовсе: у рамки нет признака области действия обёртки.

           Ящик решает оба: он и есть блок-контейнер рамки, потому что хост между ними боксом не
           стоит, и рамка берёт от него свои 100% высоты. Ширина на всю ячейку нужна затем, что
           половина набора ужимает ребёнка без ширины по содержимому. */
        .app-aside-matrix__box {
            /* На узком экране панель встаёт во всё окно и вылезала за половину темы. Свойство
               наследуется до рамки внутри хоста, куда правило обёртки не достаёт, и держит
               панель в ширине ящика. */
            --rt-aside-narrow-width: 100%;

            inline-size: 100%;
            block-size: 20rem;
        }

        /* Блок ошибки забирает высоту у зоны содержимого: в ящике 20rem раздел «Клиент» срезался
           краем прокрутки. Ящик выше ровно на блок ошибки с его отступом. */
        .app-aside-matrix__box--tall {
            block-size: 24rem;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAsideComponent,
        RtAsideContentDirective,
        RtAsideEmptyDirective,
        RtAsideFooterComponent,
        RtAsideHeaderComponent,
        RtAsideSectionComponent,
        RtButtonDirective,
        RtTabDirective,
        RtTabsComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtAsideMatrixComponent {
    public part: TAsideMatrixPart = 'size';

    public readonly sizes: readonly TRtAsideSize[] = ['sm', 'md', 'lg'];

    /** Своя ширина: вход перекрывает размер, и рядом видно, что размер он и правда перекрывает. */
    public readonly widths: readonly string[] = ['260px', '420px'];

    /** Ошибка неудавшегося сохранения: её содержимое уходит только в копию, на экране его нет. */
    public readonly requestError: Readonly<Record<string, unknown>> = { status: 500, message: 'Internal Server Error' };

    /**
     * Ручки задаёт ящик, как приложение задало бы их с корня: свойства наследуются до рамки. Подвал
     * собирает кнопки в конце с широким промежутком, отступы и поля уже, у заголовка своя высота
     * строки, а блок ошибки отбит сверху и снизу.
     */
    public readonly propertiesCases: readonly IAsidePropertiesCase[] = [
        { name: 'без ручек', style: '' },
        {
            name: 'с ручками',
            style: [
                '--rt-aside-header-inset: 8px 16px',
                '--rt-aside-content-inset: 8px 16px',
                '--rt-aside-footer-inset: 8px 0 0',
                '--rt-aside-footer-margin: 8px 16px',
                '--rt-aside-footer-justify: flex-end',
                '--rt-aside-footer-gap: 24px',
                '--rt-aside-header-title-leading: 2',
                '--rt-aside-error-margin-block: 8px',
            ].join('; '),
        },
    ];

    public readonly emptyCases: readonly IAsideEmptyCase[] = [
        { name: 'по умолчанию', kind: 'default' },
        { name: 'свои значок и тексты', kind: 'inputs' },
        { name: 'свой шаблон', kind: 'template' },
        { name: 'пустая вкладка', kind: 'tab' },
    ];

    public readonly layoutCases: readonly IAsideLayoutCase[] = [
        { name: 'обычная', layout: 'default' },
        { name: 'под вкладки', layout: 'tabs' },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
