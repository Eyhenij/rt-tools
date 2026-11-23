import { ChangeDetectionStrategy, Component } from '@angular/core';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { RtMenuItemComponent } from '../../../menu/rt-menu-item.component';
import { RtTabDirective } from '../../rt-tab.directive';
import { RtTabsComponent } from '../../rt-tabs.component';

/** Что открывает история: панель «Ещё» или меню вкладки. */
export type TTabsSheetPart = 'more' | 'menu';

/** Вкладка, на которой открывается меню: подпись вкладки становится заголовком шторки. */
export const TABS_SHEET_MENU_TAB: string = 'Брони';

const SECTIONS: readonly string[] = ['Главная', 'Все заявки', 'Календарь', 'Контакты', 'Отзывы', 'Смены', 'Все счета', 'Транзакции'];

/**
 * Вкладки в рамке телефона. Рамка шириной 375 с полем 16 даёт полосу в 343: восьми вкладкам её не
 * хватает, часть уходит в «Ещё» (`part="more"`). В режиме `menu` вкладок мало, и открывается меню
 * вкладки «Брони». Узкий ответ даёт история подменой службы точек перехода — с первой отрисовки.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-tabs-sheet',
    templateUrl: './test-tabs-sheet.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtMenuItemComponent,
        RtTabsComponent,
        RtTabDirective,
    ],
})
export class TestRtTabsSheetComponent {
    public part: TTabsSheetPart = 'more';
    public sheet: boolean = true;

    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;
    public readonly sections: readonly string[] = SECTIONS;
    public readonly menuTab: string = TABS_SHEET_MENU_TAB;
}
