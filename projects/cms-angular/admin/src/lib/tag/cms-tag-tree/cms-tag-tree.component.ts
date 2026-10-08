import {
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    Signal,
    booleanAttribute,
    computed,
    inject,
    input,
    output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { CMS_LABELS, ITagNode, MAX_TAG_DEPTH, TCmsLabelMap } from '@rt-tools/cms-angular';
import { RtCheckboxComponent, RtMenuComponent, RtMenuItemComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'rt-cms-tag-tree';

/** A change of a tag choice in the edit form: which tag and whether it is picked now. */
export interface ITagPick {
    readonly tagId: string;
    readonly picked: boolean;
}

/**
 * The tag tree. On the tags screen a node has a menu: a nested tag, renaming, deleting. In the page
 * edit form a node carries a choice box and no menu. The tree draws itself nested — the node depth
 * is needed so as not to offer a nested tag deeper than three levels.
 */
@Component({
    selector: 'rt-cms-tag-tree',
    templateUrl: './cms-tag-tree.component.html',
    styleUrl: './cms-tag-tree.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        FormsModule,

        // rt-tools
        BlockDirective,
        ElemDirective,
        RtCheckboxComponent,
        RtMenuComponent,
        RtMenuItemComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsTagTreeComponent {
    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    protected readonly canNest: Signal<boolean> = computed((): boolean => this.depth() < MAX_TAG_DEPTH);
    protected readonly selected: Signal<ReadonlySet<string>> = computed((): ReadonlySet<string> => new Set(this.selectedIds()));

    public readonly tags: InputSignal<readonly ITagNode[]> = input.required<readonly ITagNode[]>();
    public readonly depth: InputSignal<number> = input<number>(1);
    /** The choice mode: boxes instead of the menu. The picked tags come by their ids. */
    public readonly selectable: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly selectedIds: InputSignal<readonly string[]> = input<readonly string[]>([]);

    public readonly addRequested: OutputEmitterRef<ITagNode> = output<ITagNode>();
    public readonly renameRequested: OutputEmitterRef<ITagNode> = output<ITagNode>();
    public readonly removeRequested: OutputEmitterRef<ITagNode> = output<ITagNode>();
    public readonly picked: OutputEmitterRef<ITagPick> = output<ITagPick>();
}
