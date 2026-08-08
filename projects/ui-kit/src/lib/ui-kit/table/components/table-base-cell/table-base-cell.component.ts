import { Clipboard } from '@angular/cdk/clipboard';

import {
    ChangeDetectionStrategy,
    Component,
    computed,
    HostBinding,
    HostListener,
    inject,
    input,
    InputSignal,
    Signal,
    signal,
    WritableSignal,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { BlockDirective, BreakpointService, ConcatClassesPipe, ElemDirective, ModDirective } from '@rt-tools/core';
import { INullable } from '@rt-tools/utils';
import { isNumber, isString } from '@rt-tools/utils';
import { EmptyToDashPipe, RtIconOutlinedDirective } from '@rt-tools/core';
import { RtHideTooltipDirective } from '../../../tooltip';
import { ITable } from '../../util/table-column.interface';

const BEM_BLOCK: string = 'rtui-table-base-cell';

@Component({
    selector: 'rtui-table-base-cell',
    host: { class: BEM_BLOCK },
    templateUrl: './table-base-cell.component.html',
    styleUrls: ['./table-base-cell.component.scss'],
    providers: [BreakpointService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // material
        MatIcon,
        MatTooltip,

        // directives
        BlockDirective,
        ElemDirective,
        ConcatClassesPipe,
        ModDirective,
        RtIconOutlinedDirective,
        RtHideTooltipDirective,

        // pipes
        EmptyToDashPipe,
    ],
})
export class TableBaseCellComponent<T = { [key: string]: unknown }> {
    readonly #breakpoints: BreakpointService = inject(BreakpointService);
    readonly #clipboard: Clipboard = inject(Clipboard);
    readonly #sanitizer: DomSanitizer = inject(DomSanitizer);

    /** Экран узкий: значение входа, если приложение его дало, иначе замер кита. */
    protected readonly narrow: Signal<boolean> = computed(() => this.isMobile() ?? !!this.#breakpoints.isMobile());

    protected readonly cellValue: Signal<T[keyof T] | string | number> = computed(() => {
        const transformFn: INullable<(value: T[keyof T]) => string | number> = this.column()?.transform;
        return transformFn ? transformFn(this.row()[this.column().propName]) : this.row()[this.column().propName];
    });
    protected readonly cellIconStyle: Signal<SafeStyle | undefined> = computed(() => {
        const transformFn: ((value: T[keyof T]) => string) | undefined = this.column()?.iconTransform;
        return transformFn ? this.#sanitizer.bypassSecurityTrustStyle(transformFn(this.row()[this.column().propName])) : undefined;
    });
    protected readonly tooltipValue: Signal<string> = computed(() => this.#covertCellValueToString(this.cellValue()));
    protected readonly isMouseOver: WritableSignal<boolean> = signal(false);
    protected readonly isCopied: WritableSignal<boolean> = signal(false);

    public row: InputSignal<T> = input.required();
    public column: InputSignal<ITable.Column<T>> = input.required();
    /**
     * Признак узкого экрана.
     *
     * @deprecated Кит определяет его сам — `BreakpointService` из `@rt-tools/core`. Вход
     * оставлен ради приложений, которые уже его передают, и уйдёт в следующем крупном выпуске.
     */
    public isMobile: InputSignal<INullable<boolean>> = input<INullable<boolean>>(null);

    @HostBinding('style')
    public get style(): SafeStyle | undefined {
        let style: string = '';

        if (this.column().width !== undefined) {
            style += `width: ${this.column().width};`;
        }

        if (this.column().minWidth !== undefined) {
            style += `min-width: ${this.column().minWidth};`;
        }

        return !!style.length ? this.#sanitizer.bypassSecurityTrustStyle(style) : undefined;
    }

    public get copyBtnPosition(): string {
        const { copyBtnAlign, align } = this.column();
        return copyBtnAlign || (align === 'right' ? 'left' : 'right');
    }

    @HostListener('mouseover')
    public onMouseOver(): void {
        this.isMouseOver.set(true);
    }

    @HostListener('mouseout')
    public onMouseOut(): void {
        this.isMouseOver.set(false);
    }

    public onCopyToClipboard(): void {
        if (this.column().copyable) {
            this.#clipboard.copy(this.#covertCellValueToString(this.cellValue()));
            this.isCopied.set(true);
            setTimeout(() => this.isCopied.set(false), 2000);
        }
    }

    #covertCellValueToString(value: T[keyof T] | string | number): string {
        if (isString(value)) {
            return value;
        } else if (isNumber(value)) {
            return value.toString();
        } else {
            return JSON.stringify(value);
        }
    }
}
