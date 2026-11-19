import { ChangeDetectionStrategy, Component } from '@angular/core';

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
    template: `
        <div style="box-sizing: border-box; inline-size: 375px; padding: 16px">
            <rt-field label="Страна">
                <rt-select placeholder="Выберите страну" [options]="options" [sheet]="sheet" [attr.data-story-trigger]="triggerAttribute" />
            </rt-field>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtFieldComponent,
        RtSelectComponent,
    ],
})
export class TestRtSelectSheetComponent {
    public readonly options: ReadonlyArray<IRtSelect.Option<string>> = [
        { label: 'Россия', value: 'ru' },
        { label: 'Беларусь', value: 'by' },
        { label: 'Казахстан', value: 'kz' },
        { label: 'Армения', value: 'am' },
        { label: 'Грузия', value: 'ge' },
        { label: 'Узбекистан', value: 'uz', disabled: true },
    ];

    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

    public sheet: boolean = true;
}
