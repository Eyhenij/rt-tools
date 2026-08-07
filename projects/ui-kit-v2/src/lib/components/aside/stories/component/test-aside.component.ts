import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtButtonDirective } from '../../../button/rt-button.directive';
import { RtAsideSectionComponent } from '../../../aside-section/rt-aside-section.component';
import { RtAsideFooterComponent } from '../../footer/rt-aside-footer.component';
import { RtAsideHeaderComponent } from '../../header/rt-aside-header.component';
import { IRtAsideContentLayout, IRtAsideSize, RtAsideComponent } from '../../rt-aside.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Внутрь положены шапка, раздел и подвал: пустая панель показывала бы одну коробку, а не панель.
 */
@Component({
    selector: 'app-aside',
    template: `
        <rt-aside [size]="size" [contentLayout]="contentLayout" [width]="width" [ariaLabel]="ariaLabel">
            <rt-aside-header title="Тур в Сочи" overline="Заявка № 1024" />
            <rt-aside-section heading="Клиент">Иванов Иван Иванович</rt-aside-section>
            <rt-aside-section heading="Даты">12.05.2026 — 26.05.2026</rt-aside-section>
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
    `,
    styles: `
        /* Панель тянется на всю высоту родителя: без заданной высоты она схлопнулась бы
           по содержимому. */
        .rt-aside {
            height: 24rem;
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
    ],
})
export class TestRtAsideComponent {
    public size: IRtAsideSize = 'md';
    public contentLayout: IRtAsideContentLayout = 'default';
    public width: string | null = null;
    public ariaLabel: string | null = null;
}
