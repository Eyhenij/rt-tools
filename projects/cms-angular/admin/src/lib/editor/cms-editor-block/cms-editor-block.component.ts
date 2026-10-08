import { Clipboard } from '@angular/cdk/clipboard';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    input,
    InputSignal,
    output,
    OutputEmitterRef,
    Signal,
    signal,
    viewChild,
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { exhaustMap, filter, map, Subject } from 'rxjs';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { EBlockType, IBlock } from '@rt-tools/cms-contract';
import {
    BLOCK_LABELS,
    CMS_LABELS,
    CONVERTIBLE_BLOCKS,
    convertedBlockOf,
    EDITOR_BLOCKS,
    EDITOR_CLIPBOARD_MARK,
    emptyBlockOf,
    emptyLinkOf,
    ETextAction,
    HEADING_BLOCKS,
    htmlOfText,
    insertLink,
    insertPlainText,
    isPlainPaste,
    linkOfElement,
    newBlockId,
    pastedBlocksOf,
    pastedElementsOf,
    SELECTION_MENU_BLOCKS,
    TCmsLabelMap,
    toggleRangeStyle,
    TStyleAction,
    updateLink,
} from '@rt-tools/cms-angular';
import { RtDialogService, RtIconButtonComponent, RtMenuComponent, RtMenuItemComponent } from '@rt-tools/ui-kit-v2';

import { CmsEditableDirective } from '../cms-editable.directive';
import { CmsEditorButtonComponent } from '../cms-editor-button/cms-editor-button.component';
import { CmsEditorEmbedComponent } from '../cms-editor-embed/cms-editor-embed.component';
import { CmsEditorImageComponent } from '../cms-editor-image/cms-editor-image.component';
import { CmsEditorItemLinkComponent } from '../cms-editor-item-link/cms-editor-item-link.component';
import { CmsEditorListComponent, EListMarker } from '../cms-editor-list/cms-editor-list.component';
import { CmsEditorProsConsComponent } from '../cms-editor-pros-cons/cms-editor-pros-cons.component';
import { CmsEditorTitledComponent } from '../cms-editor-titled/cms-editor-titled.component';
import { openLinkDialog } from '../cms-link-dialog/cms-link-dialog.component';

const BEM_BLOCK: string = 'rt-cms-editor-block';
/** The selection menu stands above the selected text with this gap. */
const MENU_OFFSET_PX: number = 44;

/** What a block asks of the editor: insert blocks after itself or in its place. */
export interface ICmsEditorInsert {
    afterId: string;
    replace: boolean;
    blocks: IBlock.Base[];
}

/** Where the selection menu stands and whether a link is selected. */
interface ISelectionMenu {
    x: number;
    y: number;
    onLink: boolean;
}

/** A link window request: an edit of a found link or a new link in place of the selection. */
interface ILinkRequest {
    link: IBlock.Content.Button;
    anchor: HTMLElement | null;
    range: Range | null;
    editable: HTMLElement | null;
}

interface ILinkAnswer {
    request: ILinkRequest;
    link: IBlock.Content.Button | undefined;
}

/** An item of a block menu: the kind and its label. */
export interface IBlockMenuItem {
    type: EBlockType;
    title: string;
}

/** The menu items of the kinds with their labels. */
export function blockMenuOf(types: readonly EBlockType[], labels: TCmsLabelMap): IBlockMenuItem[] {
    return types.map((type: EBlockType): IBlockMenuItem => ({ type, title: labels[BLOCK_LABELS[type]] }));
}

/** The nearest ancestor of a node with this tag or attribute — within the editable piece. */
function closestOf(node: Node, selector: string): HTMLElement | null {
    const element: Element | null = node instanceof Element ? node : node.parentElement;
    return element?.closest<HTMLElement>(selector) ?? null;
}

/**
 * The block wrapper: the drag handle, the action menu, the field of the block kind and the selection
 * menu over the text. A block edit goes to the editor whole, a paste of parsed HTML as new blocks.
 */
