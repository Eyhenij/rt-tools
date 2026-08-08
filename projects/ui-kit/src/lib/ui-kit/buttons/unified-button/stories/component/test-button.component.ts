import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtuiIconSizeType } from '../../../../icon/rtui-icon.component';
import { IRtuiButton, RtuiButtonComponent } from '../../rtui-button.component';

@Component({
    selector: 'app-button',
    templateUrl: './test-button.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtuiButtonComponent,
    ],
})
export class TestButtonComponent {
    public type: IRtuiButton.Type = 'pill';
    public variant: IRtuiButton.Variant = 'default';
    public size: IRtuiButton.Size | undefined = 'md';
    public radius: IRtuiButton.Radius | undefined = undefined;
    public appearance: IRtuiButton.Appearance | undefined = undefined;
    public iconPosition: IRtuiButton.IconPosition = 'start';
    public iconSize: RtuiIconSizeType | undefined = undefined;
    public icon: string = 'add';
    public text: string = 'Button';
    public loading: boolean = false;
    public disabled: boolean = false;
    public outlined: boolean = true;
    public fullWidth: boolean = false;
}
