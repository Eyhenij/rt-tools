import { NgTemplateOutlet } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    computed,
    contentChild,
    inject,
    input,
    linkedSignal,
    model,
    output,
    viewChild,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Injector,
    InputSignal,
    InputSignalWithTransform,
    ModelSignal,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { rtKitLabel } from '../../i18n';
import { RtButtonDirective } from '../button/rt-button.directive';
import { RtIconComponent } from '../icon/rt-icon.component';
import { RtInputComponent } from '../input/rt-input.component';
import { RtToggleSwitchComponent } from '../toggle-switch/rt-toggle-switch.component';
import { RtTooltipDirective } from '../tooltip/rt-tooltip.directive';
import { RtHybridTreeComponent } from '../hybrid-tree/rt-hybrid-tree.component';
import { RtTreeComponent } from '../tree/rt-tree.component';
import { IRtTree } from '../tree/rt-tree.model';
import { RtTreeSelectorControlsDirective } from './rt-tree-selector.directives';
import { rtTreeSelectorCanApply, rtTreeSelectorClear, rtTreeSelectorFilter, rtTreeSelectorSame } from './rt-tree-selector.logic';
import { IRtTreeSelector } from './rt-tree-selector.model';

const BEM_BLOCK: string = 'rt-tree-selector';

/**
 * Выбор деревом с поиском: поле поиска, строка контролов и `rt-tree` под ними.
 *
 * Строки, отметки, клавиши и подсветку рисует `rt-tree`; селектор отбирает узлы по каждому слову
 * поиска и держит выбор. В прямой форме каждое изменение сразу пишется в `value`, в подтверждаемой —
 * копится в черновике до «Применить». Поле поиска не отдаёт фокус и передаёт клавиши дереву.
 */
