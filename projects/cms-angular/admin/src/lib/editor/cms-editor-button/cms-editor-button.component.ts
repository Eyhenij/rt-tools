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
import { buttonOfContent, IBlock } from '@rt-tools/cms-contract';
import { CMS_LABELS, TCmsLabelMap } from '@rt-tools/cms-angular';
import { RtDialogService, RtIconButtonComponent } from '@rt-tools/ui-kit-v2';

import { openLinkDialog } from '../cms-link-dialog/cms-link-dialog.component';

const BEM_BLOCK: string = 'rt-cms-editor-button';

/** A button block: a label and a link; set up by the link window. */
@Component({
    selector: 'rt-cms-editor-button',
    templateUrl: './cms-editor-button.component.html',
    styleUrl: './cms-editor-button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,
        RtIconButtonComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsEditorButtonComponent {
    readonly #dialogs: RtDialogService = inject(RtDialogService);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #settingsSource: Subject<IBlock.Content.Button> = new Subject<IBlock.Content.Button>();

    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    protected readonly button: Signal<IBlock.Content.Button> = computed(() => buttonOfContent(this.content(), this.t().buttonDefaultLabel));

    public readonly content: InputSignal<string> = input.required<string>();
    public readonly contentChange: OutputEmitterRef<string> = output<string>();

    constructor() {
        this.#settingsSource
            .pipe(
                exhaustMap((link: IBlock.Content.Button) =>
                    openLinkDialog(this.#dialogs, { link, title: this.t().blockButton, itemOnly: false })
                ),
                filter((link: IBlock.Content.Button | undefined): link is IBlock.Content.Button => link !== undefined),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((link: IBlock.Content.Button) => {
                this.contentChange.emit(JSON.stringify(link));
            });
    }

    protected configure(): void {
        this.#settingsSource.next(this.button());
    }
}
