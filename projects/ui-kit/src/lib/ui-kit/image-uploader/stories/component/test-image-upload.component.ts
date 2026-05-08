import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtuiImageUploadComponent } from '../../image-uploader/rtui-image-upload.component';

@Component({
    selector: 'app-image-upload',
    templateUrl: './test-image-upload.component.html',
    styleUrls: ['./test-image-upload.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtuiImageUploadComponent,
    ],
})
export class TestImageUploadComponent {
    public imageUrl: string = '';

    public imageChanged(file: File): void {
        // eslint-disable-next-line no-console
        console.log('image changed:', file);
    }
}
