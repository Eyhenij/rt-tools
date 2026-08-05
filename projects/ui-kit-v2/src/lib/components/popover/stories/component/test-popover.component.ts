import { ChangeDetectionStrategy, Component, TemplateRef } from '@angular/core';

import { RtPopoverDirective } from '../../rt-popover.directive';
import { IRtPopover } from '../../rt-popover.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-popover',
    template: `
        <div
            rtPopover
            [template]="template"
            [trigger]="trigger"
            [width]="width"
            [align]="align"
            [fitViewport]="fitViewport"
            [context]="context"
            [panelClass]="panelClass"
            [disabled]="disabled"
            [offsetY]="offsetY"
            [offsetX]="offsetX"></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtPopoverDirective,
    ],
})
export class TestRtPopoverComponent {
    public template: TemplateRef<unknown> | null = null;
    public trigger: IRtPopover.Trigger = 'click';
    public width: IRtPopover.Width = 'auto';
    public align: IRtPopover.Align = 'start';
    public fitViewport: boolean = false;
    public context: unknown = null;
    public panelClass: string = '';
    public disabled: boolean = false;
    public offsetY: number = 4;
    public offsetX: number = 0;
}
