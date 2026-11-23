import { BooleanInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    computed,
    contentChild,
    forwardRef,
    inject,
    input,
    output,
    signal,
    viewChild,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { IRtLoadError, RtEmptyStateComponent, rtLoadErrorView } from '@rt-tools/ui-kit-v2/empty-state';
import { RtFormControlBase } from '@rt-tools/ui-kit-v2/form-control';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RtInputComponent } from '@rt-tools/ui-kit-v2/input';
import { RtSpinnerComponent } from '@rt-tools/ui-kit-v2/spinner';
import { RtPopoverDirective, RtSheetTemplatesDirective } from '@rt-tools/ui-kit-v2/popover';
import { RtRadiusDirective } from '@rt-tools/ui-kit-v2/radius';
import { RtOptionList, TRtOptionListAction } from '@rt-tools/ui-kit-v2/core';
import { RtAutocompleteEmptyDirective, RtAutocompleteErrorDirective } from './rt-autocomplete-states.directive';
import { IRtAutocomplete } from './rt-autocomplete.model';

/** Сколько точек до дна панели уже считается концом списка. */
const END_THRESHOLD_PX: number = 8;
/** Со скольких букв запроса открываются подсказки, когда `minLength` не задан. */
const RT_AUTOCOMPLETE_MIN_LENGTH: number = 1;

const BEM_BLOCK: string = 'rt-autocomplete';

let panelIdSeed: number = 0;

function nextPanelId(): number {
    panelIdSeed += 1;
    return panelIdSeed;
}

/**
 * Typeahead/autocomplete с server-side filter через `(complete)` event.
 *
 * Panel рендерится через CDK Overlay (`[rtPopover]` trigger="manual" на input'е)
 * — открывается по набору текста (не click/hover), не обрезается overflow.
 * Подписчик получает `(complete)` с текущей строкой и сам грузит подсказки.
 *
 * CVA через общий `RtFormControlBase`. Generic `TItem` — тип подсказки и
 * selected value. Крестик (`clearable`) виден при непустом тексте — очищает и
 * текст, и выбранный объект. Keyboard-nav (activedescendant): ArrowUp/Down —
 * highlight, Enter — выбрать активную, Escape — закрыть. Home/End — deferred.
 */
@Component({
    selector: 'rt-autocomplete',
    templateUrl: './rt-autocomplete.component.html',
    styleUrl: './rt-autocomplete.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        NgTemplateOutlet,
        FormsModule,

        // standalone components / directives
        RtButtonDirective,
        RtEmptyStateComponent,
        RtIconButtonComponent,
        RtIconComponent,
        RtInputComponent,
        RtPopoverDirective,
        RtSpinnerComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    providers: [
        // Алиас базового токена — для contentChild(RtFormControlBase) в rt-field.
        { provide: RtFormControlBase, useExisting: forwardRef(() => RtAutocompleteComponent) },
    ],
    hostDirectives: [
        { directive: RtRadiusDirective, inputs: ['radius'] },
        { directive: RtSheetTemplatesDirective, inputs: ['sheetHeaderTemplate', 'sheetFooterTemplate'] },
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-autocomplete--open]': 'isOpen()',
        '[class.rt-autocomplete--disabled]': 'isDisabled()',
        '[class.rt-autocomplete--readonly]': 'isReadonly()',
        '[class.rt-autocomplete--invalid]': 'isInvalid()',
        '[class.rt-autocomplete--borderless]': '!bordered()',
        '[class.rt-autocomplete--size--sm]': "size() === 'sm'",
        '[class.rt-autocomplete--size--lg]': "size() === 'lg'",
    },
})
export class RtAutocompleteComponent<TItem> extends RtFormControlBase<TItem | null> {
    /** Длина списка, на которой конец уже сообщён: прокрутка у дна до новой страницы его не повторяет. */
    #endReportedAt: number = -1;

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly panelId: string = `rt-autocomplete-panel-${nextPanelId()}`;

    protected readonly popover: Signal<RtPopoverDirective> = viewChild.required(RtPopoverDirective);

    protected readonly fieldEl: Signal<ElementRef<HTMLInputElement> | undefined> = viewChild<ElementRef<HTMLInputElement>>('fieldEl');

    protected readonly inputText: WritableSignal<string> = signal<string>('');

    protected readonly isOpen: Signal<boolean> = computed((): boolean => this.popover().isOpen());

    /** Список откроется в нижней шторке: так решает нажатие на поле — по текущей ширине экрана. */
    protected readonly inSheet: Signal<boolean> = computed((): boolean => this.popover().inSheet());

    /** Список открыт в шторке: набор идёт в поле поиска наверху шторки, а не в поле под ней. Не меняется, пока шторка открыта. */
    protected readonly openedInSheet: Signal<boolean> = computed((): boolean => this.popover().openedInSheet());

    /** Подсказки рисуются карточками: список открыт в шторке, и вход `sheetCards` их не выключил. */
    protected readonly cards: Signal<boolean> = computed((): boolean => this.sheetCards() && this.openedInSheet());

