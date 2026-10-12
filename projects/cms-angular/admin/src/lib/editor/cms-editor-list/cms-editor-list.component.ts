import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
    InputSignal,
    linkedSignal,
    output,
    OutputEmitterRef,
    Signal,
    signal,
    WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';
import { listOfContent } from '@rt-tools/cms-contract';
import { CMS_LABELS, newBlockId, TCmsLabelMap } from '@rt-tools/cms-angular';
import { RtButtonDirective, RtIconButtonComponent, RtInputComponent } from '@rt-tools/ui-kit-v2';

import { CmsEditableDirective } from '../cms-editable.directive';

const BEM_BLOCK: string = 'rt-cms-editor-list';

/** A list item in the editor: the id keeps the item markup while items are reordered. */
interface IListItem {
    id: string;
    html: string;
}

/** The sign the items are marked with. A plain list is drawn without a sign. */
export enum EListMarker {
    None = 'none',
    Disc = 'disc',
    Decimal = 'decimal',
}

function contentOf(items: readonly IListItem[]): string {
    return JSON.stringify(items.map((item: IListItem) => item.html));
}

function itemsOf(content: string): IListItem[] {
    return listOfContent(content).map((html: string): IListItem => ({ id: newBlockId(), html }));
}

/** A list block: items are edited in place, reordered by dragging and added by the field below. */
@Component({
    selector: 'rt-cms-editor-list',
    templateUrl: './cms-editor-list.component.html',
    styleUrl: './cms-editor-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        CdkDropList,
        CdkDrag,
        CdkDragHandle,
        FormsModule,

        // rt-tools
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtButtonDirective,
        RtIconButtonComponent,
        RtInputComponent,

        // components
        CmsEditableDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsEditorListComponent {
    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    protected readonly Marker: typeof EListMarker = EListMarker;
    /**
     * The list items. The own edit comes back here as the input; it is not read again, or the items
     * would get new ids, the markup would be recreated and the caret would leave the item.
     */
    protected readonly items: WritableSignal<IListItem[]> = linkedSignal<string, IListItem[]>({
        source: () => this.content(),
        computation: (content: string, previous?: { value: IListItem[] }) =>
            previous && content === contentOf(previous.value) ? previous.value : itemsOf(content),
    });
    protected readonly draft: WritableSignal<string> = signal<string>('');

    public readonly content: InputSignal<string> = input.required<string>();
    public readonly marker: InputSignal<EListMarker> = input<EListMarker>(EListMarker.None);
    public readonly contentChange: OutputEmitterRef<string> = output<string>();

    protected add(): void {
        const html: string = this.draft().trim();
        if (!html) {
            return;
        }
        this.#commit([...this.items(), { id: newBlockId(), html }]);
        this.draft.set('');
    }

    protected remove(id: string): void {
        this.#commit(this.items().filter((item: IListItem) => item.id !== id));
    }

    protected edit(id: string, html: string): void {
        this.#commit(this.items().map((item: IListItem) => (item.id === id ? { ...item, html } : item)));
    }

    protected drop(event: CdkDragDrop<IListItem[]>): void {
        if (event.previousIndex === event.currentIndex) {
            return;
        }
        const reordered: IListItem[] = [...this.items()];
        moveItemInArray(reordered, event.previousIndex, event.currentIndex);
        this.#commit(reordered);
    }

    #commit(items: IListItem[]): void {
        this.items.set(items);
        this.contentChange.emit(contentOf(items));
    }
}
