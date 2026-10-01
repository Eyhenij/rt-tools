import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IRtImageCropper } from '../../../image-cropper';
import { RtImageUploadComponent } from '../../rt-image-upload.component';
import { IRtImageUpload } from '../../rt-image-upload.model';

/**
 * Картинка встроена в адрес, а не берётся из сети: внешний источник отдаёт каждый раз новое
 * изображение, и кадр витрины плыл бы при неизменном компоненте. Тот же рисунок, что в истории
 * загрузчика первого кита, — их удобно сравнивать рядом.
 */
export const STORY_UPLOAD_IMAGE: string =
    'data:image/svg+xml;base64,' +
    btoa(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
            '<rect width="200" height="200" fill="#4284d7"/>' +
            '<circle cx="100" cy="78" r="34" fill="#fff"/>' +
            '<path d="M40 170c0-33 27-52 60-52s60 19 60 52z" fill="#fff"/>' +
            '</svg>'
    );

/**
 * Обёртка загрузчика для витрины: держит изменяемое состояние, на которое Storybook вешает
 * контролы, и больше ничего — как история загрузчика первого кита. В пакет не уезжает.
 */
@Component({
    selector: 'app-image-upload',
    templateUrl: './test-image-upload.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtImageUploadComponent,
    ],
})
export class TestRtImageUploadComponent {
    public imageUrl: string | null = STORY_UPLOAD_IMAGE;
    public fileName: string = 'logo.png';
    public tooltip: string = '';
    public downloadable: boolean = true;
    public downloadShape: IRtImageUpload.DownloadShape = 'circle';
    public autoApply: boolean = false;
    public loading: boolean = false;
    public disabled: boolean = false;
    public ratio: number | null = null;
    public round: boolean = false;
    public format: IRtImageCropper.Format | null = null;
    public quality: number = 92;

    public imageChanged(file: File): void {
        // eslint-disable-next-line no-console
        console.log('image changed:', file);
    }
}
