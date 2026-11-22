import { BooleanInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap, TRtKitLabelParams, rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { RtFormControlBase } from '@rt-tools/ui-kit-v2/form-control';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtInputComponent } from '@rt-tools/ui-kit-v2/input';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { RtPopoverDirective } from '@rt-tools/ui-kit-v2/popover';
import { IRtPopover } from '@rt-tools/ui-kit-v2/popover';
import { RtRadiusDirective } from '@rt-tools/ui-kit-v2/radius';
import { RtOptionList, TRtOptionListAction } from '@rt-tools/ui-kit-v2/core';
import {
    rtTreeBranchState,
    rtTreeFind,
    rtTreeIsTree,
    rtTreeLeaves,
    rtTreeOpenFor,
    rtTreeRows,
    rtTreeSideKey,
    rtTreeToggle,
} from '@rt-tools/ui-kit-v2/core';
import { RtSelectTriggerDirective } from '@rt-tools/ui-kit-v2/select';
import { RtMultiselectEmptyDirective } from './rt-multiselect-empty.directive';
import { IRtSelect } from '@rt-tools/ui-kit-v2/select';
import { RtTagComponent } from '@rt-tools/ui-kit-v2/tag';
import { RtToggleSwitchComponent } from '@rt-tools/ui-kit-v2/toggle-switch';
import { RtMultiselectLabelPipe } from './rt-multiselect-label.pipe';
import { IRtMultiselectSummary, TRtMultiselectLook, rtMultiselectKnownCount } from './rt-multiselect-toggles.logic';
import { RtMultiselectTogglesView } from './rt-multiselect-toggles.view';

const BEM_BLOCK: string = 'rt-multiselect';

let panelIdSeed: number = 0;

function nextPanelId(): number {
    panelIdSeed += 1;
    return panelIdSeed;
}

/**
 * Multi-select с chip-rendering выбранных значений в trigger.
 *
 * Панель — в CDK Overlay (`[rtPopover]`), после выбора не закрывается; CVA — общий
 * `RtFormControlBase`. Чипы закрываются поштучно, крестик (`clearable`) очищает всё.
 * Клавиши (activedescendant) — на trigger'е: стрелки, Home/End, Enter, Escape.
 */
