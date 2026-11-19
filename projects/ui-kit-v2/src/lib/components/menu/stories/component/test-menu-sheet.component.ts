import { ChangeDetectionStrategy, Component } from '@angular/core';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { RtMenuItemComponent } from '../../rt-menu-item.component';
import { RtMenuComponent } from '../../rt-menu.component';

/**
 * Меню действий в рамке телефона. Рамка шириной 375 даёт экран эскиза `Телефон · Menu`:
 * пункты стоят в нижней шторке, заголовок шторки — подпись кнопки меню. Узкий ответ даёт история
 * подменой службы точек перехода — с первой отрисовки, а не после смены окна.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-menu-sheet',
    template: `
        <div style="box-sizing: border-box; inline-size: 375px; padding: 16px">
            <rt-menu ariaLabel="Действия с записью" [sheet]="sheet" [attr.data-story-trigger]="triggerAttribute">
                <rt-menu-item label="Изменить" icon="ico-edit" />
                <rt-menu-item label="Дублировать" icon="ico-copy" />
                <rt-menu-item
                    label="Удалить"
                    icon="ico-trash"
                    confirmMessage="Удалить запись? Действие необратимо."
                    confirmTitle="Удаление"
                    [danger]="true" />
            </rt-menu>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtMenuComponent,
        RtMenuItemComponent,
    ],
})
export class TestRtMenuSheetComponent {
    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

    public sheet: boolean = true;
}
