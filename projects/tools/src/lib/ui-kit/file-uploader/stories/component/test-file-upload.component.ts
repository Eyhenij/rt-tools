import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtuiFileUploadComponent } from '../../rtui-file-upload.component';

@Component({
    standalone: true,
    selector: 'app-file-upload',
    templateUrl: './test-file-upload.component.html',
    styleUrls: ['./test-file-upload.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtuiFileUploadComponent,
    ],
})
export class TestFileUploadComponent {
    public onUpload(value: File): void {
        // eslint-disable-next-line no-console
        console.log('file upload: ', value);
    }
}
