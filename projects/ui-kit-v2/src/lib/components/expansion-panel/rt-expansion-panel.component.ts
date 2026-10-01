import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    input,
    InputSignal,
    InputSignalWithTransform,
    model,
    ModelSignal,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtIconComponent } from '../icon';
import { RtExpansionPanelContentDirective } from './rt-expansion-panel-content.directive';
import { IRtExpansionPanel } from './rt-expansion-panel.model';

const BEM_BLOCK: string = 'rt-expansion-panel';

let expansionPanelIdSeed: number = 0;

function nextExpansionPanelId(): number {
    expansionPanelIdSeed += 1;
    return expansionPanelIdSeed;
}

/**
 * Раскрывающаяся панель: заголовок-кнопка во всю ширину с шевроном у правого края и тело под ним.
 * Нажатие на заголовок раскрывает и сворачивает тело, раскрытие и сворачивание идут с движением.
 * Заменяет во втором ките панель раскрытия Material первого кита.
 *
 * Заголовок — содержимое панели без отметки. Тело — узел с `rtExpansionPanelBody`, созданный сразу,
 * или `<ng-template rtExpansionPanelContent>`, созданный при раскрытии.
 *
 * Состояние раскрытия — `expanded`, двусторонняя привязка: панель пишет в него сама, а владелец
 * может держать его в своём сигнале и менять извне.
 */
@Component({
    selector: 'rt-expansion-panel',
    templateUrl: './rt-expansion-panel.component.html',
    styleUrl: './rt-expansion-panel.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgTemplateOutlet,

        // directives
        BlockDirective,
        ElemDirective,
        ModDirective,

        // components
        RtIconComponent,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-expansion-panel--plain]': 'appearance() === "plain"',
        '[class.rt-expansion-panel--expanded]': 'expanded()',
        '[class.rt-expansion-panel--disabled]': 'disabled()',
    },
})
export class RtExpansionPanelComponent {
    /** Основа id: две панели на одной странице не ссылаются на чужое тело. */
    readonly #idBase: string = `rt-expansion-panel-${nextExpansionPanelId()}`;

    /** Ленивое тело: шаблон создаётся при раскрытии. */
    protected readonly lazyContent: Signal<RtExpansionPanelContentDirective | undefined> = contentChild(RtExpansionPanelContentDirective);
    protected readonly bodyId: string = `${this.#idBase}-body`;
    protected readonly headerDomId: Signal<string> = computed((): string => this.headerId() ?? `${this.#idBase}-header`);

    /** Тело раскрыто. Двусторонняя привязка: нажатие на заголовок пишет сюда. */
    public readonly expanded: ModelSignal<boolean> = model<boolean>(false);

    /** Заголовок не нажимается, тело остаётся как было. */
    public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, { transform: booleanAttribute });

    /** Шеврона нет: раскрытие читается по содержимому или его нечего раскрывать. */
    public readonly hideToggle: InputSignalWithTransform<boolean, unknown> = input(false, { transform: booleanAttribute });

    public readonly appearance: InputSignal<IRtExpansionPanel.Appearance> = input<IRtExpansionPanel.Appearance>('card');

    /** Id кнопки заголовка. Нужен владельцу, который ищет заголовок по своему номеру; иначе — свой. */
    public readonly headerId: InputSignal<string | null> = input<string | null>(null);

    /** Имя кнопки заголовка для вспомогательных средств, когда видимой подписи мало. */
    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);

    /** Нажатие на заголовок: раскрывает свёрнутую панель и сворачивает раскрытую. */
    public toggle(): void {
        if (!this.disabled()) {
            this.expanded.set(!this.expanded());
        }
    }
}