@Component({
    selector: 'rt-multiselect',
    templateUrl: './rt-multiselect.component.html',
    styleUrl: './rt-multiselect.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        NgTemplateOutlet,
        FormsModule,

        // standalone components / directives
        RtButtonDirective,
        RtIconButtonComponent,
        RtIconComponent,
        RtInputComponent,
        RtPopoverDirective,
        RtTagComponent,
        RtToggleSwitchComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,

        // pipes
        RtMultiselectLabelPipe,
    ],
    providers: [
        // Алиас базового токена — для contentChild(RtFormControlBase) в rt-field.
        { provide: RtFormControlBase, useExisting: forwardRef(() => RtMultiselectComponent) },
    ],
    hostDirectives: [{ directive: RtRadiusDirective, inputs: ['radius'] }],
    host: {
        class: BEM_BLOCK,
        '[class.rt-multiselect--open]': 'isOpen()',
        '[class.rt-multiselect--disabled]': 'isDisabled()',
        '[class.rt-multiselect--readonly]': 'isReadonly()',
        '[class.rt-multiselect--invalid]': 'isInvalid()',
        '[class.rt-multiselect--borderless]': '!bordered()',
        '[class.rt-multiselect--size--sm]': "size() === 'sm'",
        '[class.rt-multiselect--size--lg]': "size() === 'lg'",
    },
})
export class RtMultiselectComponent<TValue> extends RtFormControlBase<ReadonlyArray<TValue>> {
    readonly #t_uiSelectValues: Signal<string> = rtKitLabel('uiSelectValues');
    readonly #t_uiSearch: Signal<string> = rtKitLabel('uiSearch');
    /** Вид `toggles`: что можно включить, сводка выбора и её подпись в поле — в файле рядом. */
    readonly #toggles: RtMultiselectTogglesView<TValue> = new RtMultiselectTogglesView<TValue>({
        options: (): ReadonlyArray<IRtSelect.Option<TValue>> => this.options(),
        value: (): ReadonlyArray<TValue> => this.value(),
        allText: (): string => this.allLabel() || this.t().uiAll,
        placeholder: (): string => this.placeholderText(),
    });

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly panelId: string = `rt-multiselect-panel-${nextPanelId()}`;

    protected readonly placeholderText: Signal<string> = computed((): string => this.placeholder() || this.#t_uiSelectValues());

    protected readonly filterPlaceholderText: Signal<string> = computed((): string => this.filterPlaceholder() || this.#t_uiSearch());

    /** Строка поиска над списком; живёт, пока открыта панель. */
    protected readonly filterTerm: WritableSignal<string> = signal<string>('');

    protected readonly popover: Signal<RtPopoverDirective> = viewChild.required(RtPopoverDirective);

    /** Список открыт в нижней шторке: под ним стоит подвал «Выбрано · Сбросить · Готово». */
    protected readonly openedInSheet: Signal<boolean> = computed((): boolean => this.popover().openedInSheet());

    /** «Выбрано: N» в подвале шторки — подпись с подстановкой, потому берётся вызовом. */
    protected readonly selectedLabel: Signal<string> = rtKitLabel(
        'uiSelectedCount',
        computed((): TRtKitLabelParams => ({ count: rtMultiselectKnownCount(this.options(), this.value()) }))
    );

    /** Есть ли что сбрасывать: отключённые и неизвестные значения «Сбросить» не снимает. */
    protected readonly canReset: Signal<boolean> = this.#toggles.canReset;

    protected readonly summary: Signal<IRtMultiselectSummary> = this.#toggles.summary;

    /** Сводка в поле вида `toggles`: всё включено — `allLabel`, часть — «N из M», ничего — подсказка. */
    protected readonly summaryText: Signal<string> = this.#toggles.text;

    protected readonly triggerEl: Signal<ElementRef<HTMLButtonElement> | undefined> = viewChild<ElementRef<HTMLButtonElement>>('triggerEl');

    /** Раскрытые ветки дерева. Живут, пока открыта панель: при открытии раскрыты ветки над выбранным. */
    protected readonly openBranches: WritableSignal<ReadonlySet<TValue>> = signal<ReadonlySet<TValue>>(new Set<TValue>());

    /** Дерево ли список: тогда у строк есть место под стрелку и отступ по уровню. */
    protected readonly isTree: Signal<boolean> = computed((): boolean => rtTreeIsTree(this.options()));

    /** Видимые строки: плоский список — как прежде, дерево — по раскрытым веткам; поиск оставляет совпавшие. */
    protected readonly rows: Signal<ReadonlyArray<IRtSelect.Row<TValue>>> = computed((): ReadonlyArray<IRtSelect.Row<TValue>> =>
        rtTreeRows(this.options(), this.openBranches(), this.filterTerm())
    );

    /** Флажок каждой строки: у листа — выбран ли он, у ветки — выведен из её включённых листьев. */
    protected readonly rowChecks: Signal<ReadonlyArray<IRtSelect.TBranchState>> = computed((): ReadonlyArray<IRtSelect.TBranchState> =>
        this.rows().map((row: IRtSelect.Row<TValue>): IRtSelect.TBranchState => this.#checkOf(row))
    );

    /**
     * Сдвиг строк в обходе стрелками: в виде `toggles` первым пунктом стоит «Показать все», и
     * индекс 0 — он, а строка `i` имеет индекс `i + 1`. В виде `list` сдвига нет.
     */
    protected readonly rowOffset: Signal<number> = computed((): number => (this.look() === 'toggles' ? 1 : 0));

    /** Подсвечена ли стрелками строка «Показать все». */
    protected readonly showAllActive: Signal<boolean> = computed((): boolean => this.rowOffset() === 1 && this.activeIndex() === 0);

    /** Идентификатор строки «Показать все» — тот же, что уходит в `aria-activedescendant`. */
    protected readonly showAllId: string = `${this.panelId}-opt-0`;

    protected readonly isOpen: Signal<boolean> = computed((): boolean => this.popover().isOpen());

    /** Клавиатура списка: подсветка, клавиши открытия, id для `aria-activedescendant`, прокрутка к опции. */
    protected readonly optionList: RtOptionList = new RtOptionList({
        panelId: (): string => this.panelId,
        isOpen: (): boolean => this.isOpen(),
        count: (): number => this.rows().length + this.rowOffset(),
        isDisabled: (index: number): boolean => Boolean(this.rows()[index - this.rowOffset()]?.option.disabled),
        chooseKeys: new Set<string>(['Enter', ' ']),
        sideKeys: true,
        edgeKeys: true,
    });

    protected readonly activeIndex: WritableSignal<number> = this.optionList.activeIndex;

    /** Идентификатор подсвеченной опции — тот же, что уходит в `aria-activedescendant`. */
    protected readonly activeOptionId: Signal<string | null> = this.optionList.activeOptionId;

    /**
     * Своя разметка указателя, если потребитель её объявил. Маркер тот же, что у выбора одного
     * значения: семьи отличаются только разметкой внутри кнопки.
     */
    protected readonly triggerTpl: Signal<RtSelectTriggerDirective<ReadonlyArray<TValue>> | undefined> =
        contentChild(RtSelectTriggerDirective);

    /** Свой вид пустого списка вариантов вместо строки «Нет вариантов». */
    protected readonly emptyTpl: Signal<RtMultiselectEmptyDirective | undefined> = contentChild(RtMultiselectEmptyDirective);

    protected readonly hasValue: Signal<boolean> = computed((): boolean => this.value().length > 0);

    protected readonly visibleChips: Signal<ReadonlyArray<TValue>> = computed((): ReadonlyArray<TValue> =>
        this.value().slice(0, this.maxChips())
    );

    protected readonly extraChipsCount: Signal<number> = computed((): number => Math.max(0, this.value().length - this.maxChips()));

    /** Три значения, которые кит отдаёт своей разметке указателя, и не больше. */
    protected readonly triggerState: Signal<IRtSelect.TriggerState<ReadonlyArray<TValue>>> = computed(
        (): IRtSelect.TriggerState<ReadonlyArray<TValue>> => ({
            isOpen: this.isOpen(),
            value: this.value(),
            label: this.displayText(),
            isDisabled: this.isDisabled(),
        })
    );

    public readonly displayText: Signal<string> = computed((): string =>
        this.value()
            .map((v: TValue): string => this.labelOf(v))
            .join(', ')
    );

    public readonly options: InputSignal<ReadonlyArray<IRtSelect.Option<TValue>>> = input<ReadonlyArray<IRtSelect.Option<TValue>>>([]);

    /** Пусто — берётся переведённая подпись по умолчанию */
    public readonly placeholder: InputSignal<string> = input<string>('');
    public readonly maxChips: InputSignal<number> = input<number>(3);

    /** Поле поиска над списком — у поля, в шторке и в обоих видах. */
    public readonly filter: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Пусто — берётся переведённая подпись по умолчанию */
    public readonly filterPlaceholder: InputSignal<string> = input<string>('');

    /** Иконка слева в указателе — та же, что у `rt-select`: перед подсказкой или чипами. */
    public readonly iconLeft: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);

    /**
     * Вид: `list` — флажки в списке и чипы в поле; `toggles` — переключатели справа в строках,
     * строка «Показать все» и место `[rtMultiselectExtra]` для своих переключателей приложения над
     * ними, а поле пишет сводку вместо чипов.
     */
    public readonly look: InputSignal<TRtMultiselectLook> = input<TRtMultiselectLook>('list');

    /** Сводка поля вида `toggles`, когда включено всё. Пусто — подпись кита «Все». */
    public readonly allLabel: InputSignal<string> = input<string>('');

    /**
     * Чем мерится панель. По умолчанию она не уже кнопки и дальше растёт по содержимому:
     * со своим указателем кнопка бывает узкой, и панель по её ширине давила бы содержимое.
     * `trigger` возвращает прежнее — ровно по кнопке, `auto` пускает панель по содержимому
     * целиком. Предел высоты назначается входом `panelMaxHeight`.
     */
    public readonly panelWidth: InputSignal<IRtPopover.Width> = input<IRtPopover.Width>('trigger-min');

    /**
     * Нижняя шторка на телефоне: на узком экране список открывается в ней, а не у поля, и выбор не
     * закрывает её. Включена по умолчанию; `false` оставляет список у поля на любой ширине.
     */
    public readonly sheet: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    /**
     * Предел высоты панели — длина как в стилях, например `20rem`. Пусто — предел кита
     * `--rt-input-panel-max-height`, и длинный список прокручивается внутри панели: без предела
     * он уходил за нижний край экрана, и пункты за краем были недостижимы. `none` снимает предел —
     * для короткого списка, который должен открываться целиком, без прокрутки. Значение ставится
     * на саму панель: она рисуется в наложении, вне поддерева блока.
     */
    public readonly panelMaxHeight: InputSignal<string | null> = input<string | null>(null);

    /**
     * Смена выбора человеком: пункт в панели (мышью или клавишами), снятый чип, крестик. Несёт тот
     * же массив, что уходит в форму; на `writeValue` и на модель формы, заданную снаружи, не
     * испускается.
     */
    public readonly selectionChange: OutputEmitterRef<ReadonlyArray<TValue>> = output<ReadonlyArray<TValue>>();

    public override setDisabledState(disabled: boolean): void {
        super.setDisabledState(disabled);
        if (disabled) {
            this.popover().close();
        }
    }

    /** Крестик: событие несёт значение поля после очистки — то же, что ушло в форму. */
    protected override clear(event?: Event): void {
        if (this.isDisabled()) {
            return;
        }
        super.clear(event);
        this.selectionChange.emit(this.value());
    }

    protected getEmptyValue(): ReadonlyArray<TValue> {
        return [];
    }

    protected focusAfterClear(): void {
        this.triggerEl()?.nativeElement.focus();
    }

    protected labelOf(value: TValue): string {
        return rtTreeFind(this.options(), value)?.label ?? String(value);
    }

    protected isSelected(value: TValue): boolean {
        return this.value().includes(value);
    }

    protected onOpened(): void {
        this.openBranches.set(rtTreeOpenFor(this.options(), this.value()));
    }

    protected toggleBranch(event: Event, value: TValue): void {
        event.stopPropagation();
        this.openBranches.update((open: ReadonlySet<TValue>): ReadonlySet<TValue> => rtTreeToggle(open, value));
    }

    protected onClosed(): void {
        this.filterTerm.set('');
        this.activeIndex.set(-1);
        this.markTouched();
    }

    protected setFilter(term: string): void {
        this.filterTerm.set(term);
        this.activeIndex.set(-1);
    }

    /**
     * Лист переключается сам. Ветка выбирает все свои включённые листья или снимает их, когда
     * выбраны все; своё значение ветки в выбор не пишется.
     */
    protected toggleOption(opt: IRtSelect.Option<TValue>): void {
        if (opt.disabled || this.isDisabled()) {
            return;
        }
        const leaves: ReadonlyArray<TValue> = rtTreeLeaves(opt);
        const current: ReadonlyArray<TValue> = this.value();
        const clearing: boolean = rtTreeBranchState(opt, current) === 'all';
        const next: ReadonlyArray<TValue> = clearing
            ? current.filter((v: TValue): boolean => !leaves.includes(v))
            : [...current, ...leaves.filter((leaf: TValue): boolean => !current.includes(leaf))];
        this.#commit(next);
    }

    /**
     * «Сбросить» в подвале шторки снимает весь выбор и оставляет шторку открытой: человек выбирает
     * заново. Крестик поля не годится — он возвращает фокус в поле под шторкой.
     */
    protected resetChoice(): void {
        if (this.isDisabled() || !this.canReset()) {
            return;
        }
        this.#commit(this.#toggles.resetNext());
    }

    /** «Показать все»: включено всё — снимает всё, иначе включает всё, что можно включить. */
    protected toggleAll(): void {
        if (this.isDisabled()) {
            return;
        }
        this.#commit(this.#toggles.toggleAllNext());
    }

    /** Пробел на строке «Показать все» переключает, а не прокручивает шторку. */
    protected onShowAllSpace(event: Event): void {
        event.preventDefault();
        this.toggleAll();
    }

    /** «Готово» в подвале шторки: выбор уже записан по каждому нажатию, кнопка только закрывает. */
    protected closeSheet(): void {
        this.popover().close();
    }

    protected removeChip(value: TValue, event: MouseEvent): void {
        event.stopPropagation();
        if (this.isDisabled()) {
            return;
        }
        const next: ReadonlyArray<TValue> = this.value().filter((v: TValue): boolean => v !== value);
        this.#commit(next);
    }

    protected onTriggerKeydown(event: KeyboardEvent): void {
        if (this.isDisabled()) {
            return;
        }
        if (!this.isOpen()) {
            if (this.optionList.opensBy(event.key)) {
                event.preventDefault();
                this.popover().open();
                this.optionList.move(1);
            }
            return;
        }
        this.#handleOpenKeydown(event);
    }

    /** Правка человека: значение поля, форма и событие получают один и тот же массив. */
    #commit(next: ReadonlyArray<TValue>): void {
        const value: ReadonlyArray<TValue> = [...next];
        this.value.set(value);
        this.emitChange(value);
        this.selectionChange.emit(value);
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
                this.#toggleActive();
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

    #checkOf(row: IRtSelect.Row<TValue>): IRtSelect.TBranchState {
        if (row.branch) {
            return rtTreeBranchState(row.option, this.value());
        }
        return this.value().includes(row.option.value) ? 'all' : 'none';
    }

    #sideKey(key: string): void {
        const offset: number = this.rowOffset();
        if (this.showAllActive()) {
            return;
        }
        const answer: IRtSelect.SideKeyAnswer<TValue> = rtTreeSideKey(this.rows(), this.activeIndex() - offset, key);
        const toggle: TValue | null = answer.toggle;
        if (toggle !== null) {
            this.openBranches.update((open: ReadonlySet<TValue>): ReadonlySet<TValue> => rtTreeToggle(open, toggle));
        }
        this.activeIndex.set(answer.index + offset);
    }

    #toggleActive(): void {
        const opts: ReadonlyArray<IRtSelect.Option<TValue>> = this.rows().map(
            (row: IRtSelect.Row<TValue>): IRtSelect.Option<TValue> => row.option
        );
        if (this.showAllActive()) {
            this.toggleAll();
            return;
        }
        const index: number = this.activeIndex() - this.rowOffset();
        if (index >= 0 && index < opts.length) {
            this.toggleOption(opts[index]);
        }
    }
}
