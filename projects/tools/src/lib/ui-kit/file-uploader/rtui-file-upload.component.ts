import { ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, WritableSignal, input, output, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { BlockDirective, ElemDirective } from '../../bem';
import { RtIconOutlinedDirective } from '../../util';

@Component({
    standalone: true,
    selector: 'rtui-file-upload',
    templateUrl: './rtui-file-upload.component.html',
    styleUrls: ['./rtui-file-upload.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatButton,
        MatIcon,

        // directives
        ElemDirective,
        BlockDirective,
        RtIconOutlinedDirective,
    ],
    host: {
        '[class.--dragged]': 'isDragOver()',
        '(dragover)': 'onDragOver($event)',
        '(dragleave)': 'onDragLeave($event)',
        '(drop)': 'onDrop($event)',
    },
})
export class RtuiFileUploadComponent {
    public isIconOutlined: InputSignal<boolean> = input(true);

    public readonly uploadFile: OutputEmitterRef<File> = output<File>();

    public readonly isDragOver: WritableSignal<boolean> = signal(false);

    public onDragOver(event: DragEvent): void {
        event?.preventDefault();
        this.isDragOver.set(true);
    }

    public onDragLeave(event: DragEvent): void {
        event?.preventDefault();
        this.isDragOver.set(false);
    }

    public onDrop(event: DragEvent): void {
        event?.preventDefault();
        this.isDragOver.set(false);
        if (event.dataTransfer && event.dataTransfer.files.length > 0) {
            this.uploadFile.emit(event.dataTransfer.files[0]);
        }
    }

    public onFileSelect(event: Event): void {
        const input: HTMLInputElement = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.uploadFile.emit(input.files[0]);
        }
    }
}
