import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    computed,
    contentChild,
    inject,
    input,
    model,
    output,
    signal,
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    ModelSignal,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap } from '../../i18n';
import { RtCheckboxComponent } from '../checkbox/rt-checkbox.component';
import { RtIconComponent } from '../icon/rt-icon.component';
import { RtRadioButtonComponent } from '../radio-button/rt-radio-button.component';
import { RtTagComponent } from '../tag/rt-tag.component';
import { RtTooltipDirective } from '../tooltip/rt-tooltip.directive';
import { rtTreeOpenFor, rtTreeRows, rtTreeSideKey, rtTreeToggle } from '../select/rt-select-tree';
import { IRtSelect } from '../select/rt-select.model';
import { RtTreeNodeEndDirective, RtTreeNodeMetaDirective } from './rt-tree.directives';
import { rtTreeChoose, rtTreeChooseAlone, rtTreeLabelParts, rtTreeMark, rtTreeSelectAll, rtTreeSelectAllMark } from './rt-tree.logic';
import { IRtTree } from './rt-tree.model';

const BEM_BLOCK: string = 'rt-tree';

/** Видимая строка с тем, что разметке нужно о ней знать. */
interface IRtTreeView<TValue> {
    readonly row: IRtTree.Row<TValue>;
    readonly mark: IRtTree.Mark;
    /** Рисуется ли у строки флажок или радио: у групп без отметок его нет. */
    readonly marked: boolean;
    readonly parts: IRtTree.LabelParts;
    readonly highlighted: boolean;
}

/**
 * Дерево выбора, стоящее на странице само по себе.
 *
 * Строки, листья, отметки ветвей, отбор по слову и боковые стрелки считает модуль дерева выбора
 * из списка — тот же, что у `rt-select` и `rt-multiselect`. Выбор живёт в `value`; узлы не
 * меняются. Раскрытые ветки и подсвеченная строка — состояние самого дерева.
 *
 * Клавиатура идёт через `handleKeydown`: его зовёт и само дерево с фокуса на себе, и приложение
 * со своего поля поиска. Ответ — взята ли клавиша: чужую дерево не трогает.
 */
@Component({
    selector: 'rt-tree',
    templateUrl: './rt-tree.component.html',
    styleUrl: './rt-tree.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgTemplateOutlet,
        FormsModule,
        RtCheckboxComponent,
        RtIconComponent,
        RtRadioButtonComponent,
        RtTagComponent,
        RtTooltipDirective,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
        role: 'tree',
        tabindex: '0',
        '[attr.aria-label]': 'ariaLabel()',
        '[attr.aria-multiselectable]': "mode() === 'multiple'",
        '(keydown)': 'handleKeydown($event)',
    },
})
export class RtTreeComponent<TValue> {
    readonly #open: WritableSignal<ReadonlySet<TValue> | null> = signal<ReadonlySet<TValue> | null>(null);
    readonly #highlighted: WritableSignal<TValue | null> = signal<TValue | null>(null);

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly nodeEnd: Signal<RtTreeNodeEndDirective<TValue> | undefined> = contentChild(RtTreeNodeEndDirective);

    protected readonly nodeMeta: Signal<RtTreeNodeMetaDirective<TValue> | undefined> = contentChild(RtTreeNodeMetaDirective);

    /** Раскрытые ветки: до первого действия человека — ветки над выбранным. */
    protected readonly openBranches: Signal<ReadonlySet<TValue>> = computed(
        (): ReadonlySet<TValue> => this.#open() ?? rtTreeOpenFor(this.nodes(), this.value())
    );

    protected readonly rows: Signal<ReadonlyArray<IRtTree.Row<TValue>>> = computed((): ReadonlyArray<IRtTree.Row<TValue>> =>
        rtTreeRows(this.nodes(), this.openBranches(), this.filter() ? this.searchTerm() : '')
    );

