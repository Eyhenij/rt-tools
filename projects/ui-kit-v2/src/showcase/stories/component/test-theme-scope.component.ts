import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { RtButtonDirective } from '../../../lib/components/button/rt-button.directive';
import { RtThemeScopeDirective } from '../../../lib/platform/rt-theme-scope.directive';
import { ITheme } from '../../../lib/platform/theme.model';
import { StoryRowComponent } from '../../story-row.component';

/** Ячейка ряда: какая метка стоит снаружи и какая внутри неё. */
export interface IRtThemeScopeCase {
    readonly label: string;
    readonly outer: ITheme.Mode | '';
    readonly inner: ITheme.Mode | '';
}

/**
 * Четыре случая, которыми местный кусок отличается от темы страницы: тёмный внутри светлого,
 * светлый внутри тёмного, обратная метка внутри метки и снятая метка.
 */
const SCOPE_CASES: IRtThemeScopeCase[] = [
    { label: 'Тёмная карточка внутри светлой страницы', outer: 'dark', inner: '' },
    { label: 'Светлая карточка внутри тёмной', outer: 'dark', inner: 'light' },
    { label: 'Та же метка внутри такой же ничего не меняет', outer: 'dark', inner: 'dark' },
    { label: 'Метки нет — тема страницы', outer: '', inner: '' },
];

/**
 * Демонстрационная обёртка для витрины: узел со своей темой внутри страницы с другой.
 *
 * Каждая ячейка — коробка с меткой темы, а внутри неё вторая коробка со своей. Показ идёт на
 * кнопке и на подписи разом: местный кусок переключает весь набор свойств, а не фон, и по
 * одному фону этого не видно. Собственного фона коробки не рисуют — он приходит из набора, и
 * ровно этим кусок и проверяется.
 *
 * Чего показ не показывает: выбор человека и хранилище. Местный кусок их не трогает вовсе, и
 * кадром это не показать — там нечему появиться.
 *
 * В пакет обёртка не уезжает: `tsconfig.lib.json` исключает `src/showcase/**`.
 */
@Component({
    selector: 'app-theme-scope',
    template: `
        <app-story-row caption="Местный кусок темы" slotWidth="16rem" [items]="items" [itemLabel]="labelOf">
            <ng-template let-item>
                <div class="app-theme-scope__box" [rtTheme]="item.outer">
                    <span class="app-theme-scope__text">Снаружи</span>
                    <button rtButton label="Сохранить" size="sm"></button>

                    <div class="app-theme-scope__box app-theme-scope__box--inner" [rtTheme]="item.inner">
                        <span class="app-theme-scope__text">Внутри</span>
                        <button rtButton label="Сохранить" size="sm" appearance="outlined"></button>
                    </div>
                </div>
            </ng-template>
        </app-story-row>
    `,
    styles: [
        `
            .app-theme-scope__box {
                display: flex;
                flex-direction: column;
                gap: var(--rt-space-8);
                align-items: flex-start;
                padding: var(--rt-space-12);
                border: 1px solid var(--rt-color-border-subtle);
                border-radius: var(--rt-radius-md);
                background-color: var(--rt-color-bg-page);
                color: var(--rt-color-text-primary);
            }

            /*
             * Ширину внутренняя коробка берёт растяжкой по поперечной оси, а не долей от ширины:
             * внешняя — колонка с прижатыми к началу детьми, сжатая по содержимому, и доля
             * считается не от неё. Внутренняя вылезала за правый край ровно на отступ и наезжала
             * на соседнюю ячейку ряда.
             */
            .app-theme-scope__box--inner {
                align-self: stretch;
                background-color: var(--rt-color-bg-surface);
            }

            .app-theme-scope__text {
                font-size: var(--rt-text-sm);
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // components
        RtButtonDirective,
        RtThemeScopeDirective,
        StoryRowComponent,
    ],
})
export class TestRtThemeScopeComponent {
    protected readonly items: IRtThemeScopeCase[] = SCOPE_CASES;

    protected readonly labelOf: (item: IRtThemeScopeCase) => string = (item: IRtThemeScopeCase): string => item.label;
}
