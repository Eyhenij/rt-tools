import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtDotFieldComponent } from '../../rt-dot-field.component';

/** Какую историю рисовать: одну сцену или сцену в обеих темах. */
export type TDotFieldPart = 'playground' | 'themes';

/**
 * Демонстрационная обёртка для витрины: сцена с карточкой в центре над полем точек — так поле
 * стоит на странице входа. Позиционированный родитель и карточка — забота страницы, а не поля.
 * В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-dot-field',
    template: `
        @switch (part) {
            @case ('playground') {
                <div class="app-dot-field__scene">
                    <rt-dot-field />
                    <div class="app-dot-field__card">Карточка поверх поля</div>
                </div>
            }

            @case ('themes') {
                <app-story-themes fill>
                    <ng-template>
                        <div class="app-dot-field__scene">
                            <rt-dot-field />
                            <div class="app-dot-field__card">Карточка поверх поля</div>
                        </div>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    styles: `
        .app-dot-field__scene {
            position: relative;
            display: flex;
            overflow: hidden;
            width: 100%;
            height: 22rem;
            align-items: center;
            justify-content: center;
            background-color: var(--rt-color-bg-page);
        }

        .app-dot-field__card {
            position: relative;
            z-index: 1;
            padding: var(--rt-space-10) var(--rt-space-5);
            border: var(--rt-border-width-thin) solid var(--rt-color-border-default);
            border-radius: var(--rt-radius-md);
            background-color: var(--rt-color-bg-surface);
            box-shadow: var(--rt-shadow-card);
            color: var(--rt-color-text-primary);
            font-family: var(--rt-font-family-sans);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtDotFieldComponent,
        StoryThemesComponent,
    ],
})
export class TestRtDotFieldComponent {
    public part: TDotFieldPart = 'playground';
}
