import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip, TooltipPosition } from '@angular/material/tooltip';

import { BlockDirective, BreakpointService, ElemDirective, ModDirective } from '@rt-tools/core';
import { TNullable } from '@rt-tools/utils';
import { isString } from '@rt-tools/utils';

const BEM_BLOCK: string = 'rtui-clear-button';

@Component({
    selector: 'rtui-clear-button',
    host: { class: BEM_BLOCK },
    templateUrl: './rtui-clear-button.component.html',
    styleUrls: ['./rtui-clear-button.component.scss'],
    providers: [BreakpointService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // Material
        MatIcon,
        MatIconButton,
        MatTooltip,

        // BEM
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
})
export class RtuiClearButtonComponent {
    readonly #breakpoints: BreakpointService = inject(BreakpointService);

    /** Экран узкий: значение входа, если приложение его дало, иначе замер кита. */
    // eslint-disable-next-line sonarjs/deprecation -- вход оставлен ради приложений, которые его уже передают, — кит определяет узкий экран сам и читает вход только как запасной ответ
    protected readonly narrow: Signal<boolean> = computed(() => this.isMobile() ?? !!this.#breakpoints.isMobile());
    readonly #defaultTooltipPosition: TooltipPosition = 'above';

    /**
     * Признак узкого экрана.
     *
     * @deprecated Кит определяет его сам — `BreakpointService` из `@rt-tools/core`. Вход
     * оставлен ради приложений, которые уже его передают, и уйдёт в следующем крупном выпуске.
     */
    public isMobile: InputSignal<TNullable<boolean>> = input<TNullable<boolean>>(null);
    public isButtonShown: InputSignalWithTransform<TNullable<boolean>, boolean> = input<TNullable<boolean>, boolean>(true, {
        transform: booleanAttribute,
    });
    public tooltip: InputSignalWithTransform<TNullable<string>, string> = input<TNullable<string>, string>(null, {
        transform: (value: TNullable<string>) => (isString(value) ? value.trim() : ''),
    });
    public tooltipPosition: InputSignal<TooltipPosition> = input(this.#defaultTooltipPosition);

    public readonly keydownAction: OutputEmitterRef<void> = output<void>();
    public readonly clickAction: OutputEmitterRef<void> = output<void>();

    public onKeydown(): void {
        this.keydownAction.emit();
    }

    public onClick(): void {
        this.clickAction.emit();
    }
}
