import { ChangeDetectionStrategy, Component } from '@angular/core';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { RtSplitButtonComponent } from '../../rt-split-button.component';
import { IRtSplitButton } from '../../rt-split-button.model';

/**
 * Кнопка «Отправить» с меню действий в рамке телефона. Рамка шириной 375 даёт экран эскиза: шторка
 * меню берёт заголовок у подписи кнопки (`label`). Узкий ответ даёт история подменой службы точек
 * перехода — с первой отрисовки, а не после смены окна.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-split-button-sheet',
    templateUrl: './test-split-button-sheet.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtSplitButtonComponent,
    ],
})
export class TestRtSplitButtonSheetComponent {
    public readonly menuItems: readonly IRtSplitButton.MenuItem[] = [
        { value: 'later', label: 'Отправить позже' },
        { value: 'copy', label: 'Отправить копию себе', icon: 'ico-copy' },
        { value: 'draft', label: 'Сохранить черновик', icon: 'ico-edit' },
        { value: 'schedule', label: 'Отправить по расписанию', disabled: true },
    ];

    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

    public sheet: boolean = true;
}