@Component({
    selector: 'rt-cms-editor-block',
    templateUrl: './cms-editor-block.component.html',
    styleUrl: './cms-editor-block.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        CdkDragHandle,

        // rt-tools
        BlockDirective,
        ElemDirective,
        RtIconButtonComponent,
        RtMenuComponent,
        RtMenuItemComponent,

        // components
        CmsEditableDirective,
        CmsEditorButtonComponent,
        CmsEditorEmbedComponent,
        CmsEditorImageComponent,
        CmsEditorItemLinkComponent,
        CmsEditorListComponent,
        CmsEditorProsConsComponent,
        CmsEditorTitledComponent,
    ],
    host: {
        class: BEM_BLOCK,
        '(document:mousedown)': 'onDocumentPointer($event)',
        '(mouseup)': 'onSelection()',
        '(keyup)': 'onSelection()',
    },
})
export class CmsEditorBlockComponent {
    readonly #document: Document = inject(DOCUMENT);
    readonly #host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    readonly #clipboard: Clipboard = inject(Clipboard);
    readonly #dialogs: RtDialogService = inject(RtDialogService);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #linkSource: Subject<ILinkRequest> = new Subject<ILinkRequest>();

    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    protected readonly Type: typeof EBlockType = EBlockType;
    protected readonly ListMarker: typeof EListMarker = EListMarker;
    protected readonly TextAction: typeof ETextAction = ETextAction;
    protected readonly text: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('text');
    protected readonly menu: WritableSignal<ISelectionMenu | null> = signal<ISelectionMenu | null>(null);
    protected readonly addItems: Signal<IBlockMenuItem[]> = computed(() => blockMenuOf(EDITOR_BLOCKS, this.t()));
    protected readonly title: Signal<string> = computed(() => this.t()[BLOCK_LABELS[this.block().type]]);
    protected readonly isHeading: Signal<boolean> = computed(() => HEADING_BLOCKS.includes(this.block().type));
    protected readonly convertItems: Signal<IBlockMenuItem[]> = computed(() => {
        const type: EBlockType = this.block().type;
        const others: EBlockType[] = CONVERTIBLE_BLOCKS.includes(type)
            ? CONVERTIBLE_BLOCKS.filter((other: EBlockType) => other !== type)
            : [];
        return blockMenuOf(others, this.t());
    });

    public readonly block: InputSignal<IBlock.Base> = input.required<IBlock.Base>();
    public readonly changed: OutputEmitterRef<IBlock.Base> = output<IBlock.Base>();
    public readonly removed: OutputEmitterRef<string> = output<string>();
    public readonly inserted: OutputEmitterRef<ICmsEditorInsert> = output<ICmsEditorInsert>();