@Component({
    selector: 'rt-tree-selector',
    templateUrl: './rt-tree-selector.component.html',
    styleUrl: './rt-tree-selector.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgTemplateOutlet,
        FormsModule,
        BlockDirective,
        ElemDirective,
        RtButtonDirective,
        RtIconComponent,
        RtInputComponent,
        RtToggleSwitchComponent,
        RtTooltipDirective,
        RtTreeComponent,
        RtHybridTreeComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class RtTreeSelectorComponent<TValue> {
    readonly #host: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly #injector: Injector = inject(Injector);

    protected readonly searchLabel: Signal<string> = rtKitLabel('dynamicSelectorSearch');
    protected readonly expandAllLabel: Signal<string> = rtKitLabel('uiExpandAll');
    protected readonly collapseAllLabel: Signal<string> = rtKitLabel('uiCollapseAll');
    protected readonly clearLabel: Signal<string> = rtKitLabel('uiClearSelection');
    protected readonly revertLabel: Signal<string> = rtKitLabel('uiRevertSelection');
    protected readonly multiLabel: Signal<string> = rtKitLabel('dynamicSelectorMulti');
    protected readonly multiHintLabel: Signal<string> = rtKitLabel('dynamicSelectorMultiHint');
    protected readonly cancelLabel: Signal<string> = rtKitLabel('uiCancel');
    protected readonly applyLabel: Signal<string> = rtKitLabel('uiApply');
    protected readonly nothingFoundLabel: Signal<string> = rtKitLabel('uiNothingFound');

    /** Гибридное ли дерево внутри. Ставит его наследник `rt-hybrid-tree-selector`. */
    protected readonly hybrid: boolean = false;

    protected readonly plainTree: Signal<RtTreeComponent<TValue> | undefined> = viewChild<RtTreeComponent<TValue>>(RtTreeComponent);

    protected readonly hybridTree: Signal<RtHybridTreeComponent<TValue> | undefined> =
        viewChild<RtHybridTreeComponent<TValue>>(RtHybridTreeComponent);

    /** Дерево внутри, какое бы ни стояло: у гибридного те же раскрытие и клавиши. */
    protected readonly tree: Signal<RtTreeComponent<TValue> | undefined> = computed(
        (): RtTreeComponent<TValue> | undefined => this.hybridTree() ?? this.plainTree()
    );

    protected readonly controlsTpl: Signal<RtTreeSelectorControlsDirective | undefined> = contentChild(RtTreeSelectorControlsDirective);

    /** Строка поиска: начинается с `searchTerm` и дальше живёт от набора в поле. */
    protected readonly term: WritableSignal<string> = linkedSignal((): string => this.searchTerm());

    /** Включён ли множественный выбор: без переключателя клик всегда добавляет. */
    protected readonly multiOn: WritableSignal<boolean> = linkedSignal((): boolean => this.multiDefault());

    /** Черновик выбора: начинается с выбора и сбрасывается к нему при каждой смене выбора снаружи. */
    protected readonly draft: WritableSignal<ReadonlyArray<TValue>> = linkedSignal((): ReadonlyArray<TValue> => this.value());

    protected readonly shownNodes: Signal<ReadonlyArray<IRtTree.Node<TValue>>> = computed((): ReadonlyArray<IRtTree.Node<TValue>> =>
        rtTreeSelectorFilter(this.nodes(), this.term())
    );

    protected readonly hasRows: Signal<boolean> = computed((): boolean => this.shownNodes().length > 0);

    /** Поиск ничего не нашёл. Дереву ушёл бы пустой список, и оно написало бы «нет вариантов». */
    protected readonly isNothingFound: Signal<boolean> = computed((): boolean => !this.hasRows() && this.nodes().length > 0);

    protected readonly isExpandShown: Signal<boolean> = computed((): boolean => this.expandControls() && this.hasRows());

    /** Откат стоит только в подтверждаемой форме: в прямой выбор уже записан, откатывать не к чему. */
    protected readonly isRevertShown: Signal<boolean> = computed(
        (): boolean => this.revertable() && this.confirm() && this.mode() !== 'none'
    );

    protected readonly isDraftChanged: Signal<boolean> = computed((): boolean => !rtTreeSelectorSame(this.draft(), this.value()));

    protected readonly isMultiToggleShown: Signal<boolean> = computed((): boolean => this.multiToggle() && this.mode() === 'multiple');

    protected readonly isExclusive: Signal<boolean> = computed((): boolean => this.isMultiToggleShown() && !this.multiOn());

    protected readonly isClearShown: Signal<boolean> = computed(
        (): boolean => this.clearable() && this.mode() !== 'none' && this.draft().length > 0
    );

    protected readonly isFooterShown: Signal<boolean> = computed((): boolean => this.confirm() && this.footer());

    public readonly nodes: InputSignal<ReadonlyArray<IRtTree.Node<TValue>>> = input.required<ReadonlyArray<IRtTree.Node<TValue>>>();
    public readonly value: ModelSignal<ReadonlyArray<TValue>> = model<ReadonlyArray<TValue>>([]);
    public readonly mode: InputSignal<IRtTree.Mode> = input<IRtTree.Mode>('multiple');
    public readonly cascade: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, { transform: booleanAttribute });
    public readonly branchMarks: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    public readonly selectAll: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    /** Подтверждаемая форма: выбор копится в черновике и уходит по «Применить». */
    public readonly confirm: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, { transform: booleanAttribute });
    /** Свой подвал с «Отмена» и «Применить». Без него приложение зовёт `apply()` и `cancel()` само. */
    public readonly footer: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, { transform: booleanAttribute });
    public readonly emptyAllowed: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    /** Иконочные кнопки «Развернуть всё» и «Свернуть всё». */
    public readonly expandControls: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly clearable: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    /** Иконочная кнопка «Откатить выбор»: возвращает черновик к выбору, не закрывая селектор. */
    public readonly revertable: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly multiToggle: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    /** С чего начинает переключатель множественного выбора. */
    public readonly multiDefault: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly expandOnStart: InputSignal<IRtTreeSelector.ExpandOnStart> = input<IRtTreeSelector.ExpandOnStart>('chosen');
    public readonly label: InputSignal<string> = input<string>('');
    /** Начальная строка поиска. */
    public readonly searchTerm: InputSignal<string> = input<string>('');
    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);
    /** Выключенный селектор не меняет выбор: поле поиска, кнопки, переключатель, дерево и подвал выключены. */
    public readonly disabled: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });

    public readonly applied: OutputEmitterRef<ReadonlyArray<TValue>> = output<ReadonlyArray<TValue>>();
    public readonly cancelled: OutputEmitterRef<void> = output<void>();

    /** Можно ли применить черновик: он отличается от выбора и не пуст там, где пустой запрещён. */
    public readonly canApply: Signal<boolean> = computed(
        (): boolean => !this.disabled() && rtTreeSelectorCanApply(this.draft(), this.value(), this.emptyAllowed())
    );

    constructor() {
        afterNextRender((): void => {
            if (!this.disabled()) {
                this.#host.nativeElement.querySelector<HTMLInputElement>('.rt-tree-selector__search input')?.focus();
            }
            this.#expandOnStart();
        });
    }

    public apply(): void {
        if (!this.canApply()) {
            return;
        }
        const next: ReadonlyArray<TValue> = [...this.draft()];
        this.value.set(next);
        this.applied.emit(next);
    }

    public cancel(): void {
        this.draft.set(this.value());
        this.cancelled.emit();
    }

    protected onTerm(term: string): void {
        this.term.set(term);
        if (term.trim() !== '') {
            afterNextRender((): void => this.tree()?.expandAll(), { injector: this.#injector });
        }
    }

    protected onSearchKeydown(event: KeyboardEvent): void {
        this.tree()?.handleKeydown(event);
    }

    protected onTreeChange(next: ReadonlyArray<TValue>): void {
        this.#write(next);
    }

    /** Enter в выборе одного узла подтверждает: новый узел применяется, тот же — закрывает без изменений. */
    protected onPicked(): void {
        if (!this.confirm() || this.mode() !== 'single') {
            return;
        }
        if (this.canApply()) {
            this.apply();
            return;
        }
        this.cancel();
    }

    protected onClear(): void {
        this.#write(rtTreeSelectorClear(this.nodes(), this.draft()));
    }

    protected onRevert(): void {
        this.draft.set(this.value());
    }

    protected expandAll(): void {
        this.tree()?.expandAll();
    }

    protected collapseAll(): void {
        this.tree()?.collapseAll();
    }

    protected onMultiToggle(on: boolean): void {
        this.multiOn.set(on);
    }

    #write(next: ReadonlyArray<TValue>): void {
        this.draft.set(next);
        if (!this.confirm()) {
            this.value.set(next);
        }
    }

    #expandOnStart(): void {
        const start: IRtTreeSelector.ExpandOnStart = this.expandOnStart();
        if (start === 'all' || this.term().trim() !== '') {
            this.tree()?.expandAll();
            return;
        }
        if (start === 'none') {
            this.tree()?.collapseAll();
        }
    }
}
