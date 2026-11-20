import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { RtDynamicSelectorComponent } from '../../rt-dynamic-selector.component';
import { IStoryPerson } from './test-dynamic-selector.component';

/**
 * Выбор команды в рамке телефона. Рамка шириной 375 даёт экран эскиза: окно выбора под кнопкой
 * «Добавить» открывается нижней шторкой с заголовком кнопки. Узкий ответ даёт история подменой
 * службы точек перехода — с первой отрисовки, а не после смены окна.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-dynamic-selector-sheet',
    templateUrl: './test-dynamic-selector-sheet.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // components
        RtDynamicSelectorComponent,
    ],
})
export class TestRtDynamicSelectorSheetComponent {
    public readonly people: readonly IStoryPerson[] = [
        { id: 1, name: 'Анна Смирнова' },
        { id: 2, name: 'Игнат Дорошенко' },
        { id: 3, name: 'Саул Векслер' },
        { id: 4, name: 'Марта Коновалова' },
        { id: 5, name: 'Мирон Таллис' },
        { id: 6, name: 'Петра Линдквист' },
        { id: 7, name: 'Оскар Веннер' },
    ];

    public readonly control: FormControl<number[] | null> = new FormControl<number[] | null>([1, 2]);

    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

    public sheet: boolean = true;
}
