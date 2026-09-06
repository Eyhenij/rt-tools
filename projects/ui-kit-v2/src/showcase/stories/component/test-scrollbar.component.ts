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
    templateUrl: './test-scrollbar.component.html',
    styleUrl: './test-scrollbar.component.scss',
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
