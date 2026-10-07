import { CdkDrag, CdkDragHandle, CdkDragMove, CdkDropList } from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
import {
    computed,
    contentChild,
    inject,
    input,
    model,
    output,
    signal,
    viewChildren,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    InputSignal,
    ModelSignal,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';
import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { rtTreeRows, rtTreeSideKey, rtTreeToggle } from '@rt-tools/ui-kit-v2/select';
import { IRtSelect } from '@rt-tools/ui-kit-v2/select';
import { RtTooltipDirective } from '@rt-tools/ui-kit-v2/tooltip';
import { IRtTree } from '@rt-tools/ui-kit-v2/tree';
import { RtDraggableTreeNodeDirective } from './rt-draggable-tree.directives';
import { rtDragAllowed, rtDragKeyPlace, rtDragMove, rtDragPlace } from './rt-draggable-tree.logic';
import { IRtDraggableTree } from './rt-draggable-tree.model';

const BEM_BLOCK: string = 'rt-draggable-tree';
const MOVE_KEYS: ReadonlyArray<string> = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

/**
 * Дерево, узлы которого человек переставляет: перетаскиванием строки до, после или внутрь другой,
 * или клавишами с Alt.
 *
 * Строки, уровни и раскрытие считает тот же модуль, что у `rt-tree`. Узлы на входе не меняются:
 * перенос пишет в `nodes` новый массив и сообщает `moved`. Место сброса — чистая функция от рамки
 * строки под указателем; документ дерево не читает.
 */
@Component({
    selector: 'rt-draggable-tree',
    templateUrl: './rt-draggable-tree.component.html',
    styleUrl: './rt-draggable-tree.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgTemplateOutlet,
        CdkDrag,
        CdkDragHandle,
        CdkDropList,
        RtIconComponent,
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
        '(keydown)': 'handleKeydown($event)',
    },
})
export class RtDraggableTreeComponent<TValue> {
    readonly #highlighted: WritableSignal<TValue | null> = signal<TValue | null>(null);
    readonly #dragged: WritableSignal<TValue | null> = signal<TValue | null>(null);

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly nodeTemplate: Signal<RtDraggableTreeNodeDirective<TValue> | undefined> = contentChild(RtDraggableTreeNodeDirective);

    protected readonly rowElements: Signal<ReadonlyArray<ElementRef<HTMLElement>>> = viewChildren<ElementRef<HTMLElement>>('row');

    /** Место, куда встанет перетаскиваемый узел; `null` — сейчас места нет. */
    protected readonly drop: WritableSignal<IRtDraggableTree.Drop<TValue> | null> = signal<IRtDraggableTree.Drop<TValue> | null>(null);

    /**
     * Раскрытые ветки. Пока приложение их не задало и человек ничего не сворачивал, раскрыты все:
     * порядок виден целиком с первого взгляда.
     */
    protected readonly openBranches: Signal<ReadonlySet<TValue>> = computed((): ReadonlySet<TValue> => {
        const open: ReadonlyArray<TValue> | null = this.open();
        if (open !== null) {
            return new Set<TValue>(open);
        }
        const all: Set<TValue> = new Set<TValue>();
        this.#collectBranches(this.nodes(), all);
        return all;
    });

    protected readonly rows: Signal<ReadonlyArray<IRtTree.Row<TValue>>> = computed((): ReadonlyArray<IRtTree.Row<TValue>> =>
        rtTreeRows(this.nodes(), this.openBranches(), '')
    );

    protected readonly highlighted: Signal<TValue | null> = this.#highlighted.asReadonly();

