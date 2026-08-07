import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtButtonDirective } from '../../../button/rt-button.directive';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtAsideSectionComponent } from '../../../aside-section/rt-aside-section.component';
import { RtAsideFooterComponent } from '../../footer/rt-aside-footer.component';
import { RtAsideHeaderComponent } from '../../header/rt-aside-header.component';
import { IRtAsideContentLayout, IRtAsideSize, RtAsideComponent } from '../../rt-aside.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type AsideMatrixPart = 'size' | 'width' | 'layout' | 'themes';

/** Раскладка содержимого: с вкладками содержимое не прокручивается целиком, а отдаёт прокрутку внутрь. */
interface IAsideLayoutCase {
    readonly name: string;
    readonly layout: IRtAsideContentLayout;
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
                    <app-story-row caption="Размер" [items]="sizes">
                        <ng-template let-size>
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
                                    <button rtButton asidePrimary type="button" label="Сохранить" aria-label="Сохранить"></button>
                                </rt-aside-footer>
                            </rt-aside>
                        </ng-template>
                    </app-story-row>
                }

                @case ('width') {
                    <app-story-row caption="Своя ширина поверх размера" [items]="widths">
                        <ng-template let-width>
                            <rt-aside size="md" ariaLabel="Панель своей ширины" [width]="width">
                                <rt-aside-header title="Тур в Сочи" />
                                <rt-aside-section heading="Клиент">Ширина задана входом и перекрывает размер.</rt-aside-section>
                            </rt-aside>
                        </ng-template>
                    </app-story-row>
                }

                @case ('layout') {
                    <app-story-row caption="Раскладка содержимого" [items]="layoutCases" [itemLabel]="caseLabel">
                        <ng-template let-layoutCase>
                            <rt-aside size="sm" [contentLayout]="layoutCase.layout" [ariaLabel]="layoutCase.name">
                                <rt-aside-header title="Тур в Сочи" />
                                <rt-aside-section heading="Клиент">Иванов Иван Иванович</rt-aside-section>
                                <rt-aside-section heading="Даты">12.05.2026 — 26.05.2026</rt-aside-section>
                            </rt-aside>
                        </ng-template>
                    </app-story-row>
                }

                @case ('themes') {
                    <app-story-themes caption="Панель в обеих темах">
                        <ng-template>
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
                        </ng-template>
                    </app-story-themes>
                }
            }
        </div>
    `,
    styles: `
        /* Панель тянется на всю высоту родителя: без заданной высоты она схлопнулась бы по
           содержимому, и раскладка с вкладками не отличалась бы от обычной. */
        .app-aside-matrix__room .rt-aside {
            height: 20rem;
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
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtAsideMatrixComponent {
    public part: AsideMatrixPart = 'size';

    public readonly sizes: readonly IRtAsideSize[] = ['sm', 'md', 'lg'];

    /** Своя ширина: вход перекрывает размер, и рядом видно, что размер он и правда перекрывает. */
    public readonly widths: readonly string[] = ['260px', '420px'];

    public readonly layoutCases: readonly IAsideLayoutCase[] = [
        { name: 'обычная', layout: 'default' },
        { name: 'под вкладки', layout: 'tabs' },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
