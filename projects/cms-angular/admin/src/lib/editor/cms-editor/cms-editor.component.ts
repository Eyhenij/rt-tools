import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, forwardRef, inject, linkedSignal, Signal, WritableSignal } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { EBlockType, IBlock, parseContentBody, serializeContentBody } from '@rt-tools/cms-contract';
import {
    CMS_LABELS,
    copiedHtmlOf,
    EDITOR_BLOCKS,
    EDITOR_CLIPBOARD_MARK,
    emptyBlockOf,
    interpolateCmsLabel,
    newBlockId,
    TCmsLabelMap,
    TOOLBAR_BLOCKS,
} from '@rt-tools/cms-angular';
import { RtButtonDirective, RtFormControlBase, RtMenuComponent, RtMenuItemComponent } from '@rt-tools/ui-kit-v2';

import { blockMenuOf, CmsEditorBlockComponent, IBlockMenuItem, ICmsEditorInsert } from '../cms-editor-block/cms-editor-block.component';

const BEM_BLOCK: string = 'rt-cms-editor';

/**
 * The block editor of a page body. A form control: the value is the body string, inside is the list
 * of blocks, reordered by dragging. Every block change goes to the form as a new string.
 */
@Component({
    selector: 'rt-cms-editor',
    templateUrl: './cms-editor.component.html',
    styleUrl: './cms-editor.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        CdkDropList,
        CdkDrag,

        // rt-tools
        BlockDirective,
        ElemDirective,
        RtButtonDirective,
        RtMenuComponent,
        RtMenuItemComponent,

        // components
        CmsEditorBlockComponent,
    ],
    providers: [{ provide: RtFormControlBase, useExisting: forwardRef(() => CmsEditorComponent) }],
    host: {
        class: BEM_BLOCK,
        '(copy)': 'copy($event)',
    },
})
export class CmsEditorComponent extends RtFormControlBase<string> {
    readonly #document: Document = inject(DOCUMENT);
    /** The last string given to the form: the form gives the same one back, and there is no need to read it again. */
    #emitted: string | null = null;

    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    protected readonly hasValue: Signal<boolean> = computed(() => this.blocks().length > 0);
    protected readonly toolbarItems: Signal<IBlockMenuItem[]> = computed(() => blockMenuOf(TOOLBAR_BLOCKS, this.t()));
    protected readonly menuItems: Signal<IBlockMenuItem[]> = computed(() =>
        blockMenuOf(
            EDITOR_BLOCKS.filter((type: EBlockType) => !TOOLBAR_BLOCKS.includes(type)),
            this.t()
        )
    );

    /** The body blocks. Read again from the form value, edited by the editor in place. */
    protected readonly blocks: WritableSignal<IBlock.Base[]> = linkedSignal(() => parseContentBody(this.value()));

    public readonly displayText: Signal<string> = computed(() =>
        interpolateCmsLabel(this.t().editorBlockCount, { count: this.blocks().length })
    );

    public override writeValue(value: string | null): void {
        if (value !== null && value === this.#emitted) {
            return;
        }
        super.writeValue(value);
    }

    protected getEmptyValue(): string {
        return serializeContentBody([]);
    }

    protected focusAfterClear(): void {
        // The body is cleared whole only by the form: the focus has nowhere to return.
    }

    /**
     * A copy from the editor puts the markup and the editor mark into the clipboard: such a paste goes
     * as plain text rather than being parsed into blocks a second time.
     */
    protected copy(event: ClipboardEvent): void {
        const selection: Selection | null = this.#document.getSelection();
        if (!selection?.rangeCount || !event.clipboardData) {
            return;
        }
        event.clipboardData.setData('text/plain', selection.toString());
        event.clipboardData.setData('text/html', copiedHtmlOf(selection.getRangeAt(0).cloneContents(), this.#document));
        event.clipboardData.setData(EDITOR_CLIPBOARD_MARK, EDITOR_CLIPBOARD_MARK);
        event.preventDefault();
    }

    protected append(type: EBlockType): void {
        this.#commit([...this.blocks(), emptyBlockOf(type, newBlockId())]);
    }

    protected drop(event: CdkDragDrop<IBlock.Base[]>): void {
        if (event.previousIndex === event.currentIndex) {
            return;
        }
        const reordered: IBlock.Base[] = [...this.blocks()];
        moveItemInArray(reordered, event.previousIndex, event.currentIndex);
        this.#commit(reordered);
    }

    protected changeBlock(changed: IBlock.Base): void {
        this.#commit(this.blocks().map((block: IBlock.Base) => (block.id === changed.id ? changed : block)));
    }

    protected removeBlock(id: string): void {
        this.#commit(this.blocks().filter((block: IBlock.Base) => block.id !== id));
    }

    /** Inserts blocks after the given one; `replace` puts the first of them in its place. */
    protected insertBlocks(insert: ICmsEditorInsert): void {
        const position: number = this.blocks().findIndex((block: IBlock.Base) => block.id === insert.afterId);
        if (position === -1) {
            return;
        }
        const next: IBlock.Base[] = [...this.blocks()];
        next.splice(insert.replace ? position : position + 1, insert.replace ? 1 : 0, ...insert.blocks);
        this.#commit(next);
    }

    #commit(blocks: IBlock.Base[]): void {
        this.blocks.set(blocks);
        this.#emitted = serializeContentBody(blocks);
        this.emitChange(this.#emitted);
        this.markTouched();
    }
}
