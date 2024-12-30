import { Clipboard } from '@angular/cdk/clipboard';
import { BooleanInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    HostBinding,
    HostListener,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    Signal,
    signal,
    WritableSignal,
} from '@angular/core';
import { MatIconButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { BlockDirective, ElemDirective, ModDirective } from '../../../../bem';
import { EmptyToDashPipe, isNumber, isString, Nullable, RtHideTooltipDirective, RtIconOutlinedDirective } from '../../../../util';
import { ITable } from '../../util/table-column.interface';

@Component({
    selector: 'rtui-table-base-cell',
    templateUrl: './table-base-cell.component.html',
    styleUrls: ['./table-base-cell.component.scss'],
    imports: [
        NgTemplateOutlet,

        // material
        MatIcon,
        MatIconButton,
        MatMiniFabButton,
        MatTooltip,

        // directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtIconOutlinedDirective,
        RtHideTooltipDirective,

        // pipes
        EmptyToDashPipe,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableBaseCellComponent<T = { [key: string]: unknown }> {
    readonly #clipboard: Clipboard = inject(Clipboard);
    readonly #sanitizer: DomSanitizer = inject(DomSanitizer);

    protected readonly cellValue: Signal<T[keyof T] | string | number> = computed(() => {
        const transformFn: Nullable<(value: T[keyof T]) => string | number> = this.column()?.transform;
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
    public isMobile: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

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
