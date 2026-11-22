import { ChangeDetectionStrategy, Component } from '@angular/core';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { RtSpeedMenuComponent } from '../../rt-speed-menu.component';
import { IRtSpeedMenu } from '../../rt-speed-menu.model';
import { SPEED_MENU_ZOOM } from './test-speed-menu.data';

/**
 * Меню масштаба в рамке телефона. Рамка шириной 375 даёт экран эскиза: шторка берёт заголовок у
 * доступного имени кнопки меню (`label`). Узкий ответ даёт история подменой службы точек перехода —
 * с первой отрисовки, а не после смены окна.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-speed-menu-sheet',
    templateUrl: './test-speed-menu-sheet.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtSpeedMenuComponent,
    ],
})
export class TestRtSpeedMenuSheetComponent {
    public readonly actions: readonly IRtSpeedMenu.Action[] = SPEED_MENU_ZOOM;

    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

    public sheet: boolean = true;
}
