import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtDotFieldComponent } from '../../rt-dot-field.component';

/** Какую историю рисовать: одну сцену, сцену в обоих наборах или в обеих темах. */
export type TDotFieldPart = 'playground' | 'presets' | 'themes';

/**
 * Демонстрационная обёртка для витрины: сцена с карточкой в центре над полем точек — так поле
 * стоит на странице входа. Позиционированный родитель и карточка — забота страницы, а не поля.
 * В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-dot-field',
    templateUrl: './test-dot-field.component.html',
    styleUrl: './test-dot-field.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtDotFieldComponent,
        StoryPresetsComponent,
        StoryThemesComponent,
    ],
})
export class TestRtDotFieldComponent {
    public part: TDotFieldPart = 'playground';
}