    constructor() {
        this.#linkSource
            .pipe(
                exhaustMap((request: ILinkRequest) =>
                    openLinkDialog(this.#dialogs, {
                        title: request.anchor ? this.t().editorLink : this.t().editorNewLink,
                        link: request.link,
                        itemOnly: false,
                    }).pipe(map((link: IBlock.Content.Button | undefined): ILinkAnswer => ({ request, link })))
                ),
                filter((answer: ILinkAnswer) => answer.link !== undefined),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe(({ request, link }: ILinkAnswer) => {
                if (!link) {
                    return;
                }
                if (request.anchor) {
                    updateLink(request.anchor, link);
                } else if (request.range) {
                    insertLink(link, request.range, this.#document);
                } else {
                    return;
                }
                this.#notifyEdited(request.editable);
            });
    }

    protected onDocumentPointer(event: MouseEvent): void {
        if (this.menu() && !(event.target instanceof Node && this.#host.contains(event.target))) {
            this.menu.set(null);
        }
    }

    protected edit(content: string): void {
        this.changed.emit({ ...this.block(), content });
    }

    protected convert(type: EBlockType): void {
        const text: string = this.text()?.nativeElement.textContent ?? '';
        this.changed.emit(convertedBlockOf(this.block(), type, htmlOfText(text, this.#document)));
    }

    protected duplicate(): void {
        this.inserted.emit({ afterId: this.block().id, replace: false, blocks: [{ ...this.block(), id: newBlockId() }] });
    }

    protected addAfter(type: EBlockType): void {
        this.inserted.emit({ afterId: this.block().id, replace: false, blocks: [emptyBlockOf(type, newBlockId())] });
    }

    protected remove(): void {
        this.removed.emit(this.block().id);
    }

    /** Shows the menu over the selected text, or hides it if there is no selection. */
    protected onSelection(): void {
        const range: Range | null = this.#selectedRange();
        if (!range || !SELECTION_MENU_BLOCKS.includes(this.block().type)) {
            this.menu.set(null);
            return;
        }
        const rect: DOMRect = range.getBoundingClientRect();
        this.menu.set({
            x: rect.left,
            y: rect.top - MENU_OFFSET_PX,
            onLink: closestOf(range.commonAncestorContainer, 'a') !== null,
        });
    }

    protected applyStyle(action: TStyleAction): void {
        const range: Range | null = this.#selectedRange();
        if (range) {
            toggleRangeStyle(range, action, this.#document);
            this.#document.getSelection()?.removeAllRanges();
            this.#notifyEdited(closestOf(range.commonAncestorContainer, '[contenteditable]'));
        }
        this.menu.set(null);
    }

    protected copy(): void {
        const range: Range | null = this.#selectedRange();
        if (range) {
            this.#clipboard.copy(range.toString());
            this.#document.getSelection()?.removeAllRanges();
        }
        this.menu.set(null);
    }

    protected link(): void {
        const range: Range | null = this.#selectedRange();
        if (range) {
            const anchor: HTMLElement | null = closestOf(range.commonAncestorContainer, 'a');
            this.#linkSource.next({
                anchor,
                link: anchor ? linkOfElement(anchor) : emptyLinkOf(range.toString()),
                range: anchor ? null : range.cloneRange(),
                editable: closestOf(range.commonAncestorContainer, '[contenteditable]'),
            });
        }
        this.menu.set(null);
    }

    /**
     * A paste into a text block. Into an empty paragraph the markup is parsed into blocks that take
     * its place; into a heading, a block with text and from the editor itself goes plain text.
     */
    protected paste(event: ClipboardEvent): void {
        event.preventDefault();
        const data: DataTransfer | null = event.clipboardData;
        const selection: Selection | null = this.#document.getSelection();
        if (!data || !selection) {
            return;
        }

        const elements: Element[] = pastedElementsOf(data.getData('text/html'));
        const fromEditor: boolean = data.types.includes(EDITOR_CLIPBOARD_MARK);
        const hasContent: boolean = this.block().content.trim() !== '';
        if (this.isHeading() || isPlainPaste(elements, hasContent, fromEditor)) {
            insertPlainText(selection, data.getData('text/plain'), this.#document);
            this.#notifyEdited(this.text()?.nativeElement ?? null);
            return;
        }

        const blocks: IBlock.Base[] = pastedBlocksOf(elements, this.#document, newBlockId);
        if (blocks.length > 0) {
            this.inserted.emit({ afterId: this.block().id, replace: true, blocks });
        }
    }

    #selectedRange(): Range | null {
        const selection: Selection | null = this.#document.getSelection();
        if (!selection?.rangeCount) {
            return null;
        }
        const range: Range = selection.getRangeAt(0);
        return !range.collapsed && range.toString().trim() && this.#host.contains(range.commonAncestorContainer) ? range : null;
    }

    /** An edit of the markup past the keyboard: the field learns of it by the same event as of typing. */
    #notifyEdited(editable: HTMLElement | null): void {
        editable?.dispatchEvent(new Event('input', { bubbles: true }));
    }
}
