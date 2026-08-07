import { ChangeDetectionStrategy, Component, computed, input, InputSignal, Signal, ViewEncapsulation } from '@angular/core';

import { translateSignal } from '@jsverse/transloco';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtIconComponent } from '../icon';
import { IRtBarList } from './rt-bar-list.model';

const BEM_BLOCK: string = 'rt-bar-list';

/**
 * Список «топ-N» со шкалой доли: заголовок, необязательное уточнение, значение
 * справа и полоса под строкой. Заменяет самодельные бары — третьей реализации
 * в проекте быть не должно.
 *
 * Компонент ничего не считает и не форматирует: доля приходит числом 0…100,
 * значение — готовой строкой. Так список одинаково годится и для денег, и для
 * счётчиков визитов.
 */
@Component({
    selector: 'rt-bar-list',
    templateUrl: './rt-bar-list.component.html',
    styleUrl: './rt-bar-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtIconComponent,
        BlockDirective,
        ElemDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtBarListComponent {
    readonly #t_uiNoData: Signal<string> = translateSignal('rtKit.uiNoData');

    protected readonly emptyMessage: Signal<string> = computed((): string => this.emptyText() || this.#t_uiNoData());

    public readonly rows: InputSignal<ReadonlyArray<IRtBarList.Row>> = input.required<ReadonlyArray<IRtBarList.Row>>();

    public readonly title: InputSignal<string> = input<string>('');

    /** Пусто — берётся переведённая подпись по умолчанию */
    public readonly emptyText: InputSignal<string> = input<string>('');
}
