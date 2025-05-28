import { DOCUMENT } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    model,
    ModelSignal,
    output,
    OutputEmitterRef,
    signal,
    WritableSignal,
    computed,
    Signal,
} from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip, TooltipPosition } from '@angular/material/tooltip';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';

import { BlockDirective, ElemDirective } from '../../../bem';
import { Nullable, RtIconOutlinedDirective, transformStringInput } from '../../../util';
import { RtuiFileUploadComponent } from '../../file-uploader';
import { RtuiSpinnerComponent } from '../../spinner';
import { BooleanInput } from '@angular/cdk/coercion';

export type IImageUploadFormat = 'png' | 'jpeg' | 'webp';

@Component({
    selector: 'rtui-image-upload',
    templateUrl: './rtui-image-upload.component.html',
    styleUrls: ['./rtui-image-upload.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // material
        MatIcon,
        MatButton,
        MatIconButton,
        MatTooltip,

        // cropper
        ImageCropperComponent,

        // rt-tools
        ElemDirective,
        BlockDirective,
        RtuiSpinnerComponent,
        RtuiFileUploadComponent,
        RtIconOutlinedDirective,
    ],
})
export class RtuiImageUploadComponent {
    readonly #documentRef: Document = inject(DOCUMENT);

    readonly #formats: Record<string, IImageUploadFormat> = {
        ['png']: 'png',
        ['jpg']: 'jpeg',
        ['jpeg']: 'jpeg',
        ['webp']: 'webp',
    };
    readonly #originalMimeType: WritableSignal<string | null> = signal(null);
    protected readonly imageFormat: Signal<IImageUploadFormat> = computed((): IImageUploadFormat => {
        const type: Nullable<string> = this.#originalMimeType();
        return this.#formats[type?.toLowerCase() || ''] || 'png';
    });

    public imageUrl: ModelSignal<Nullable<string>> = model.required<Nullable<string>>();
    public isMobile: InputSignalWithTransform<boolean, boolean> = input.required<boolean, boolean>({
        transform: booleanAttribute,
    });
    public fileName: InputSignalWithTransform<string, string> = input<string, string>('image', {
        transform: transformStringInput,
    });
    public isActive: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });
    public isSaveButtonShown: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });
    public isDownloadButtonEnabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });
    public isTooltipDisabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public isActionsShown: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });
    public loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public tooltip: InputSignal<string> = input<string>('');
    public tooltipPosition: InputSignal<TooltipPosition> = input<TooltipPosition>('above');
    public imageQuality: InputSignal<number> = input<number>(92);

    public originalImage: WritableSignal<File | undefined> = signal(undefined);
    public croppedImage: WritableSignal<Nullable<File>> = signal(null);
    public tempImage: WritableSignal<Nullable<string>> = signal(null);

    public readonly imageChanged: OutputEmitterRef<File> = output<File>();
    public readonly save: OutputEmitterRef<void> = output<void>();

    public onFileSelect(event: Event): void {
        const input: HTMLInputElement = event.target as HTMLInputElement;

        if (input?.files?.length) {
            this.#originalMimeType.set(input.files[0].type);
            this.originalImage.set(input.files[0]);
        }
    }

    public onImageCropped(event: ImageCroppedEvent): void {
        if (event?.blob) {
            const croppedFile: File = new File([event.blob], this.fileName(), {
                type: event.blob.type,
            });

            this.croppedImage.set(croppedFile);
            this.tempImage.set(event.objectUrl);

            if (!this.isActionsShown() && event?.objectUrl) {
                this.imageChanged.emit(croppedFile);
                this.imageUrl.set(event.objectUrl);
            }
        }
    }

    public onFileUpload(file: File): void {
        this.#originalMimeType.set(file.type);
        this.originalImage.set(file);
    }

    public onApply(): void {
        if (this.croppedImage()) {
            this.imageChanged.emit(this.croppedImage() as File);
        }

        this.imageUrl.set(this.tempImage());
        this.originalImage.set(undefined);
    }

    public onCancel(): void {
        this.originalImage.set(undefined);
        this.croppedImage.set(null);
        this.tempImage.set(null);
    }

    public onDownloadImage(): void {
        if (this.imageUrl() && this.isDownloadButtonEnabled()) {
            const imageUrl: string = this.imageUrl() as string;
            const link: HTMLAnchorElement = this.#documentRef.createElement('a');
            link.href = imageUrl;
            link.download = 'Image';
            this.#documentRef.body.appendChild(link);
            link.click();
            this.#documentRef.body.removeChild(link);
        }

        this.save.emit();
    }
}