    /** Поле поиска в шторке — ему отдаётся фокус, когда шторка открылась. */
    protected readonly sheetSearch: Signal<RtInputComponent | undefined> = viewChild(RtInputComponent);

    /** Клавиатура списка: подсветка, клавиши открытия, id для `aria-activedescendant`, прокрутка к опции. */
    protected readonly optionList: RtOptionList = new RtOptionList({
        panelId: (): string => this.panelId,
        isOpen: (): boolean => this.isOpen(),
        // Пока стоит ошибка, вариантов на экране нет: стрелки и Enter не выбирают скрытое.
        count: (): number => (this.loadError.shown() ? 0 : this.suggestions().length),
        chooseKeys: new Set<string>(['Enter']),
        sideKeys: false,
        edgeKeys: false,
    });

    protected readonly activeIndex: WritableSignal<number> = this.optionList.activeIndex;

    /** Идентификатор подсвеченной опции — тот же, что уходит в `aria-activedescendant`. */
    protected readonly activeOptionId: Signal<string | null> = this.optionList.activeOptionId;

    protected readonly hasValue: Signal<boolean> = computed((): boolean => this.inputText() !== '');

    /** Свой вид пустого результата директивой; сильнее входа `emptyTemplate`. */
    protected readonly emptySlot: Signal<RtAutocompleteEmptyDirective | undefined> = contentChild(RtAutocompleteEmptyDirective);

    /** Свой вид ошибки загрузки директивой. */
    protected readonly errorTemplate: Signal<RtAutocompleteErrorDirective | undefined> = contentChild(RtAutocompleteErrorDirective);

    /** Ошибка загрузки подсказок: заголовок, подсказка и контекст; после «Повторить» панель открыта. */
    protected readonly loadError: IRtLoadError.View = rtLoadErrorView(
        (): string | null => this.error(),
        (): string => this.errorDescription(),
        (): void => this.retry.emit()
    );

    public readonly displayText: Signal<string> = computed((): string => this.displayWith()(this.value()));

    public readonly suggestions: InputSignal<ReadonlyArray<TItem>> = input<ReadonlyArray<TItem>>([]);

    public readonly displayWith: InputSignal<(item: TItem | null) => string> = input<(item: TItem | null) => string>(
        (item: TItem | null): string => String(item ?? '')
    );

    public readonly placeholder: InputSignal<string> = input<string>('');

