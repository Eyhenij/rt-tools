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
import { IBlock, imagesOfContent } from '@rt-tools/cms-contract';
import { CMS_LABELS, CmsLabelPipe, TCmsLabelMap } from '@rt-tools/cms-angular';
import { RtEmptyStateComponent, RtIconButtonComponent } from '@rt-tools/ui-kit-v2';

import { CMS_EDITOR_IMAGE_PICKER, ICmsEditorImagePicker } from '../cms-editor.tokens';

const BEM_BLOCK: string = 'rt-cms-editor-image';

/** An image block: one or several media library images picked by the screen's window. */
@Component({
    selector: 'rt-cms-editor-image',
    templateUrl: './cms-editor-image.component.html',
    styleUrl: './cms-editor-image.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,
        RtEmptyStateComponent,
        RtIconButtonComponent,

        // cms
        CmsLabelPipe,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsEditorImageComponent {
    readonly #picker: ICmsEditorImagePicker = inject(CMS_EDITOR_IMAGE_PICKER);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #pickSource: Subject<void> = new Subject<void>();

    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    protected readonly images: Signal<IBlock.Content.Image[]> = computed(() => imagesOfContent(this.content()));

    public readonly content: InputSignal<string> = input.required<string>();
    public readonly contentChange: OutputEmitterRef<string> = output<string>();

    constructor() {
        this.#pickSource
            .pipe(
                exhaustMap(() => this.#picker.pick()),
                filter((images: IBlock.Content.Image[] | undefined): images is IBlock.Content.Image[] => images !== undefined),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((images: IBlock.Content.Image[]) => {
                this.contentChange.emit(JSON.stringify(images));
            });
    }

    protected pick(): void {
        this.#pickSource.next();
    }
}
