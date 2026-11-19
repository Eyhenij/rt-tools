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
    template: `
        <div style="box-sizing: border-box; display: flex; justify-content: flex-end; inline-size: 375px; padding: 240px 16px 16px">
            <rt-speed-menu
                label="Масштаб"
                icon="zoom_in"
                [actions]="actions"
                [sheet]="sheet"
                [attr.data-story-trigger]="triggerAttribute" />
        </div>
    `,
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