    protected readonly views: Signal<ReadonlyArray<IRtTreeView<TValue>>> = computed((): ReadonlyArray<IRtTreeView<TValue>> => {
        const value: ReadonlyArray<TValue> = this.value();
        const cascade: boolean = this.cascade();
        const term: string = this.searchTerm();
        const highlighted: TValue | null = this.#highlighted();
        const mode: IRtTree.Mode = this.mode();
        const branchMarks: boolean = this.branchMarks();
        return this.rows().map((row: IRtTree.Row<TValue>): IRtTreeView<TValue> => ({
            row,
            mark: rtTreeMark(row.option, value, cascade),
            marked: mode !== 'none' && (branchMarks || !row.branch),
            parts: rtTreeLabelParts(row.option, term),
            highlighted: row.option.value === highlighted,
        }));
    });

    protected readonly selectAllMark: Signal<IRtTree.Mark> = computed((): IRtTree.Mark => rtTreeSelectAllMark(this.rows(), this.value()));

    protected readonly isSelectAllShown: Signal<boolean> = computed(
        (): boolean => this.showSelectAll() && this.cascade() && this.mode() === 'multiple' && this.rows().length > 0
    );

    protected readonly emptyText: Signal<string> = computed((): string =>
        this.nodes().length > 0 ? this.t().uiNothingFound : this.t().uiNoOptions
    );

