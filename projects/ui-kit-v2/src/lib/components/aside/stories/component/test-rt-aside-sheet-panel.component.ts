import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { RtAsideSectionComponent } from '../../../aside-section/rt-aside-section.component';
import { RtButtonDirective } from '../../../button/rt-button.directive';
import { RtDetailListComponent } from '../../../detail-list/rt-detail-list.component';
import { RtDetailRowComponent } from '../../../detail-list/rt-detail-row.component';
import { RtFieldComponent } from '../../../field/rt-field.component';
import { RtIconButtonComponent } from '../../../icon-button/rt-icon-button.component';
import { RtInputComponent } from '../../../input/rt-input.component';
import { RtTabDirective } from '../../../tabs/rt-tab.directive';
import { RtTabsComponent } from '../../../tabs/rt-tabs.component';
import { RtAsideFooterComponent } from '../../footer/rt-aside-footer.component';
import { IRtAsideHeader } from '../../header/rt-aside-header.model';
import { RtAsideHeaderComponent } from '../../header/rt-aside-header.component';
import { RtAsideContentDirective } from '../../rt-aside-content.directive';
import { RtAsideComponent } from '../../rt-aside.component';
import { RT_ASIDE_DATA } from '../../rt-aside.tokens';

/**
 * Панель кадра макета, которую открывает служба кита: запись брони, панель приложения, запись во
 * вкладках, длинный ряд вкладок и подвал с двумя кнопками.
 */
export type TAsideSheetPanel = 'record' | 'app' | 'tabs' | 'long-tabs' | 'footer';

/** Бэйджи брони из макета панели записи. */
const BOOKING_BADGES: readonly IRtAsideHeader.Badge[] = [
    { value: 'Подтверждена', severity: 'success' },
    { value: 'Оплачено', severity: 'info' },
];

/**
 * Панель витрины асайда-шторки. Какую из панелей кадра рисовать, она узнаёт из данных открытия: их
 * передаёт обёртка витрины, открывая панель службой кита. В пакет панель не уезжает.
 */
@Component({
    selector: 'app-aside-sheet-panel',
    templateUrl: './test-rt-aside-sheet-panel.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtAsideComponent,
        RtAsideHeaderComponent,
        RtAsideFooterComponent,
        RtAsideContentDirective,
        RtAsideSectionComponent,
        RtDetailListComponent,
        RtDetailRowComponent,
        RtFieldComponent,
        RtInputComponent,
        RtIconButtonComponent,
        RtTabsComponent,
        RtTabDirective,
        RtButtonDirective,
    ],
})
export class TestRtAsideSheetPanelComponent {
    protected readonly panel: TAsideSheetPanel = inject<TAsideSheetPanel>(RT_ASIDE_DATA);
    protected readonly badges: readonly IRtAsideHeader.Badge[] = BOOKING_BADGES;
}
