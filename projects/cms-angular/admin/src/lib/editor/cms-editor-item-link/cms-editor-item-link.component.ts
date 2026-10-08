import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    inject,
    input,
    InputSignal,
    output,
    OutputEmitterRef,
    Signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { exhaustMap, filter, Subject } from 'rxjs';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { blockJsonOf, IBlock, idFieldOf } from '@rt-tools/cms-contract';
import { CMS_LABELS, CmsLabelPipe, emptyLinkOf, TCmsLabelMap } from '@rt-tools/cms-angular';
import { RtDialogService, RtIconButtonComponent } from '@rt-tools/ui-kit-v2';

import { openLinkDialog } from '../cms-link-dialog/cms-link-dialog.component';

const BEM_BLOCK: string = 'rt-cms-editor-item-link';

/** A link to a site page as a block: keeps the type and the page id, picked by the link window. */
@Component({
    selector: 'rt-cms-editor-item-link',
    templateUrl: './cms-editor-item-link.component.html',
    styleUrl: './cms-editor-item-link.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,
        RtIconButtonComponent,

        // cms
        CmsLabelPipe,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsEditorItemLinkComponent {
    readonly #dialogs: RtDialogService = inject(RtDialogService);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #settingsSource: Subject<IBlock.Content.Button> = new Subject<IBlock.Content.Button>();

    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    protected readonly contentItemId: Signal<string | null> = computed(() => idFieldOf(blockJsonOf(this.content()), 'contentItemId'));

    public readonly content: InputSignal<string> = input.required<string>();
    public readonly contentChange: OutputEmitterRef<string> = output<string>();

    constructor() {
        this.#settingsSource
            .pipe(
                exhaustMap((link: IBlock.Content.Button) =>
                    openLinkDialog(this.#dialogs, { link, title: this.t().blockContentItemLink, itemOnly: true })
                ),
                filter(
                    (link: IBlock.Content.Button | undefined): link is IBlock.Content.Button =>
                        link !== undefined && link.contentItemId !== null
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((link: IBlock.Content.Button) => {
                const chosen: IBlock.Content.ContentItemLink = {
                    contentTypeId: link.contentTypeId ?? '',
                    contentItemId: link.contentItemId ?? '',
                };
                this.contentChange.emit(JSON.stringify(chosen));
            });
    }

    protected configure(): void {
        const parsed: unknown = blockJsonOf(this.content());
        this.#settingsSource.next({
            ...emptyLinkOf(''),
            contentTypeId: idFieldOf(parsed, 'contentTypeId'),
            contentItemId: idFieldOf(parsed, 'contentItemId'),
        });
    }
}
