import {
    afterNextRender,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    Injector,
    signal,
    ChangeDetectionStrategy,
    Component,
    OnInit,
    Signal,
    ViewEncapsulation,
    viewChild,
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { rtKitLabel, IRtInput, TRtRadius } from '@rt-tools/ui-kit-v2/core';
import { RtInfiniteScrollDirective, RtOptionList, rtMatchParts, rtSearchMatches, TRtOptionListAction } from '@rt-tools/ui-kit-v2/core';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { RtCheckboxComponent } from '@rt-tools/ui-kit-v2/checkbox';
import { RtEmptyStateComponent } from '@rt-tools/ui-kit-v2/empty-state';
import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtInputComponent } from '@rt-tools/ui-kit-v2/input';
import { RtRadioButtonComponent } from '@rt-tools/ui-kit-v2/radio-button';
import { RtSpinnerComponent } from '@rt-tools/ui-kit-v2/spinner';
import { RtToggleSwitchComponent } from '@rt-tools/ui-kit-v2/toggle-switch';
import { RtTooltipDirective } from '@rt-tools/ui-kit-v2/tooltip';
import {
    dynamicPopupRows,
    dynamicSelectAllState,
    dynamicSelectorLabel,
    lastPinnedDynamicKey,
    selectAllDynamicKeys,
    toggleDynamicKey,
    dynamicLabelCase,
} from '../rt-dynamic-selector.logic';
import { IRtDynamicSelector } from '../rt-dynamic-selector.model';
import { RtDynamicSelectorPartsService } from '../rt-dynamic-selector-parts.service';
import { IRtDynamicSelectorParts } from '../rt-dynamic-selector-parts.model';

const BEM_BLOCK: string = 'rt-dynamic-selector-popup';

/** Управление строки, которое держит фокус: флажок или переключатель. */
const ROW_CONTROL: string = `.${BEM_BLOCK}__row [role="checkbox"], .${BEM_BLOCK}__row [role="radio"]`;

/** Сколько ждёт поиск на сервере после последней нажатой клавиши. */
export const RT_DYNAMIC_SELECTOR_SEARCH_DEBOUNCE: number = 500;

/**
 * Всплывающий выбор динамического селектора: поиск, флажки или переключатели, «Выбрать всё»,
 * догрузка при прокрутке, «Отмена» и «Применить». Отметки живут в самом окне и уходят наружу
 * только по «Применить»: окно создаётся заново при каждом открытии, и закрытие их сбрасывает.
 */
@Component({
    selector: 'rt-dynamic-selector-popup',
    templateUrl: './rt-dynamic-selector-popup.component.html',
    styleUrls: ['./rt-dynamic-selector-popup.component.scss', './rt-dynamic-selector-popup-options.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        FormsModule,
        NgTemplateOutlet,
        RouterLink,

        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtButtonDirective,
        RtCheckboxComponent,
        RtEmptyStateComponent,
        RtIconComponent,
        RtInfiniteScrollDirective,
        RtInputComponent,
        RtRadioButtonComponent,
        RtSpinnerComponent,
        RtToggleSwitchComponent,
        RtTooltipDirective,
    ],
    host: { class: BEM_BLOCK, '(keydown)': 'onKeydown($event)' },
})
export class RtDynamicSelectorPopupComponent<TEntity extends object> implements OnInit {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #host: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly #injector: Injector = inject(Injector);
    readonly #searchSource: Subject<string> = new Subject<string>();
    readonly #source: IRtDynamicSelectorParts.PopupSource<TEntity> =
        inject<RtDynamicSelectorPartsService<TEntity>>(RtDynamicSelectorPartsService).popup;

    /**
     * Клавиши строк. Окно не называет строку через `aria-activedescendant`: строки — флажки и
     * переключатели со своими ролями, и клавиши ведут сам фокус. Enter и пробел они отмечают сами.
     */
    protected readonly optionList: RtOptionList = new RtOptionList({
        panelId: (): string => BEM_BLOCK,
        isOpen: (): boolean => false,
        count: (): number => this.rowItems().length,
        chooseKeys: new Set<string>(),
        sideKeys: false,
        edgeKeys: true,
    });

