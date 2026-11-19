import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, Signal, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { IRtKpiItem, IRtStatTile, RT_KIT_LOCALE, RtStatTileComponent, rtKpiValueWriter } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'rt-ai-chat-kpi';

/** Карточка, как её рисует плитка: значение уже записано в языке кита. */
interface ICard {
    readonly label: string;
    readonly value: string;
    readonly period: string | null;
    readonly delta: IRtStatTile.Delta | null;
    readonly growthIsWorse: boolean;
}

function card(item: IRtKpiItem, locale: string): ICard {
    return {
        label: item.label,
        value: rtKpiValueWriter(item, locale)(item.value),
        period: item.period,
        delta: item.delta === null ? null : { percent: item.delta, unit: item.deltaUnit, label: item.base ?? '' },
        growthIsWorse: !item.growthIsGood,
    };
}

/**
 * Блок KPI ответа `rt-ai-chat`: список карточек, каждая — компактная плитка `rt-stat-tile` в рамке
 * блока. Значение пишется по роду карточки в языке кита, от миллиона — коротко; дельта — по языку
 * кита с видимой подписью базы. Колонки задаёт ширина самого блока: одна уже 328, две от 328,
 * четыре от 664.
 */
@Component({
    selector: 'rt-ai-chat-kpi',
    templateUrl: './rt-ai-chat-kpi.component.html',
    styleUrl: './rt-ai-chat-kpi.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        RtStatTileComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtAiChatKpiComponent {
    readonly #locale: Signal<string> = inject(RT_KIT_LOCALE);

    /** Карточки в языке кита: смена языка пишет их заново. */
    protected readonly cards: Signal<readonly ICard[]> = computed((): readonly ICard[] =>
        this.items().map((item: IRtKpiItem): ICard => card(item, this.#locale()))
    );

    /** Карточки блока, приведённые к виду для рисования. */
    public readonly items: InputSignal<readonly IRtKpiItem[]> = input.required<readonly IRtKpiItem[]>();
}
