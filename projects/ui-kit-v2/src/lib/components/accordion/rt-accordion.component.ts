import { input, linkedSignal, ChangeDetectionStrategy, Component, InputSignal, ViewEncapsulation, WritableSignal } from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtIconComponent } from '../icon';
import { initialAccordionOpen, toggleAccordionItem } from './rt-accordion.logic';
import { IRtAccordion } from './rt-accordion.model';

const BEM_BLOCK: string = 'rt-accordion';

let accordionIdSeed: number = 0;

function nextAccordionId(): number {
    accordionIdSeed += 1;
    return accordionIdSeed;
}

/**
 * Список пунктов, у каждого заголовок-кнопка и текст под ней. Нажатие раскрывает или сворачивает
 * пункт, соседи остаются как были. Предмета показа аккордеон не знает: пункты приходят входом уже
 * переведёнными.
 */
@Component({
    selector: 'rt-accordion',
    templateUrl: './rt-accordion.component.html',
    styleUrl: './rt-accordion.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtIconComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtAccordionComponent {
    /** Основа id кнопок и панелей: два аккордеона на одной странице не ссылаются на чужие панели. */
    protected readonly idBase: string = `rt-accordion-${nextAccordionId()}`;

    /** Пришёл новый список — раскрытие начинается заново с пункта из входа. */
    protected readonly open: WritableSignal<ReadonlySet<number>> = linkedSignal<ReadonlySet<number>>((): ReadonlySet<number> =>
        initialAccordionOpen(this.openIndex(), this.items().length)
    );

    public readonly items: InputSignal<readonly IRtAccordion.Item[]> = input.required<readonly IRtAccordion.Item[]>();

    /** Пункт, раскрытый при входе. `null` оставляет все свёрнутыми. */
    public readonly openIndex: InputSignal<number | null> = input<number | null>(0);

    protected toggle(index: number): void {
        this.open.update((open: ReadonlySet<number>): ReadonlySet<number> => toggleAccordionItem(open, index));
    }
}
