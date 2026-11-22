import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { RtColorPaletteComponent } from '../../rt-color-palette.component';

/** Цвета темы приложения — короткий набор, каким его передают входом `colors`. */
const THEME_COLORS: readonly string[] = ['#1e88e5', '#43a047', '#fb8c00', '#e53935', '#8e24aa', '#546e7a'];

/**
 * Палитра с кнопкой «Свой цвет» в рамке телефона. Рамка шириной 375 даёт экран эскиза: шторка
 * выбора своего цвета берёт заголовок у подписи этой кнопки. Узкий ответ даёт история подменой
 * службы точек перехода — с первой отрисовки, а не после смены окна.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-color-palette-sheet',
    templateUrl: './test-color-palette-sheet.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // components
        RtColorPaletteComponent,
    ],
})
export class TestRtColorPaletteSheetComponent {
    protected readonly control: FormControl<string | null> = new FormControl<string | null>('#43a047');

    public readonly colors: readonly string[] = THEME_COLORS;

    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

    public sheet: boolean = true;
}
