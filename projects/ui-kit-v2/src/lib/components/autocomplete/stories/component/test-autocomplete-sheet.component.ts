import { ChangeDetectionStrategy, Component } from '@angular/core';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { RtFieldComponent } from '../../../field/rt-field.component';
import { RtAutocompleteComponent } from '../../rt-autocomplete.component';

/**
 * Поле с подсказками «Город» в рамке телефона. Рамка шириной 375 даёт экран эскиза
 * `Телефон · Autocomplete`: шторка открывается касанием, поле поиска стоит в её верхней части,
 * подсказки под ним. Узкий ответ даёт история подменой службы точек перехода — с первой
 * отрисовки, а не после смены окна.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-autocomplete-sheet',
    templateUrl: './test-autocomplete-sheet.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtFieldComponent,
        RtAutocompleteComponent,
    ],
})
export class TestRtAutocompleteSheetComponent {
    public readonly suggestions: ReadonlyArray<string> = ['Москва', 'Мурманск', 'Минск', 'Могилёв', 'Мозырь', 'Молодечно'];

    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

    public sheet: boolean = true;

    // Поле-стрелка линтер считает методом, поэтому оно стоит после остальных.
    public displayWith: (item: string | null) => string = (item: string | null): string => String(item ?? '');
}
