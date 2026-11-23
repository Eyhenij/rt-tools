import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    input,
    InputSignal,
    output,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    untracked,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { RtAsideComponent, RtAsideFooterComponent, RtAsideHeaderComponent } from '@rt-tools/ui-kit-v2/aside';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { RtToolbarFiltersHub } from '../rt-toolbar-filters.hub';
import { IRtToolbar } from '../rt-toolbar.model';

const BEM_BLOCK: string = 'rt-toolbar-filters-panel';

/**
 * Содержимое панели отборов полосы `rt-toolbar`: шапка «Фильтры» со стрелкой, поля слота
 * `rtToolbarFilters` с контекстом `panel` и подвал «Сбросить» / «Применить».
 *
 * Приложение, которое открывает панели маршрутом, ставит полосе `filtersPanel="app"` и рисует эту
 * часть в компоненте своего маршрута: поля берутся из шаблона полосы, «Сбросить» и «Применить»
 * доходят до её выходов `filtersReset` и `filtersApply`. Закрывает панель приложение по `dismiss`.
 *
 * `dismiss` сообщает, что панель пора закрыть: нажата стрелка или «Применить», отборы вернулись в
 * полосу на широком месте, полоса уничтожена. «Сбросить» оставляет панель открытой.
 *
 * Вход `filters` отдаёт отборы прямо — так эту часть рисует панель самого кита. Без него отборы
 * берутся у полосы, отдавшей их последней.
 *
 * @example
 * ```html
 * <rt-toolbar-filters-panel (dismiss)="closeRoute()" />
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

    /** Панель пора закрыть: стрелка, «Применить», отборы вернулись в полосу, полоса уничтожена. */
    public readonly dismiss: OutputEmitterRef<void> = output<void>();

    constructor() {
        // Отборы полосы живут в одном месте: вернулись в полосу на широком месте или полоса ушла со
        // страницы — панель просит закрыть себя. Полоса, ещё не отдавшая отборы, панель не закрывает:
        // при загрузке страницы по ссылке маршрут панели встаёт раньше полосы списка
        let seen: boolean = false;
        effect((): void => {
            if (this.filters() !== null) {
                return;
            }
            const source: IRtToolbar.IFiltersSource | null = this.#hub.current();
            if (source === null) {
                if (seen) {
                    untracked((): void => this.dismiss.emit());
                }
                return;
            }
            seen = true;
            if (!source.collapsed()) {
                untracked((): void => this.dismiss.emit());
            }
        });
    }

    protected onReset(): void {
        this.#source()?.reset();
    }

    protected onApply(): void {
        this.#source()?.apply();
        this.dismiss.emit();
    }
}