    public readonly nodes: ModelSignal<ReadonlyArray<IRtTree.Node<TValue>>> = model.required<ReadonlyArray<IRtTree.Node<TValue>>>();
    /** Значения раскрытых веток; `null` — раскрыты все. Пара `openChange` приходит на каждое раскрытие. */
    public readonly open: ModelSignal<ReadonlyArray<TValue> | null> = model<ReadonlyArray<TValue> | null>(null);
    public readonly canDrop: InputSignal<IRtDraggableTree.CanDrop<TValue> | null> = input<IRtDraggableTree.CanDrop<TValue> | null>(null);
    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);

    public readonly moved: OutputEmitterRef<IRtDraggableTree.Moved<TValue>> = output<IRtDraggableTree.Moved<TValue>>();
    public readonly picked: OutputEmitterRef<IRtTree.Node<TValue>> = output<IRtTree.Node<TValue>>();

    /** Клавиша для дерева. Отвечает, взята ли она: не взятая идёт дальше нетронутой. */
    public handleKeydown(event: KeyboardEvent): boolean {
        const taken: boolean = event.altKey ? this.#moveByKey(event.key) : this.#walkByKey(event.key);
        if (taken) {
            event.preventDefault();
            event.stopPropagation();
        }
        return taken;
    }

    protected onRowClick(row: IRtTree.Row<TValue>): void {
        this.#highlighted.set(row.option.value);
        this.picked.emit(row.option);
    }

    protected onToggleClick(event: Event, value: TValue): void {
        event.stopPropagation();
        this.#toggle(value);
    }

    protected onDragStarted(value: TValue): void {
        this.#dragged.set(value);
    }

    protected onDragMoved(event: CdkDragMove<TValue>): void {
        this.drop.set(this.#dropAt(event.pointerPosition.y));
    }

    protected onDropped(): void {
        const dragged: TValue | null = this.#dragged();
        const drop: IRtDraggableTree.Drop<TValue> | null = this.drop();
        this.#dragged.set(null);
        this.drop.set(null);
        if (dragged !== null && drop) {
            this.#apply(dragged, drop);
        }
    }

    #dropAt(pointer: number): IRtDraggableTree.Drop<TValue> | null {
        const dragged: TValue | null = this.#dragged();
        const rows: ReadonlyArray<IRtTree.Row<TValue>> = this.rows();
        const elements: ReadonlyArray<ElementRef<HTMLElement>> = this.rowElements();
        if (dragged === null) {
            return null;
        }
        const index: number = elements.findIndex((element: ElementRef<HTMLElement>, at: number): boolean => {
            const box: DOMRect = element.nativeElement.getBoundingClientRect();
            return rows[at]?.option.value !== dragged && pointer >= box.top && pointer < box.bottom;
        });
        if (index < 0) {
            return null;
        }
        const box: DOMRect = elements[index].nativeElement.getBoundingClientRect();
        const target: IRtTree.Node<TValue> = rows[index].option;
        const place: IRtDraggableTree.Place | null = rtDragPlace(target, box.top, box.height, pointer);
        const drop: IRtDraggableTree.Drop<TValue> | null = place ? { target: target.value, place } : null;
        return drop && rtDragAllowed(this.nodes(), dragged, drop, this.canDrop()) ? drop : null;
    }

    #moveByKey(key: string): boolean {
        const value: TValue | null = this.#highlighted();
        if (!MOVE_KEYS.includes(key)) {
            return false;
        }
        const node: IRtTree.Node<TValue> | undefined = this.rows().find(
            (row: IRtTree.Row<TValue>): boolean => row.option.value === value
        )?.option;
        const drop: IRtDraggableTree.Drop<TValue> | null = node && !node.disabled ? rtDragKeyPlace(this.nodes(), node.value, key) : null;
        if (node && drop && rtDragAllowed(this.nodes(), node.value, drop, this.canDrop())) {
            this.#apply(node.value, drop);
        }
        return true;
    }

    #walkByKey(key: string): boolean {
        const rows: ReadonlyArray<IRtTree.Row<TValue>> = this.rows();
        const index: number = rows.findIndex((row: IRtTree.Row<TValue>): boolean => row.option.value === this.#highlighted());
        if (key === 'ArrowDown' || key === 'ArrowUp') {
            return this.#step(rows, index, key === 'ArrowDown' ? 1 : -1);
        }
        if (index < 0) {
            return false;
        }
        if (key === 'ArrowRight' || key === 'ArrowLeft') {
            const answer: IRtSelect.SideKeyAnswer<TValue> = rtTreeSideKey(rows, index, key);
            if (answer.toggle !== null) {
                this.#toggle(answer.toggle);
            }
            this.#highlighted.set(rows[answer.index].option.value);
            return true;
        }
        if (key === 'Enter') {
            this.picked.emit(rows[index].option);
            return true;
        }
        return false;
    }

    #step(rows: ReadonlyArray<IRtTree.Row<TValue>>, index: number, step: number): boolean {
        if (rows.length === 0) {
            return false;
        }
        const next: number = index < 0 ? 0 : Math.min(rows.length - 1, Math.max(0, index + step));
        this.#highlighted.set(rows[next].option.value);
        return true;
    }

    #apply(value: TValue, drop: IRtDraggableTree.Drop<TValue>): void {
        const result: IRtDraggableTree.MoveResult<TValue> | null = rtDragMove(this.nodes(), value, drop);
        if (!result) {
            return;
        }
        this.nodes.set(result.nodes);
        if (drop.place === 'inside' && !this.openBranches().has(drop.target)) {
            this.open.set([...this.openBranches(), drop.target]);
        }
        this.moved.emit(result.moved);
    }

    #toggle(value: TValue): void {
        this.open.set([...rtTreeToggle(this.openBranches(), value)]);
    }

    #collectBranches(list: ReadonlyArray<IRtTree.Node<TValue>>, into: Set<TValue>): void {
        list.forEach((node: IRtTree.Node<TValue>): void => {
            if ((node.children ?? []).length > 0) {
                into.add(node.value);
                this.#collectBranches(node.children ?? [], into);
            }
        });
    }
}
