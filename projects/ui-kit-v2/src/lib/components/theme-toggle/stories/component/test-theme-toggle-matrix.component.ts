import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { RtThemeToggleComponent } from '../../rt-theme-toggle.component';
import { IRtThemeToggle } from '../../rt-theme-toggle.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type ThemeToggleMatrixPart = 'appearance';

/**
 * Матрицы `rt-theme-toggle` для витрины.
 *
 * Ось одна — вид контрола. Второй оси, темы, у него нет: тему держит служба и пишет её на
 * `<html>`, поэтому в паре «светлая ↔ тёмная» обе половины показали бы одно и то же состояние.
 * Переключатель смотрится тумблером темы в тулбаре — он ходит в ту же службу.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-theme-toggle-matrix',
    template: `
        @switch (part) {
            @case ('appearance') {
                <app-story-row caption="Вид" [items]="appearances">
                    <ng-template let-appearance>
                        <rt-theme-toggle [appearance]="appearance" />
                    </ng-template>
                </app-story-row>

                <p class="app-theme-toggle-matrix__note">
                    Оба вида ходят в одну службу: переключите любой — второй переедет следом, а вместе с ними и вся витрина. Иконка
                    показывает,
                    <strong>куда переключит</strong>
                    , а не текущую тему.
                </p>
            }
        }
    `,
    styles: `
        .app-theme-toggle-matrix__note {
            max-width: 46rem;
            color: var(--rt-color-text-muted);
            font-size: 0.8125rem;
            line-height: 1.6;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtThemeToggleComponent,

        // showcase
        StoryRowComponent,
    ],
})
export class TestRtThemeToggleMatrixComponent {
    public part: ThemeToggleMatrixPart = 'appearance';

    public readonly appearances: readonly IRtThemeToggle.Appearance[] = ['icon', 'switch'];
}