    /** На телефоне список открывается в нижней шторке с полем поиска; `false` оставляет его у поля. */
    public readonly sheet: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    /** Карточки в шторке: каждая подсказка — карточка. `false` возвращает строки, какими список стоит у поля. */
    public readonly sheetCards: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });
    /**
     * Со скольких букв запроса открываются подсказки. `undefined` пишет сигнальная форма, когда не
     * задала `minLength`: тогда — с первой буквы, как по умолчанию.
     */
    public readonly minLength: InputSignalWithTransform<number, number | undefined> = input<number, number | undefined>(
        RT_AUTOCOMPLETE_MIN_LENGTH,
        { transform: (value: number | undefined): number => value ?? RT_AUTOCOMPLETE_MIN_LENGTH }
    );

    /** Префикс-иконка слева в поле (например, `map` для поиска). */
    public readonly iconLeft: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);

    public readonly openOnFocus: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly itemTemplate: InputSignal<TemplateRef<{ $implicit: TItem }> | null> = input<TemplateRef<{ $implicit: TItem }> | null>(
        null
    );

    /**
     * Подсказки грузятся: в панели строка со спиннером — вместо пустого результата при первой загрузке
     * и под списком при подгрузке следующей страницы.
     */
    public readonly loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Свой текст пустого результата; `null` — подпись кита `uiNothingFound`. */
    public readonly emptyText: InputSignal<string | null> = input<string | null>(null);

    /** Своя разметка пустого результата; сильнее `emptyText`. Обстановка — набранная строка. */
    public readonly emptyTemplate: InputSignal<TemplateRef<{ $implicit: string }> | null> = input<TemplateRef<{
        $implicit: string;
    }> | null>(null);

    /**
     * Ошибка загрузки подсказок: не `null` — в панели вместо вариантов вид ошибки с кнопкой «Повторить».
     * Пустая строка — ошибка без своего текста, заголовок берётся из подписи кита.
     */
    public readonly error: InputSignal<string | null> = input<string | null>(null);

    /** Подсказка под заголовком ошибки; пусто — подпись кита `uiLoadErrorHint`. */
    public readonly errorDescription: InputSignal<string> = input<string>('');

    /** Нажата «Повторить»: повторить запрос подсказок — дело потребителя. */
    public readonly retry: OutputEmitterRef<void> = output<void>();

    /**
     * Панель долистали до конца — пора просить следующую страницу. Не приходит, пока идёт загрузка, и
     * приходит один раз на каждую длину списка: прокрутка у дна до прихода страницы её не повторяет.
     */
    public readonly scrolledToEnd: OutputEmitterRef<void> = output<void>();

    public readonly complete: OutputEmitterRef<IRtAutocomplete.CompleteEvent> = output<IRtAutocomplete.CompleteEvent>();

    public readonly itemSelect: OutputEmitterRef<TItem> = output<TItem>();

    public override writeValue(value: TItem | null): void {
        super.writeValue(value);
        this.inputText.set(this.displayWith()(this.value()));
    }

    public override setDisabledState(disabled: boolean): void {
        super.setDisabledState(disabled);
        if (disabled) {
            this.popover().close();
        }
    }

    protected getEmptyValue(): TItem | null {
        return null;
    }

    protected focusAfterClear(): void {
        // В шторке фокус в поле открыл бы шторку снова: нажатие на крестик только очищает.
        if (this.inSheet()) {
            return;
        }
        this.fieldEl()?.nativeElement.focus();
    }

    protected override clearValue(): void {
        super.clearValue();
        this.inputText.set('');
        this.#endReportedAt = -1;
    }

    protected onInput(event: Event): void {
        this.#search((event.target as HTMLInputElement).value, event);
    }

    /** Набор в поле поиска шторки: тот же запрос, но шторка не закрывается от короткого текста. */
    protected onSheetQuery(query: string): void {
        this.#search(query, new Event('input'));
    }

    /**
     * Шторка открылась и больше не `inert`: клавиатура уходит в поле поиска наверху, а не в поле под
     * шторкой. Раньше в закрытую шторку фокус не встаёт.
     */
    protected onSheetOpened(): void {
        this.sheetSearch()?.focus();
    }

    protected onFocus(): void {
        // На телефоне нажатие на поле открывает шторку сразу: набирают уже в ней.
        if (this.inSheet()) {
            this.fieldEl()?.nativeElement.blur();
            // Закрытая шторка возвращает фокус полю — это не нажатие: запрос и открытие не повторяются.
            if (this.isOpen()) {
                return;
            }
            // Запрос уходит, только когда текст не короче `minLength`, как у набора в поле; шторка открывается всегда.
            if (this.inputText().length >= this.minLength()) {
                this.complete.emit({ query: this.inputText(), originalEvent: new Event('focus') });
            }
            this.popover().open();
            return;
        }
        if (!this.openOnFocus()) {
            return;
        }
        this.complete.emit({ query: this.inputText(), originalEvent: new Event('focus') });
        this.popover().open();
    }

    protected onBlur(): void {
        // В шторке поле теряет фокус, когда его отдают поиску шторки: это не уход человека. Касание
        // ставит закрытие шторки.
        if (this.openedInSheet()) {
            return;
        }
        this.markTouched();
    }

    /** Прокрутка панели: у дна — сообщить, что пора следующая страница. */
    protected onPanelScroll(event: Event): void {
        const panel: HTMLElement = event.target as HTMLElement;
        const atEnd: boolean = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - END_THRESHOLD_PX;
        const length: number = this.suggestions().length;
        if (!atEnd || this.loading() || length === this.#endReportedAt) {
            return;
        }
        this.#endReportedAt = length;
        this.scrolledToEnd.emit();
    }

    protected onClosed(): void {
        this.activeIndex.set(-1);
        if (this.openedInSheet()) {
            this.markTouched();
        }
    }

    protected onSelect(item: TItem): void {
        this.value.set(item);
        this.inputText.set(this.displayWith()(item));
        this.emitChange(item);
        this.itemSelect.emit(item);
        this.popover().close();
    }

    protected onInputKeydown(event: KeyboardEvent): void {
        if (this.isDisabled()) {
            return;
        }
        const key: string = event.key;
        if (!this.isOpen()) {
            return;
        }
        const action: TRtOptionListAction = this.optionList.actionOf(key);
        if (action === 'none' || action === 'side') {
            return;
        }
        event.preventDefault();
        switch (action) {
            case 'next':
                this.optionList.move(1);
                break;
            case 'previous':
                this.optionList.move(-1);
                break;
            case 'choose':
                this.#selectActive();
                break;
            case 'close':
                // Escape закрывает один слой: панель. Без остановки событие всплывает до document,
                // и оверлей под панелью — боковая панель, окно — закрывается вместе с ней.
                event.stopPropagation();
                this.popover().close();
                break;
        }
    }

    #search(query: string, originalEvent: Event): void {
        this.inputText.set(query);
        this.activeIndex.set(-1);
        // Новый запрос — новый список: его первая страница той же длины, что прошлый список, снова
        // сообщает о дне, иначе подгрузка нового запроса не началась бы вовсе.
        this.#endReportedAt = -1;
        if (query.length >= this.minLength()) {
            this.complete.emit({ query, originalEvent });
            this.popover().open();
            return;
        }
        // Короткий запрос закрывает панель у поля; шторку он не закрывает — в ней набирают дальше.
        if (!this.openedInSheet()) {
            this.popover().close();
        }
    }

    #selectActive(): void {
        const items: ReadonlyArray<TItem> = this.suggestions();
        const index: number = this.activeIndex();
        // Подсветка могла остаться от вариантов до ошибки — выбирать её нельзя.
        if (!this.loadError.shown() && index >= 0 && index < items.length) {
            this.onSelect(items[index]);
        }
    }
}
