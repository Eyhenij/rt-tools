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
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap, rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { rtNotchWidth, RtFormControlBase } from '@rt-tools/ui-kit-v2/form-control';
import { IRtInput } from '@rt-tools/ui-kit-v2/core';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RtInputComponent } from '@rt-tools/ui-kit-v2/input';
import { RtPopoverDirective } from '@rt-tools/ui-kit-v2/popover';
import { IRtPopover } from '@rt-tools/ui-kit-v2/popover';
import { RtRadiusDirective } from '@rt-tools/ui-kit-v2/radius';
import { RtOptionList, TRtOptionListAction } from '@rt-tools/ui-kit-v2/core';
import { rtTreeFind, rtTreeIsTree, rtTreeOpenFor, rtTreeRows, rtTreeSideKey, rtTreeToggle } from '@rt-tools/ui-kit-v2/core';
import { RtSelectOptionDirective } from './rt-select-option.directive';
import { RtSelectTriggerDirective } from './rt-select-trigger.directive';
import { IRtSelect } from './rt-select.model';

const BEM_BLOCK: string = 'rt-select';

/** Клавиши, открывающие закрытый dropdown с фокуса на trigger'е. */

type TBooleanInput = boolean | string;

let panelIdSeed: number = 0;

function nextPanelId(): number {
    panelIdSeed += 1;
    return panelIdSeed;
}

/**
 * Single-select dropdown с опциональным filter input.
 *
 * Panel рендерится через CDK Overlay (директива `[rtPopover]` на trigger'е) —
 * не обрезается `overflow: hidden` предками (таблицы, aside, карточки) и
 * авто-flip'ается у края viewport. CVA через общий `RtFormControlBase`. Крестик
 * (`clearable`) слева от шеврона — виден при наличии значения, очищает выбор.
 *
 * Keyboard-nav (activedescendant): фокус на trigger'е, ArrowUp/Down двигают
 * виртуальный highlight (`aria-activedescendant`), Enter выбирает, Escape
 * закрывает. Home/End/typeahead — deferred.
 */
