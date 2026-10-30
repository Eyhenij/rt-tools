import { BooleanInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    computed,
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

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';
import { RtFormControlBase } from '@rt-tools/ui-kit-v2/form-control';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RtSpinnerComponent } from '@rt-tools/ui-kit-v2/spinner';
import { RtPopoverDirective } from '@rt-tools/ui-kit-v2/popover';
import { RtRadiusDirective } from '@rt-tools/ui-kit-v2/radius';
import { RtOptionList, TRtOptionListAction } from '@rt-tools/ui-kit-v2/core';
import { IRtAutocomplete } from './rt-autocomplete.model';

/** Сколько точек до дна панели уже считается концом списка. */
const END_THRESHOLD_PX: number = 8;

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

        // standalone components / directives
        RtIconButtonComponent,
        RtIconComponent,
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
    hostDirectives: [{ directive: RtRadiusDirective, inputs: ['radius'] }],
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

    /** Клавиатура списка: подсветка, клавиши открытия, id для `aria-activedescendant`, прокрутка к опции. */
    protected readonly optionList: RtOptionList = new RtOptionList({
        panelId: (): string => this.panelId,
        isOpen: (): boolean => this.isOpen(),
        count: (): number => this.suggestions().length,
        chooseKeys: new Set<string>(['Enter']),
        sideKeys: false,
        edgeKeys: false,
    });

    protected readonly activeIndex: WritableSignal<number> = this.optionList.activeIndex;

    /** Идентификатор подсвеченной опции — тот же, что уходит в `aria-activedescendant`. */
    protected readonly activeOptionId: Signal<string | null> = this.optionList.activeOptionId;

    protected readonly hasValue: Signal<boolean> = computed((): boolean => this.inputText() !== '');

    public readonly displayText: Signal<string> = computed((): string => this.displayWith()(this.value()));

    public readonly suggestions: InputSignal<ReadonlyArray<TItem>> = input<ReadonlyArray<TItem>>([]);

    public readonly displayWith: InputSignal<(item: TItem | null) => string> = input<(item: TItem | null) => string>(
        (item: TItem | null): string => String(item ?? '')
    );

    public readonly placeholder: InputSignal<string> = input<string>('');
    public readonly minLength: InputSignal<number> = input<number>(1);

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
        this.fieldEl()?.nativeElement.focus();
    }

    protected override clearValue(): void {
        super.clearValue();
        this.inputText.set('');
        this.#endReportedAt = -1;
    }

    protected onInput(event: Event): void {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        const query: string = target.value;
        this.inputText.set(query);
        this.activeIndex.set(-1);
        // Новый запрос — новый список: его первая страница той же длины, что прошлый список, снова
        // сообщает о дне, иначе подгрузка нового запроса не началась бы вовсе.
        this.#endReportedAt = -1;
        if (query.length >= this.minLength()) {
            this.complete.emit({ query, originalEvent: event });
            this.popover().open();
        } else {
            this.popover().close();
        }
    }

    protected onFocus(): void {
        if (!this.openOnFocus()) {
            return;
        }
        this.complete.emit({ query: this.inputText(), originalEvent: new Event('focus') });
        this.popover().open();
    }

    protected onBlur(): void {
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

    #selectActive(): void {
        const items: ReadonlyArray<TItem> = this.suggestions();
        const index: number = this.activeIndex();
        if (index >= 0 && index < items.length) {
            this.onSelect(items[index]);
        }
    }
}
