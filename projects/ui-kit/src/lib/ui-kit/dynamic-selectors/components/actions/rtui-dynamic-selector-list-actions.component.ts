import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
} from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import { BlockDirective, BreakpointService, ElemDirective, ModDirective } from '@rt-tools/core';
import { RtIconOutlinedDirective } from '@rt-tools/core';

const BEM_BLOCK: string = 'rtui-dynamic-selector-list-actions';

@Component({
    selector: 'rtui-dynamic-selector-list-actions',
    host: { class: BEM_BLOCK },
    templateUrl: './rtui-dynamic-selector-list-actions.component.html',
    styleUrls: ['./rtui-dynamic-selector-list-actions.component.scss'],
    imports: [MatIcon, MatButton, RtIconOutlinedDirective, BlockDirective, ElemDirective, ModDirective, MatIconButton, MatTooltip],
    providers: [BreakpointService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtuiDynamicSelectorListActionsComponent {
    readonly #breakpoints: BreakpointService = inject(BreakpointService);

    /** Экран узкий: замер кита, и другого источника у этого признака нет. */
    protected readonly narrow: Signal<boolean> = computed(() => !!this.#breakpoints.isMobile());
    public isResetButtonDisabled: InputSignalWithTransform<boolean, boolean> = input.required<boolean, boolean>({
        transform: booleanAttribute,
    });
    public isClearButtonDisabled: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public disabled: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });

    public readonly resetAction: OutputEmitterRef<void> = output<void>();
    public readonly clearAction: OutputEmitterRef<void> = output<void>();

    public onReset(): void {
        this.resetAction.emit();
    }

    public onClear(): void {
        this.clearAction.emit();
    }
}
