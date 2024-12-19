import { NgStyle, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { BreakpointService, EmptyToDashPipe, RtIconOutlinedDirective } from '../../../../util';
import { RtPopoverDirective } from '../../../popover/rt-popover.directive';
import { IRtActionBar } from '../../action-bar-config.interface';

@Component({
    selector: 'rtui-action-bar',
    templateUrl: 'rtui-action-bar.component.html',
    styleUrls: ['rtui-action-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgTemplateOutlet,
        NgStyle,
        // material
        MatIcon,
        // rt-tools
        BlockDirective,
        ElemDirective,
        EmptyToDashPipe,
        RtIconOutlinedDirective,
        RtPopoverDirective,
    ],
    providers: [BreakpointService],
})
export class RtuiActionBarComponent {
    readonly #breakpointService: BreakpointService = inject(BreakpointService);

    public config: InputSignal<IRtActionBar.Config> = input.required();

    public readonly closeAction: OutputEmitterRef<void> = output<void>();

    public readonly isTablet: Signal<boolean> = computed(() => !!this.#breakpointService.isTablet());

    public onClose(): void {
        this.closeAction.emit();
    }

    public onAction(button: IRtActionBar.Button): void {
        if (button?.action) {
            button.action();
            this.onClose();
        }
    }
}
