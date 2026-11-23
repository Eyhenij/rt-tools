import { ChangeDetectionStrategy, Component } from '@angular/core';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { RtMenuContentDirective } from '../../rt-menu-content.directive';
import { RtMenuItemComponent } from '../../rt-menu-item.component';
import { RtMenuComponent } from '../../rt-menu.component';

/**
 * Меню действий в рамке телефона. Рамка шириной 375 даёт экран эскиза `Телефон · Menu`:
 * пункты стоят в нижней шторке, заголовок шторки — подпись кнопки меню. Пункты приходят шаблоном
 * `<ng-template rtMenuContent>`, как у меню при кнопке. Узкий ответ даёт история
 * подменой службы точек перехода — с первой отрисовки, а не после смены окна.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-menu-sheet',
    templateUrl: './test-menu-sheet.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtMenuComponent,
        RtMenuItemComponent,

        // directives
        RtMenuContentDirective,
    ],
})
export class TestRtMenuSheetComponent {
    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

    public sheet: boolean = true;
}
