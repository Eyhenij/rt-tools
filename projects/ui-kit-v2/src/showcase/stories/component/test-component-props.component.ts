import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { RtButtonDirective } from '../../../lib/components/button/rt-button.directive';
import { StoryRowComponent } from '../../story-row.component';

/** Ячейка ряда: что объявлено поверх кита и каким классом это сделано. */
export interface IRtPropOverride {
    readonly label: string;
    readonly cellClass: string;
}

/**
 * Демонстрационная обёртка для витрины: один и тот же компонент кита под разными значениями
 * своих свойств. Показывает третий слой оформления в работе — потребитель объявляет свойство
 * поверх кита, и меняется ровно то, что этим свойством названо.
 *
 * Инкапсуляция снята намеренно: своё свойство компонент объявляет на корне своего блока, и
 * перебить это объявление можно только правилом той же цели и большей силы. Правило с атрибутом
 * инкапсуляции до корня блока не доходит — он рисуется шаблоном кита, а не этим шаблоном.
 *
 * В пакет обёртка не уезжает: `tsconfig.lib.json` исключает `src/showcase/**`.
 */
@Component({
    selector: 'app-component-props',
    template: `
        <app-story-row caption="Своё свойство, объявленное потребителем" [items]="items" [itemLabel]="labelOf">
            <ng-template let-item>
                <div [class]="item.cellClass">
                    <button rtButton aria-label="Кнопка витрины" [label]="'Сохранить'"></button>
                </div>
            </ng-template>
        </app-story-row>
    `,
    styles: [
        `
            .app-props-demo--square .rt-button {
                --rt-btn-radius: var(--rt-radius-none);
            }

            .app-props-demo--pill .rt-button {
                --rt-btn-radius: var(--rt-radius-full);
            }

            .app-props-demo--tall .rt-button {
                --rt-btn-height: var(--rt-control-height-xl);
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
export class TestRtComponentPropsComponent {
    public readonly items: readonly IRtPropOverride[] = [
        { label: 'как в ките', cellClass: '' },
        { label: '--rt-btn-radius: none', cellClass: 'app-props-demo--square' },
        { label: '--rt-btn-radius: full', cellClass: 'app-props-demo--pill' },
        { label: '--rt-btn-height: xl', cellClass: 'app-props-demo--tall' },
    ];

    public readonly labelOf: (item: IRtPropOverride) => string = (item: IRtPropOverride): string => item.label;
}
