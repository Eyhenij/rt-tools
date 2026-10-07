import { CdkDrag, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, Signal, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { CMS_LABELS, IContentItemImage, TCmsLabelMap } from '@rt-tools/cms-angular';
import { RtButtonDirective, RtFieldComponent, RtIconButtonComponent, RtInputComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'rt-cms-item-images';

/** A move of an image: from where and to where in the list. */
export interface IImageMove {
    readonly from: number;
    readonly to: number;
}

/** An edit of the caption or the alternative text of an image. */
export interface IImageTextChange {
    readonly fileId: string;
    readonly change: Partial<Pick<IContentItemImage, 'caption' | 'altText'>>;
}

/**
 * The page images: preview, caption, alternative text, the main mark and the order — by dragging or
 * by the up and down buttons. The list does not pick an image itself: it asks for the picker
 * window, and the screen opens it. The main one cannot be removed — another is marked main first.
 */
@Component({
    selector: 'rt-cms-item-images',
    templateUrl: './cms-item-images.component.html',
    styleUrl: './cms-item-images.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        CdkDrag,
        CdkDragHandle,
        CdkDropList,
        FormsModule,

        // rt-tools
        BlockDirective,
        ElemDirective,
        RtButtonDirective,
        RtFieldComponent,
        RtIconButtonComponent,
        RtInputComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsItemImagesComponent {
    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);

    public readonly images: InputSignal<readonly IContentItemImage[]> = input.required<readonly IContentItemImage[]>();
    public readonly mainImageId: InputSignal<string> = input<string>('');

    public readonly addRequested: OutputEmitterRef<void> = output();
    public readonly removeRequested: OutputEmitterRef<string> = output<string>();
    public readonly mainPicked: OutputEmitterRef<string> = output<string>();
    public readonly moved: OutputEmitterRef<IImageMove> = output<IImageMove>();
    public readonly textChanged: OutputEmitterRef<IImageTextChange> = output<IImageTextChange>();
}
