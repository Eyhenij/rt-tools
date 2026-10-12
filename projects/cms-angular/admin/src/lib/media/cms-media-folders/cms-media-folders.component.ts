import { ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, Signal, inject, input, output } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { CMS_LABELS, CmsLabelPipe, IMediaFolder, MEDIA_ROOT_ID, TCmsLabelMap } from '@rt-tools/cms-angular';
import { RtButtonDirective, RtMenuComponent, RtMenuItemComponent, RtTooltipDirective } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'rt-cms-media-folders';

/**
 * The folders above the media library files: the path from the root to the open folder and the
 * folders inside it. A folder has a menu — renaming and deleting with confirmation. What to do with
 * a press is decided by the screen.
 */
@Component({
    selector: 'rt-cms-media-folders',
    templateUrl: './cms-media-folders.component.html',
    styleUrl: './cms-media-folders.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        BlockDirective,
        CmsLabelPipe,
        ElemDirective,
        RtButtonDirective,
        RtMenuComponent,
        RtMenuItemComponent,
        RtTooltipDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsMediaFoldersComponent {
    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    protected readonly rootId: string = MEDIA_ROOT_ID;

    /** The path from the root to the open folder; empty — the root is open. */
    public readonly path: InputSignal<readonly IMediaFolder[]> = input.required<readonly IMediaFolder[]>();
    /** The folders inside the open one. */
    public readonly folders: InputSignal<readonly IMediaFolder[]> = input.required<readonly IMediaFolder[]>();

    public readonly opened: OutputEmitterRef<string> = output<string>();
    public readonly renameRequested: OutputEmitterRef<IMediaFolder> = output<IMediaFolder>();
    public readonly removeRequested: OutputEmitterRef<IMediaFolder> = output<IMediaFolder>();
}
