import { ChangeDetectionStrategy, Component } from '@angular/core';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { RtActionBarComponent } from '../../rt-action-bar.component';
import { IRtActionBar } from '../../rt-action-bar.model';

/**
 * Полоса массовых действий в рамке телефона. Рамка шириной 375 даёт экран эскиза: шторка вложенного
 * списка берёт заголовок у доступного имени действия с этим списком («Отправить»). Узкий ответ даёт
 * история подменой службы точек перехода — с первой отрисовки, а не после смены окна.
 *
 * Действие со вложенным списком стоит первым: кнопкой-триггером `play` берёт первую кнопку полосы.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-action-bar-sheet',
    templateUrl: './test-action-bar-sheet.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtActionBarComponent,
    ],
})
export class TestRtActionBarSheetComponent {
    public readonly config: IRtActionBar.Config = {
        selected: 3,
        total: 128,
        actions: [
            {
                label: 'Отправить',
                icon: 'send',
                menu: [
                    { label: 'Письмом' },
                    { label: 'В чат' },
                    { label: 'Ссылкой на файл' },
                    { label: 'Передать коллеге', look: 'danger' },
                ],
            },
            { label: 'Скачать', icon: 'ico-download' },
        ],
    };

    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

    public sheet: boolean = true;
}
