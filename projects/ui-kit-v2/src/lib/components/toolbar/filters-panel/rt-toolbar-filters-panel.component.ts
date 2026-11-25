import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    InputSignal,
    output,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { RtAsideComponent, RtAsideContentDirective, RtAsideFooterComponent, RtAsideHeaderComponent } from '@rt-tools/ui-kit-v2/aside';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { RtToolbarFiltersHub } from '../rt-toolbar-filters-hub';
import { IRtToolbar } from '../rt-toolbar.model';

const BEM_BLOCK: string = 'rt-toolbar-filters-panel';

/**
 * Содержимое панели отборов полосы `rt-toolbar`: шапка «Фильтры» со стрелкой, поля слота
 * `rtToolbarFilters` с контекстом `panel` и подвал «Сбросить» / «Применить».
 *
 * Её рисуют обе панели отборов: панель кита (`filtersPanel="kit"`) отдаёт отборы входом `filters`,
 * маршрутная панель `rt-toolbar-filters-route-aside` (`filtersPanel="app"`) — без входа, и тогда
 * отборы берутся у полосы, отдавшей их последней. «Сбросить» и «Применить» доходят до выходов
 * `filtersReset` и `filtersApply` полосы.
 *
 * `dismiss` сообщает, что панель пора закрыть: нажата стрелка или «Применить». «Сбросить» оставляет
 * панель открытой.
 *
 * @example
 * ```html
 * <rt-toolbar-filters-panel [filters]="data" (dismiss)="close()" />
 * ```
 */
@Component({
    selector: 'rt-toolbar-filters-panel',
    templateUrl: './rt-toolbar-filters-panel.component.html',
    styleUrl: './rt-toolbar-filters-panel.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        NgTemplateOutlet,

        // components
        RtAsideComponent,
        RtAsideContentDirective,
        RtAsideFooterComponent,
        RtAsideHeaderComponent,

        // directives
        BlockDirective,
        ElemDirective,
        RtButtonDirective,
    ],
    host: { class: BEM_BLOCK },
})
export class RtToolbarFiltersPanelComponent {
    readonly #hub: RtToolbarFiltersHub = inject(RtToolbarFiltersHub);

    /** Отборы, по которым рисуется панель: отданные входом или полосой через связку. */
    readonly #source: Signal<IRtToolbar.IFiltersPanelData | null> = computed(
        (): IRtToolbar.IFiltersPanelData | null => this.filters() ?? this.#hub.current()
    );

    protected readonly title: Signal<string> = rtKitLabel('uiFilters');
    protected readonly resetLabel: Signal<string> = rtKitLabel('uiReset');
    protected readonly applyLabel: Signal<string> = rtKitLabel('uiApply');

    protected readonly template: Signal<TemplateRef<IRtToolbar.IFiltersContext> | null> = computed(
        (): TemplateRef<IRtToolbar.IFiltersContext> | null => this.#source()?.template ?? null
    );

    /** Отборы, отданные прямо; без них панель берёт отборы полосы с `filtersPanel="app"`. */
    public readonly filters: InputSignal<IRtToolbar.IFiltersPanelData | null> = input<IRtToolbar.IFiltersPanelData | null>(null);

    /** Панель пора закрыть: нажата стрелка или «Применить». */
    public readonly dismiss: OutputEmitterRef<void> = output<void>();

    protected onReset(): void {
        this.#source()?.reset();
    }

    protected onApply(): void {
        this.#source()?.apply();
        this.dismiss.emit();
    }
}
