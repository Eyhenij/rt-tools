import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtButtonDirective } from '../../../button/rt-button.directive';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtAsideSectionComponent } from '../../../aside-section/rt-aside-section.component';
import { RtAsideFooterComponent } from '../../footer/rt-aside-footer.component';
import { RtAsideHeaderComponent } from '../../header/rt-aside-header.component';
import { TRtAsideContentLayout, TRtAsideSize, RtAsideComponent } from '../../rt-aside.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TAsideMatrixPart = 'size' | 'width' | 'layout' | 'presets' | 'themes';

/** Раскладка содержимого: с вкладками содержимое не прокручивается целиком, а отдаёт прокрутку внутрь. */
interface IAsideLayoutCase {
    readonly name: string;
    readonly layout: TRtAsideContentLayout;
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
                                            <rt-aside-section heading="Клиент">Иванов Иван Иванович</rt-aside-section>
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
                                            <rt-aside-section heading="Клиент">Ширина задана входом и перекрывает размер.</rt-aside-section>
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
                                            <rt-aside-section heading="Клиент">Иванов Иван Иванович</rt-aside-section>
                                            <rt-aside-section heading="Даты">12.05.2026 — 26.05.2026</rt-aside-section>
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
                                    <rt-aside-section heading="Клиент">Иванов Иван Иванович</rt-aside-section>
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
                                            <rt-aside-section heading="Клиент">Иванов Иван Иванович</rt-aside-section>
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
            inline-size: 100%;
            block-size: 20rem;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAsideComponent,
        RtAsideFooterComponent,
        RtAsideHeaderComponent,
        RtAsideSectionComponent,
        RtButtonDirective,

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

    public readonly layoutCases: readonly IAsideLayoutCase[] = [
        { name: 'обычная', layout: 'default' },
        { name: 'под вкладки', layout: 'tabs' },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