@Component({
    selector: 'rt-select',
    templateUrl: './rt-select.component.html',
    styleUrls: ['./rt-select.component.scss', './rt-select-floating-label.scss', './rt-select-clear.scss', './rt-select-material.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        FormsModule,
        NgTemplateOutlet,

        // standalone components / directives
        RtIconButtonComponent,
        RtIconComponent,
        RtInputComponent,
        RtPopoverDirective,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    providers: [
        // Алиас базового токена — для contentChild(RtFormControlBase) в rt-field.
        { provide: RtFormControlBase, useExisting: forwardRef(() => RtSelectComponent) },
    ],
    hostDirectives: [{ directive: RtRadiusDirective, inputs: ['radius'] }],
    host: {
        class: BEM_BLOCK,
        '[class.rt-select--open]': 'isOpen()',
        '[class.rt-select--disabled]': 'isDisabled()',
        '[class.rt-select--readonly]': 'isReadonly()',
        '[class.rt-select--invalid]': 'isInvalid()',
        '[class.rt-select--borderless]': '!bordered()',
        '[class.rt-select--appearance--fill]': "appearance() === 'fill'",
        '[class.rt-select--size--sm]': "size() === 'sm'",
        '[class.rt-select--size--lg]': "size() === 'lg'",
        '[class.rt-select--with-icon-left]': '!!iconLeft()',
        '[class.rt-select--floating]': '!!floatingLabel()',
        '[style.--rt-select-notch-width]': "notchWidth() + 'px'",
        '[class.rt-select--filled]': 'hasValue()',
    },
})
export class RtSelectComponent<TValue> extends RtFormControlBase<TValue | null> {
    readonly #t_uiSearch: Signal<string> = rtKitLabel('uiSearch');

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly panelId: string = `rt-select-panel-${nextPanelId()}`;

    protected readonly filterPlaceholderText: Signal<string> = computed((): string => this.filterPlaceholder() || this.#t_uiSearch());

    protected readonly popover: Signal<RtPopoverDirective> = viewChild.required(RtPopoverDirective);

    protected readonly triggerEl: Signal<ElementRef<HTMLButtonElement> | undefined> = viewChild<ElementRef<HTMLButtonElement>>('triggerEl');

    /** Подпись на рамке: по её ширине материальный набор вырезает разрыв в рамке. `#`-поле `viewChild` не принимает. */
    protected readonly floatingLabelEl: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('floatingLabelEl');

    /** Ширина подписи на рамке, px. */
    protected readonly notchWidth: Signal<number> = rtNotchWidth(this.floatingLabelEl);

    protected readonly filterTerm: WritableSignal<string> = signal<string>('');
    /** Раскрытые ветки дерева. Живут, пока открыта панель: при открытии раскрыты ветки над выбранным. */
    protected readonly openBranches: WritableSignal<ReadonlySet<TValue>> = signal<ReadonlySet<TValue>>(new Set<TValue>());

    protected readonly isOpen: Signal<boolean> = computed((): boolean => this.popover().isOpen());

    /** Клавиатура списка: подсветка, клавиши открытия, id для `aria-activedescendant`, прокрутка к опции. */
    protected readonly optionList: RtOptionList = new RtOptionList({
        panelId: (): string => this.panelId,
        isOpen: (): boolean => this.isOpen(),
        count: (): number => this.rows().length,
        isDisabled: (index: number): boolean => Boolean(this.rows()[index]?.option.disabled),
        chooseKeys: new Set<string>(['Enter', ' ']),
        sideKeys: true,
        edgeKeys: true,
    });

    protected readonly activeIndex: WritableSignal<number> = this.optionList.activeIndex;

    /** Идентификатор подсвеченной опции — тот же, что уходит в `aria-activedescendant`. */
    protected readonly activeOptionId: Signal<string | null> = this.optionList.activeOptionId;

    /**
     * Своя разметка указателя, если потребитель её объявил. Не объявил — кит рисует свою, и ни один
     * нынешний потребитель не двигается.
     */
    protected readonly triggerTpl: Signal<RtSelectTriggerDirective<TValue> | undefined> = contentChild(RtSelectTriggerDirective);

    /** Своя разметка строки списка; не объявлена — строка рисует подпись опции. */
    protected readonly optionTpl: Signal<RtSelectOptionDirective<TValue> | undefined> = contentChild(RtSelectOptionDirective);

    protected readonly hasValue: Signal<boolean> = computed((): boolean => this.value() !== null);

    /** Id подписи на рамке: на него ссылается `aria-labelledby` указателя. */
    protected readonly floatingLabelId: string = `${this.panelId}-label`;

    /** Id текста выбранного значения в указателе: его имя читает скринридер вслед за подписью. */
    protected readonly valueTextId: string = `${this.panelId}-value`;

    /**
     * Подпись на рамке называет указатель, только когда явного `ariaLabel` нет. Ссылка заменяет имя
     * из содержимого кнопки, поэтому за подписью идёт и выбранное значение — иначе скринридер
     * назвал бы поле без того, что в нём выбрано.
     */
    protected readonly labelledBy: Signal<string | null> = computed((): string | null =>
        this.floatingLabel() && !this.ariaLabel() ? `${this.floatingLabelId} ${this.valueTextId}` : null
    );

    /** Выбранная опция: по ней указатель рисует подпись или ту же разметку строки, что и список. */
    protected readonly selectedOption: Signal<IRtSelect.Option<TValue> | null> = computed((): IRtSelect.Option<TValue> | null => {
        const v: TValue | null = this.value();
        return v === null ? null : (rtTreeFind(this.options(), v) ?? null);
    });

    /** Разметка выбранного в указателе — шаблон строки с выбранной опцией; без шаблона или выбора её нет. */
    protected readonly chosenOwn: Signal<IRtSelect.ChosenView<TValue> | null> = computed((): IRtSelect.ChosenView<TValue> | null => {
        const tpl: RtSelectOptionDirective<TValue> | undefined = this.optionTpl();
        const option: IRtSelect.Option<TValue> | null = this.selectedOption();
        return tpl && option ? { templateRef: tpl.templateRef, context: { $implicit: option, selected: true } } : null;
    });

    protected readonly selectedLabel: Signal<string> = computed((): string => this.selectedOption()?.label ?? '');

    /** Дерево ли список: тогда у строк есть место под стрелку и отступ по уровню. */
    protected readonly isTree: Signal<boolean> = computed((): boolean => rtTreeIsTree(this.options()));

    /** Видимые строки: плоский список — как прежде, дерево — по раскрытым веткам и поисковому слову. */
    protected readonly rows: Signal<ReadonlyArray<IRtSelect.Row<TValue>>> = computed((): ReadonlyArray<IRtSelect.Row<TValue>> =>
        rtTreeRows(this.options(), this.openBranches(), this.filterTerm())
    );

    /** Три значения, которые кит отдаёт своей разметке указателя, и не больше. */
    protected readonly triggerState: Signal<IRtSelect.TriggerState<TValue>> = computed((): IRtSelect.TriggerState<TValue> => ({
        isOpen: this.isOpen(),
        value: this.value(),
        label: this.selectedLabel(),
        isDisabled: this.isDisabled(),
    }));

    /** Вид рамки: `outline` — рамка со всех сторон, `fill` — залитое поле с чертой снизу. */
    public override readonly fieldLabelInside: boolean = true;
    public readonly appearance: InputSignal<IRtInput.Appearance> = input<IRtInput.Appearance>('outline');

    public readonly displayText: Signal<string> = computed((): string => this.selectedLabel());

    public readonly options: InputSignal<ReadonlyArray<IRtSelect.Option<TValue>>> = input<ReadonlyArray<IRtSelect.Option<TValue>>>([]);

    public readonly placeholder: InputSignal<string> = input<string>('');

    public readonly iconLeft: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);

    /**
     * Видимая подпись на рамке. Пока ничего не выбрано и список закрыт, лежит на месте подсказки;
     * при выбранном значении или открытом списке поднимается на верхнюю рамку. `null` — подписи нет.
     */
    public readonly floatingLabel: InputSignal<string | null> = input<string | null>(null);

    public readonly filter: InputSignalWithTransform<boolean, TBooleanInput> = input<boolean, TBooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Пусто — берётся переведённая подпись по умолчанию */
    public readonly filterPlaceholder: InputSignal<string> = input<string>('');

    /**
     * Чем мерится панель. По умолчанию она не уже кнопки и дальше растёт по содержимому:
     * со своим указателем кнопка бывает узкой, и панель по её ширине давила бы содержимое.
     * `trigger` возвращает прежнее — ровно по кнопке, `auto` пускает панель по содержимому
     * целиком. Предел высоты назначается входом `panelMaxHeight`.
     */
    public readonly panelWidth: InputSignal<IRtPopover.Width> = input<IRtPopover.Width>('trigger-min');

    /**
     * Предел высоты панели — длина как в стилях, например `20rem`. Пусто — предел кита
     * `--rt-input-panel-max-height`, и длинный список прокручивается внутри панели: без предела
     * он уходил за нижний край экрана, и пункты за краем были недостижимы. `none` снимает предел —
     * для короткого списка, который должен открываться целиком, без прокрутки. Значение ставится
     * на саму панель: она рисуется в наложении, вне поддерева блока.
     */
    public readonly panelMaxHeight: InputSignal<string | null> = input<string | null>(null);

    public readonly selectionChange: OutputEmitterRef<TValue | null> = output<TValue | null>();

    public override setDisabledState(disabled: boolean): void {
        super.setDisabledState(disabled);
        if (disabled) {
            this.popover().close();
        }
    }

    protected getEmptyValue(): TValue | null {
        return null;
    }

    protected focusAfterClear(): void {
        this.triggerEl()?.nativeElement.focus();
    }

    protected override clear(event?: Event): void {
        if (this.isDisabled()) {
            return;
        }
        super.clear(event);
        this.selectionChange.emit(null);
    }

    /**
     * Открытый список встаёт подсветкой на выбранный пункт.
     *
     * Иначе стрелка вниз начинала с первого пункта, и человек с выбранным «20» из «10, 20, 40»
     * получал «10» вместо «40».
     */
    protected onOpened(): void {
        const v: TValue | null = this.value();
        this.openBranches.set(rtTreeOpenFor(this.options(), v === null ? [] : [v]));
        if (v !== null) {
            const chosen: number = this.rows().findIndex((row: IRtSelect.Row<TValue>): boolean => row.option.value === v);
            if (chosen >= 0) {
                this.activeIndex.set(chosen);
            }
        }
    }

    protected toggleBranch(event: Event, value: TValue): void {
        event.stopPropagation();
        this.openBranches.update((open: ReadonlySet<TValue>): ReadonlySet<TValue> => rtTreeToggle(open, value));
    }

    protected onClosed(): void {
        // Закрытие (outside-click / Escape / выбор) = пользователь увёл фокус.
        this.filterTerm.set('');
        this.activeIndex.set(-1);
        this.markTouched();
    }

    protected select(opt: IRtSelect.Option<TValue>): void {
        if (opt.disabled) {
            return;
        }
        this.value.set(opt.value);
        this.emitChange(opt.value);
        this.selectionChange.emit(opt.value);
        this.popover().close();
    }

    protected setFilter(term: string): void {
        this.filterTerm.set(term);
        this.activeIndex.set(-1);
    }

    protected onTriggerKeydown(event: KeyboardEvent): void {
        if (this.isDisabled()) {
            return;
        }
        if (!this.isOpen()) {
            if (this.optionList.opensBy(event.key)) {
                event.preventDefault();
                this.popover().open();
                if (this.activeIndex() < 0) {
                    this.optionList.move(1);
                }
            }
            return;
        }
        this.#handleOpenKeydown(event);
    }

    #handleOpenKeydown(event: KeyboardEvent): void {
        const action: TRtOptionListAction = this.optionList.actionOf(event.key);
        if (action === 'none') {
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
            case 'first':
                this.optionList.first();
                break;
            case 'last':
                this.optionList.last();
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
            case 'side':
                this.#sideKey(event.key);
                break;
        }
    }

    #sideKey(key: string): void {
        const answer: IRtSelect.SideKeyAnswer<TValue> = rtTreeSideKey(this.rows(), this.activeIndex(), key);
        const toggle: TValue | null = answer.toggle;
        if (toggle !== null) {
            this.openBranches.update((open: ReadonlySet<TValue>): ReadonlySet<TValue> => rtTreeToggle(open, toggle));
        }
        this.activeIndex.set(answer.index);
    }

    #selectActive(): void {
        const opts: ReadonlyArray<IRtSelect.Option<TValue>> = this.rows().map(
            (row: IRtSelect.Row<TValue>): IRtSelect.Option<TValue> => row.option
        );
        const index: number = this.activeIndex();
        if (index >= 0 && index < opts.length) {
            this.select(opts[index]);
        }
    }
}