    protected readonly searchLabel: Signal<string> = rtKitLabel('dynamicSelectorSearch');
    protected readonly searchField: Signal<ElementRef<HTMLElement> | undefined> = viewChild('searchField', { read: ElementRef });
    protected readonly selectAllLabel: Signal<string> = rtKitLabel('uiSelectAll');
    protected readonly multiLabel: Signal<string> = rtKitLabel('dynamicSelectorMulti');
    protected readonly multiHintLabel: Signal<string> = rtKitLabel('dynamicSelectorMultiHint');
    protected readonly noResultsLabel: Signal<string> = rtKitLabel('dynamicSelectorNoResults');
    /** Подпись пустого результата: своя у приложения, иначе словарь кита. */
    protected readonly emptyText: Signal<string> = computed((): string => this.emptyResultsText() || this.noResultsLabel());
    protected readonly cancelLabel: Signal<string> = rtKitLabel('uiCancel');
    protected readonly applyKitLabel: Signal<string> = rtKitLabel('dynamicSelectorApply');
    /** Подпись кнопки применения: своя у приложения, иначе словарь кита, — в заданном регистре. */
    protected readonly applyText: Signal<string> = computed((): string =>
        dynamicLabelCase(this.applyLabel() || this.applyKitLabel(), this.applyLabelCase())
    );

    /** Отмеченные ключи — ещё не применённые. */
    protected readonly ticked: WritableSignal<unknown[]> = signal<unknown[]>([]);
    /** Отметки на минуту последней смены запроса: только они стоят над разделителем, отмеченное потом — на месте. */
    protected readonly raised: WritableSignal<unknown[]> = signal<unknown[]>([]);
    protected readonly query: WritableSignal<string> = signal<string>('');
    /** Выбор нескольких включён: без него простое нажатие оставляет одну отметку. */
    protected readonly isMultiOn: WritableSignal<boolean> = signal<boolean>(false);

