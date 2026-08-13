import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { RtButtonDirective } from '../../../lib/components/button/rt-button.directive';
import { StoryRowComponent } from '../../story-row.component';

/** Ячейка ряда: что объявило приложение поверх кита и каким классом это сделано. */
export interface IRtLayerOverride {
    readonly label: string;
    readonly cellClass: string;
}

/**
 * Демонстрационная обёртка для витрины: правило приложения против правила кита при равной
 * специфичности. Показывает, ради чего заведён слой каскада — приложение перебивает кит обычным
 * правилом, не считая специфичность и не обходя чужую вёрстку.
 *
 * Специфичность правил показа выровнена по правилу кита намеренно. Кит красит кнопку селектором
 * `.rt-button` — это 0,1,0. Обёртка `:where(.app-layer-demo--…)` веса не добавляет вовсе,
 * поэтому правило показа тоже 0,1,0, и выигрывает оно ровно потому, что объявлено вне слоя, а
 * правило кита — внутри `rt-kit.components`. Написать обёртку обычным классом значило бы
 * показать победу специфичности и выдать её за победу слоя.
 *
 * Инкапсуляция снята намеренно: правило с атрибутом инкапсуляции до корня блока кита не доходит —
 * он рисуется шаблоном кита, а не этим шаблоном.
 *
 * В пакет обёртка не уезжает: `tsconfig.lib.json` исключает `src/showcase/**`.
 */
@Component({
    selector: 'app-cascade-layer',
    template: `
        <app-story-row caption="Правило приложения против правила кита при равной специфичности" [items]="items" [itemLabel]="labelOf">
            <ng-template let-item>
                <div [class]="item.cellClass">
                    <button rtButton aria-label="Кнопка витрины" [label]="'Сохранить'"></button>
                </div>
            </ng-template>
        </app-story-row>
    `,
    styles: [
        `
            :where(.app-layer-demo--bg) .rt-button {
                background-color: var(--rt-color-action-success);
            }

            :where(.app-layer-demo--radius) .rt-button {
                border-radius: var(--rt-radius-none);
            }

            :where(.app-layer-demo--both) .rt-button {
                border-radius: var(--rt-radius-none);
                background-color: var(--rt-color-action-success);
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // components
        RtButtonDirective,
        StoryRowComponent,
    ],
})
export class TestRtCascadeLayerComponent {
    public readonly items: readonly IRtLayerOverride[] = [
        { label: 'как в ките', cellClass: '' },
        { label: 'приложение красит фон', cellClass: 'app-layer-demo--bg' },
        { label: 'приложение снимает скругление', cellClass: 'app-layer-demo--radius' },
        { label: 'приложение делает и то и другое', cellClass: 'app-layer-demo--both' },
    ];

    public readonly labelOf: (item: IRtLayerOverride) => string = (item: IRtLayerOverride): string => item.label;
}
