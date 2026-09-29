import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { RtAccordionComponent } from '../../rt-accordion.component';
import { IRtAccordion } from '../../rt-accordion.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое Storybook вешает
 * контролы. Входы кита сигнальные и извне не пишутся — поэтому история целится сюда, а не в сам
 * компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-accordion',
    templateUrl: './test-accordion.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAccordionComponent,

        // showcase
        StoryPresetsComponent,
    ],
})
export class TestRtAccordionComponent {
    public items: readonly IRtAccordion.Item[] = [
        { title: 'Сколько идёт доставка?', text: 'По городу — один день, в другие города — от трёх до пяти дней.' },
        { title: 'Можно ли вернуть товар?', text: 'Да, в течение четырнадцати дней, если сохранена упаковка.' },
        { title: 'Как оплатить заказ?', text: 'Картой на сайте или наличными курьеру при получении.' },
    ];

    public openIndex: number | null = 0;
}