    /** Найденные строки: местный поиск отбирает сам, серверный отдаёт запрос наружу. */
    protected readonly found: Signal<TEntity[]> = computed((): TEntity[] => {
        const query: string = this.query();

        if (!this.localSearch() || query.trim() === '') {
            return [...this.entities()];
        }

        return this.entities().filter((item: TEntity): boolean => {
            const label: string | null = dynamicSelectorLabel(item, (entity: TEntity): unknown => this.#labelOf(entity));

            return label !== null && rtSearchMatches(label, query);
        });
    });
    protected readonly rows: Signal<IRtDynamicSelector.PopupRows<TEntity>> = computed((): IRtDynamicSelector.PopupRows<TEntity> =>
        dynamicPopupRows(this.entities(), this.found(), this.raised(), (item: TEntity): unknown => this.#keyOf(item), this.query())
    );
    protected readonly visibleKeys: Signal<unknown[]> = computed((): unknown[] =>
        [...this.rows().ticked, ...this.rows().found].map((item: TEntity): unknown => this.#keyOf(item))
    );
    /** Строки для разметки: отмеченные раньше над разделителем, найденные — под ним. */
    protected readonly rowItems: Signal<IRtDynamicSelector.PopupRow<TEntity>[]> = computed((): IRtDynamicSelector.PopupRow<TEntity>[] => {
        const ticked: ReadonlyArray<unknown> = this.ticked();
        const lastPinned: unknown = this.lastPinnedKey();
        const { ticked: above, found } = this.rows();
        const highlight: boolean = this.highlightSearch();
        const query: string = this.query();
        const labelOf: (item: TEntity) => string = (item: TEntity): string =>
            dynamicSelectorLabel(item, (entity: TEntity): unknown => this.#labelOf(entity)) ?? '';
        const toRow: (item: TEntity, separated: boolean) => IRtDynamicSelector.PopupRow<TEntity> = (
            item: TEntity,
            separated: boolean
        ): IRtDynamicSelector.PopupRow<TEntity> => ({
            entity: item,
            key: this.#keyOf(item),
            label: labelOf(item),
            parts: highlight ? rtMatchParts(labelOf(item), query) : [{ text: labelOf(item), matched: false }],
            ticked: ticked.includes(this.#keyOf(item)),
            separated,
        });

        return [
            ...above.map((item: TEntity, index: number): IRtDynamicSelector.PopupRow<TEntity> => toRow(item, index === above.length - 1)),
            ...found.map((item: TEntity): IRtDynamicSelector.PopupRow<TEntity> =>
                toRow(item, lastPinned !== null && this.#keyOf(item) === lastPinned)
            ),
        ];
    });
    /** Подпись выбора одной записи рисует окно, а не кнопка: без переноса и при подсветке поиска. */
    protected readonly ownLabel: Signal<boolean> = computed((): boolean => !this.titleWrap() || this.highlightSearch());
    protected readonly hasRows: Signal<boolean> = computed((): boolean => this.visibleKeys().length > 0);
    protected readonly selectAllState: Signal<IRtDynamicSelector.SelectAllState> = computed((): IRtDynamicSelector.SelectAllState =>
        dynamicSelectAllState(this.visibleKeys(), this.ticked())
    );
    protected readonly isSingle: Signal<boolean> = computed((): boolean => this.mode() === 'single');
    protected readonly isSelectAllShown: Signal<boolean> = computed(
        (): boolean => !this.isSingle() && this.selectAllShown() && this.visibleKeys().length > 1 && !this.loading()
    );
    protected readonly isMultiToggleVisible: Signal<boolean> = computed(
        (): boolean => !this.isSingle() && this.multiToggleShown() && this.visibleKeys().length > 1 && !this.loading()
    );
    protected readonly lastPinnedKey: Signal<unknown> = computed((): unknown =>
        lastPinnedDynamicKey(this.rows().found, this.pinnedKeys(), (item: TEntity): unknown => this.#keyOf(item))
    );
    protected readonly isApplyDisabled: Signal<boolean> = computed((): boolean => this.ticked().length === 0 || this.loading());
    protected readonly isNavShown: Signal<boolean> = computed((): boolean => !!this.navigateTitle() && !!this.navigateLink());

    /* Настройки окна приходят от корня: окно стоит только внутри него. */
    protected readonly entities: Signal<ReadonlyArray<TEntity>> = this.#source.entities;
    protected readonly keyExp: Signal<keyof TEntity & string> = this.#source.settings.keyExp;
    protected readonly displayExp: Signal<keyof TEntity & string> = this.#source.settings.displayExp;
    protected readonly displayWith: Signal<((entity: TEntity) => string) | null> = this.#source.settings.displayWith;
    protected readonly mode: Signal<IRtDynamicSelector.Mode> = this.#source.settings.mode;
    protected readonly multiToggleShown: Signal<boolean> = this.#source.settings.multiToggleShown;
    protected readonly selectAllShown: Signal<boolean> = this.#source.settings.selectAllShown;
    protected readonly localSearch: Signal<boolean> = this.#source.settings.localSearch;
    protected readonly lazyLoad: Signal<boolean> = this.#source.settings.lazyLoad;
    protected readonly loading: Signal<boolean> = this.#source.settings.loading;
    protected readonly fetching: Signal<boolean> = this.#source.settings.fetching;
    protected readonly pinnedKeys: Signal<ReadonlyArray<unknown>> = this.#source.settings.pinnedKeys;
    protected readonly navigateTitle: Signal<string> = this.#source.settings.navigateTitle;
    protected readonly navigateLink: Signal<string> = this.#source.settings.navigateLink;
    protected readonly searchTerm: Signal<string> = this.#source.settings.searchTerm;
    protected readonly searchAppearance: Signal<IRtInput.Appearance> = this.#source.settings.searchAppearance;
    protected readonly searchRadius: Signal<TRtRadius | null> = this.#source.settings.searchRadius;
    protected readonly emptyResultsText: Signal<string> = this.#source.settings.emptyResultsText;
    protected readonly applyLabel: Signal<string> = this.#source.settings.applyLabel;
    protected readonly applyLabelCase: Signal<IRtDynamicSelector.LabelCase> = this.#source.settings.applyLabelCase;
    protected readonly autofocusSearch: Signal<boolean> = this.#source.settings.autofocusSearch;
    protected readonly titleWrap: Signal<boolean> = this.#source.settings.titleWrap;
    protected readonly highlightSearch: Signal<boolean> = this.#source.settings.highlightSearch;

    public ngOnInit(): void {
        // Выбор живёт в шаблоне и создаётся заново при каждом открытии: запрос начинается с входа.
        this.query.set(this.searchTerm());
        this.#source.temporaryChoice([]);
        this.#searchSource
            .pipe(debounceTime(RT_DYNAMIC_SELECTOR_SEARCH_DEBOUNCE), takeUntilDestroyed(this.#destroyRef))
            .subscribe((query: string): void => this.#source.search(query));

        if (this.autofocusSearch()) {
            afterNextRender((): void => this.searchField()?.nativeElement.querySelector('input')?.focus({ preventScroll: true }), {
                injector: this.#injector,
            });
        }
    }

    protected onQueryChange(value: string | null): void {
        const query: string = value ?? '';

        this.raised.set([...this.ticked()]);
        this.query.set(query);
        this.#source.temporaryChoice(this.#tickedEntities());

        if (!this.localSearch()) {
            this.#searchSource.next(query);
        }
    }

    /** Нажатие строки флажков: при выключенном выборе нескольких без Ctrl или Cmd остаётся одна отметка. */
    protected onRowClick(event: MouseEvent, item: TEntity): void {
        const key: unknown = this.#keyOf(item);
        const checked: boolean = !this.ticked().includes(key);
        const addsToTicks: boolean = !this.multiToggleShown() || this.isMultiOn() || event.ctrlKey || event.metaKey;

        this.ticked.update((keys: unknown[]): unknown[] => toggleDynamicKey(addsToTicks ? keys : [], key, checked));
    }

    protected onRadioChange(item: TEntity): void {
        this.ticked.set([this.#keyOf(item)]);
    }

    protected onSelectAll(checked: boolean): void {
        this.ticked.update((keys: unknown[]): unknown[] => selectAllDynamicKeys(this.visibleKeys(), keys, checked));
    }

    protected onMultiToggle(value: boolean): void {
        this.isMultiOn.set(value);
    }

    protected onApply(): void {
        if (!this.isApplyDisabled()) {
            this.#source.apply([...this.ticked()]);
        }
    }

    protected onCancel(): void {
        this.#source.cancel();
    }

    protected onLoadMore(): void {
        this.#source.loadMore();
    }

    /** Стрелки, Home и End ведут фокус по строкам; в поле поиска Home и End остаются у курсора. */
    protected onKeydown(event: KeyboardEvent): void {
        const target: EventTarget | null = event.target;
        if (!(target instanceof Node)) {
            return;
        }
        const controls: HTMLElement[] = Array.from(this.#host.nativeElement.querySelectorAll<HTMLElement>(ROW_CONTROL));
        const index: number = controls.findIndex((control: HTMLElement): boolean => control.contains(target));
        const inSearch: boolean = this.searchField()?.nativeElement.contains(target) ?? false;
        if (controls.length === 0 || (index < 0 && !inSearch)) {
            return;
        }
        this.optionList.activeIndex.set(index);
        if (this.#moveBy(this.optionList.actionOf(event.key), inSearch)) {
            event.preventDefault();
            controls[this.optionList.activeIndex()]?.focus();
        }
    }

    /** Сдвигает строку по действию клавиши; `false` — клавиша не строк. */
    #moveBy(action: TRtOptionListAction, inSearch: boolean): boolean {
        switch (action) {
            case 'next':
                this.optionList.move(1);
                return true;
            case 'previous':
                if (inSearch) {
                    this.optionList.last();
                } else {
                    this.optionList.move(-1);
                }
                return true;
            case 'first':
            case 'last':
                if (inSearch) {
                    return false;
                }
                if (action === 'first') {
                    this.optionList.first();
                } else {
                    this.optionList.last();
                }
                return true;
            default:
                return false;
        }
    }

    #tickedEntities(): TEntity[] {
        return this.ticked()
            .map((key: unknown): TEntity | undefined => this.entities().find((item: TEntity): boolean => this.#keyOf(item) === key))
            .filter((item: TEntity | undefined): item is TEntity => item !== undefined);
    }

    /** Ключ записи — по имени поля, которое назвал вызывающий. */
    #keyOf(item: TEntity): unknown {
        return item[this.keyExp()];
    }

    /** Подпись записи — по имени поля, которое назвал вызывающий. */
    #labelOf(item: TEntity): unknown {
        const displayWith: ((entity: TEntity) => string) | null = this.displayWith();

        return displayWith === null ? item[this.displayExp()] : displayWith(item);
    }
}
