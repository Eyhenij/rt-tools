import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TooltipPosition } from '@angular/material/tooltip';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { RtuiToggleComponent } from '../../rtui-toggle.component';
import { TOGGLE_SIZE_TYPE_ENUM, ToggleSizeType } from '../../toggle-size.type.enum';

@Component({
    standalone: true,
    selector: 'app-toggle',
    templateUrl: './test-toggle.component.html',
    styleUrls: ['./test-toggle.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // directives
        BlockDirective,
        ElemDirective,

        // components
        RtuiToggleComponent,
        FormsModule,
    ],
})
export class TestToggleComponent {
    public value: boolean = true;
    public disabled: boolean = false;
    public tooltipDisabled: boolean = false;
    public size: ToggleSizeType = TOGGLE_SIZE_TYPE_ENUM.MD;
    public label: string = 'Label Example';
    public tooltip: string = 'Tooltip Example';
    public tooltipPosition: TooltipPosition = 'below';

    public onChange(value: boolean): void {
        // eslint-disable-next-line no-console
        console.log('toggle action: ', value);
    }
}
