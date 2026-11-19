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
    template: `
        <div style="box-sizing: border-box; inline-size: 375px; padding: 16px">
            @if (part === 'more') {
                <rt-tabs overflow="more" headerOnly activeId="Главная" [sheet]="sheet" [attr.data-story-trigger]="triggerAttribute">
                    @for (section of sections; track section) {
                        <ng-template [rtTab]="section" [label]="section" />
                    }
                </rt-tabs>
            } @else {
                <rt-tabs headerOnly [activeId]="menuTab" [sheet]="sheet" [attr.data-story-trigger]="triggerAttribute">
                    <ng-template [rtTab]="menuTab" [label]="menuTab" [contextMenu]="tabMenu" />
                    <ng-template rtTab="Гости" label="Гости" />
                    <ng-template rtTab="Заезды" label="Заезды" />
                </rt-tabs>
            }
            <ng-template #tabMenu>
                <rt-menu-item label="Переименовать" icon="pencil" />
                <rt-menu-item label="Закрепить" icon="pin" />
                <rt-menu-item label="Закрыть" icon="close" />
            </ng-template>
        </div>
    `,
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
