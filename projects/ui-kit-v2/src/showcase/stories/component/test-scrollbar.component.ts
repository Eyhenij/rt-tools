import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { StoryRowComponent } from '../../story-row.component';

/**
 * Демонстрационная обёртка для витрины: тихая полоса прокрутки.
 *
 * Показывает то, ради чего она заведена: место под полосу занято и в покое, поэтому наведение
 * двигает только цвет ползунка, а содержимое остаётся на месте. Наводить надо на саму зону —
 * ползунок в покое невидим, и навести на него нечем.
 *
 * Вторая зона держит внутри поле ввода: фокус внутри зоны показывает полосу наравне с наведением,
 * и прокрутка с клавиатуры перестаёт быть слепой.
 *
 * Инкапсуляция снята намеренно: правила полосы объявлены в подслое основы для всех зон разом, а
 * правило с атрибутом инкапсуляции до системной полосы не доходит вовсе.
 *
 * В пакет обёртка не уезжает: `tsconfig.lib.json` исключает `src/showcase/**`.
 */
@Component({
    selector: 'app-scrollbar',
    template: `
        <app-story-row caption="Зона прокрутки: наведение проявляет ползунок, места не двигая" [items]="cases" [itemLabel]="labelOf">
            <ng-template let-item>
                <div class="app-scroll-demo">
                    @if (item.withField) {
                        <input class="app-scroll-demo__field" aria-label="Поле внутри зоны прокрутки" />
                    }
                    @for (line of lines; track line) {
                        <p class="app-scroll-demo__line">{{ line }}</p>
                    }
                </div>
            </ng-template>
        </app-story-row>
    `,
    styles: [
        `
            .app-scroll-demo {
                overflow-y: auto;
                width: 260px;
                height: 160px;
                padding: var(--rt-spacing-md);
                border: var(--rt-border-width-thin) solid var(--rt-color-border-default);
                border-radius: var(--rt-radius-md);
                background: var(--rt-color-bg-surface);
            }

            .app-scroll-demo__line {
                margin: 0 0 var(--rt-spacing-sm);
                color: var(--rt-color-text-default);
            }

            .app-scroll-demo__field {
                width: 100%;
                margin-bottom: var(--rt-spacing-sm);
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [StoryRowComponent],
})
export class TestRtScrollbarComponent {
    public readonly lines: readonly string[] = Array.from(
        { length: 14 },
        (_unused: unknown, index: number): string => `Строка ${index + 1}`
    );

    public readonly cases: ReadonlyArray<{ readonly label: string; readonly withField: boolean }> = [
        { label: 'наведением', withField: false },
        { label: 'фокусом внутри', withField: true },
    ];

    public readonly labelOf: (value: { readonly label: string }) => string = (value: { readonly label: string }): string => value.label;
}
