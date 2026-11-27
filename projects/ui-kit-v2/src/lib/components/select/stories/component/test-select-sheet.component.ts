import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { RtFieldComponent } from '../../../field/rt-field.component';
import { RtSelectComponent } from '../../rt-select.component';
import { IRtSelect } from '../../rt-select.model';

/**
 * Выбор в поле «Страна» в рамке телефона. Рамка шириной 375 даёт экран эскиза: шторка списка
 * берёт заголовок у подписи `rt-field`. Узкий ответ даёт история подменой службы точек перехода —
 * с первой отрисовки, а не после смены окна.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-select-sheet',
    templateUrl: './test-select-sheet.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // Angular
        FormsModule,

        // components
        RtFieldComponent,
        RtSelectComponent,
    ],
})
export class TestRtSelectSheetComponent {
    /** Две опции несут пояснение: в шторке оно стоит второй строкой карточки, у поля его нет. */
    public readonly options: ReadonlyArray<IRtSelect.Option<string>> = [
        { label: 'Россия', value: 'ru', description: 'Доставка от двух дней' },
        { label: 'Беларусь', value: 'by' },
        { label: 'Казахстан', value: 'kz', description: 'Доставка от пяти дней' },
        { label: 'Армения', value: 'am' },
        { label: 'Грузия', value: 'ge' },
        { label: 'Узбекистан', value: 'uz', disabled: true },
    ];

    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

    public sheet: boolean = true;

    /** Карточки выбора в шторке; `false` возвращает строки, какими список стоит у поля. */
    public sheetCards: boolean = true;

    /** Поиск над списком: шторка с ним встаёт во всю высоту, пока фокус в поиске. */
    public filter: boolean = false;

    /** Выбранная страна: её карточка отмечена радиокнопкой. */
    public chosen: string | null = 'by';
}
