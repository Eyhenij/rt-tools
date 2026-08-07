import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtButtonDirective } from '../../../button/rt-button.directive';
import { RtPopoverDirective } from '../../rt-popover.directive';
import { IRtPopover } from '../../rt-popover.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Директива висит на кнопке, а панель объявлена здесь же шаблоном: без того и другого история
 * рисовала пустой `div` и панель, которой неоткуда взяться.
 */
@Component({
    selector: 'app-popover',
    template: `
        <ng-template #panelTpl>
            <div class="app-popover__panel">Содержимое панели</div>
        </ng-template>

        <button
            rtButton
            type="button"
            label="Открыть панель"
            aria-label="Открыть панель"
            [rtPopover]="panelTpl"
            [rtPopoverTrigger]="trigger"
            [rtPopoverWidth]="width"
            [rtPopoverAlign]="align"
            [rtPopoverFitViewport]="fitViewport"
            [rtPopoverPanelClass]="panelClass"
            [rtPopoverDisabled]="disabled"
            [rtPopoverOffsetY]="offsetY"
            [rtPopoverOffsetX]="offsetX"></button>
    `,
    styles: `
        /* Своего оформления у директивы нет — панель красит содержимое, и здесь оно
           демонстрационное: рамка и фон взяты из свойств кита, чтобы панель было видно. */
        .app-popover__panel {
            padding: var(--rt-space-sm) var(--rt-space-md);
            border: 1px solid var(--rt-color-border-subtle);
            border-radius: var(--rt-radius-sm);
            background: var(--rt-color-bg-surface);
            box-shadow: var(--rt-shadow-md);
            color: var(--rt-color-text-primary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtButtonDirective,
        RtPopoverDirective,
    ],
})
export class TestRtPopoverComponent {
    public trigger: IRtPopover.Trigger = 'click';
    public width: IRtPopover.Width = 'auto';
    public align: IRtPopover.Align = 'start';
    public fitViewport: boolean = false;
    public panelClass: string = '';
    public disabled: boolean = false;
    public offsetY: number = 4;
    public offsetX: number = 0;
}