    public readonly nodes: InputSignal<ReadonlyArray<IRtTree.Node<TValue>>> = input.required<ReadonlyArray<IRtTree.Node<TValue>>>();
    public readonly value: ModelSignal<ReadonlyArray<TValue>> = model<ReadonlyArray<TValue>>([]);
    public readonly mode: InputSignal<IRtTree.Mode> = input<IRtTree.Mode>('multiple');
    public readonly cascade: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, { transform: booleanAttribute });
    public readonly searchTerm: InputSignal<string> = input<string>('');
    public readonly showSelectAll: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);

    /** Отметки у групп. Без них клик, пробел и Enter по группе раскрывают и сворачивают её. */
    public readonly branchMarks: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });

    /** Клик без Ctrl и Cmd выбирает узел один; с Ctrl или Cmd добавляет к выбору. Только для флажков. */
    public readonly exclusive: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });

    /** Скрывает ли слово поиска строки. Без отбора строки отбирает приложение, а слово только отмечено. */
    public readonly filter: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });

    public readonly picked: OutputEmitterRef<IRtTree.Node<TValue>> = output<IRtTree.Node<TValue>>();

    /**
     * Клавиша для дерева. Отвечает, взята ли она: не взятая идёт дальше нетронутой, поэтому
     * приложение может отдавать сюда каждую клавишу своего поля поиска.
     */
    public handleKeydown(event: KeyboardEvent): boolean {
        const taken: boolean = this.#takeKey(event.key, event.ctrlKey || event.metaKey);
        if (taken) {
            event.preventDefault();
            event.stopPropagation();
        }
        return taken;
    }

    public expandAll(): void {
        const all: Set<TValue> = new Set<TValue>();
        this.#collectBranches(this.nodes(), all);
        this.#open.set(all);
    }

    public collapseAll(): void {
        this.#open.set(new Set<TValue>());
    }

    public clearHighlight(): void {
        this.#highlighted.set(null);
    }

    protected onRowClick(row: IRtTree.Row<TValue>, event: MouseEvent): void {
        this.#highlighted.set(row.option.value);
        if (row.option.disabled) {
            return;
        }
        if (this.#opensOnly(row)) {
            this.#toggleOrPick(row);
            return;
        }
        this.#choose(this.#next(row.option, event.ctrlKey || event.metaKey));
    }

    protected onToggleClick(event: Event, value: TValue): void {
        event.stopPropagation();
        this.#toggle(value);
    }

    protected onSelectAll(): void {
        this.#choose(rtTreeSelectAll(this.rows(), this.value()));
    }

    /** Строка, клик по которой ничего не отмечает: режим без отметок или группа без флажка. */
    #opensOnly(row: IRtTree.Row<TValue>): boolean {
        return this.mode() === 'none' || (row.branch && !this.branchMarks());
    }

    #toggleOrPick(row: IRtTree.Row<TValue>): void {
        if (row.branch) {
            this.#toggle(row.option.value);
        } else {
            this.picked.emit(row.option);
        }
    }

    /** Выбор после действия над узлом: в исключающем режиме без Ctrl и Cmd узел остаётся один. */
    #next(node: IRtTree.Node<TValue>, additive: boolean): ReadonlyArray<TValue> {
        if (this.exclusive() && this.mode() === 'multiple' && !additive) {
            return rtTreeChooseAlone(this.nodes(), node, this.value(), this.cascade());
        }
        return rtTreeChoose(node, this.value(), this.mode(), this.cascade());
    }

    #collectBranches(list: ReadonlyArray<IRtTree.Node<TValue>>, into: Set<TValue>): void {
        list.forEach((node: IRtTree.Node<TValue>): void => {
            if ((node.children ?? []).length > 0) {
                into.add(node.value);
                this.#collectBranches(node.children ?? [], into);
            }
        });
    }

    /**
     * Меняет выбор, не трогая раскрытие. Пока ветки никто не раскрывал руками, раскрытие считается из
     * выбора, и без этой фиксации отметка ветки сворачивала или раскрывала её саму.
     */
    #choose(next: ReadonlyArray<TValue>): void {
        this.#open.set(this.openBranches());
        this.value.set(next);
    }

    #toggle(value: TValue): void {
        this.#open.set(rtTreeToggle(this.openBranches(), value));
    }

    #highlightedIndex(): number {
        const highlighted: TValue | null = this.#highlighted();
        return this.rows().findIndex((row: IRtTree.Row<TValue>): boolean => row.option.value === highlighted);
    }

    #takeKey(key: string, additive: boolean): boolean {
        const rows: ReadonlyArray<IRtTree.Row<TValue>> = this.rows();
        const index: number = this.#highlightedIndex();
        if (key === 'ArrowDown' || key === 'ArrowUp') {
            return this.#move(rows, index, key === 'ArrowDown' ? 1 : -1);
        }
        if (index < 0) {
            return false;
        }
        if (key === 'ArrowRight' || key === 'ArrowLeft') {
            this.#side(rows, index, key);
            return true;
        }
        if (key === ' ') {
            this.#space(rows[index], additive);
            return true;
        }
        if (key === 'Enter') {
            this.#enter(rows[index], additive);
            return true;
        }
        return false;
    }

    #move(rows: ReadonlyArray<IRtTree.Row<TValue>>, index: number, step: number): boolean {
        if (rows.length === 0) {
            return false;
        }
        const next: number = index < 0 ? 0 : Math.min(rows.length - 1, Math.max(0, index + step));
        this.#highlighted.set(rows[next].option.value);
        return true;
    }

    #side(rows: ReadonlyArray<IRtTree.Row<TValue>>, index: number, key: string): void {
        const answer: IRtSelect.SideKeyAnswer<TValue> = rtTreeSideKey(rows, index, key);
        if (answer.toggle !== null) {
            this.#toggle(answer.toggle);
        }
        this.#highlighted.set(rows[answer.index].option.value);
    }

    #space(row: IRtTree.Row<TValue>, additive: boolean): void {
        if (this.#opensOnly(row) && row.branch) {
            this.#toggle(row.option.value);
            return;
        }
        if (!row.option.disabled && this.mode() !== 'none') {
            this.#choose(this.#next(row.option, additive));
        }
    }

    #enter(row: IRtTree.Row<TValue>, additive: boolean): void {
        if (this.#opensOnly(row) && row.branch) {
            this.#toggle(row.option.value);
            return;
        }
        if (row.option.disabled) {
            return;
        }
        if (this.mode() !== 'none') {
            this.#choose(this.#next(row.option, additive));
        }
        this.picked.emit(row.option);
    }
}
