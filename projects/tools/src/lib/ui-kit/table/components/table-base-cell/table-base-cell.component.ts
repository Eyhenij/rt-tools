import { Clipboard } from '@angular/cdk/clipboard';
import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    HostListener,
    InputSignal,
    InputSignalWithTransform,
    Signal,
    WritableSignal,
    booleanAttribute,
    computed,
    inject,
    input,
    signal,
} from '@angular/core';
import { MatIconButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { BlockDirective, ElemDirective, ModDirective } from '../../../../bem';
import { Nullable, RtHideTooltipDirective, RtIconOutlinedDirective, isNumber, isString } from '../../../../util';
import { ITable } from '../../util/table-column.interface';

@Component({
    standalone: true,
    selector: 'rtui-table-base-cell',
    templateUrl: './table-base-cell.component.html',
    styleUrls: ['./table-base-cell.component.scss'],
    imports: [
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
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableBaseCellComponent<T> {
    readonly #clipboard: Clipboard = inject(Clipboard);
    readonly #sanitizer: DomSanitizer = inject(DomSanitizer);

    protected readonly cellValue: Signal<T[keyof T]> = computed(() => {
        const transform: ((value: any) => string) | undefined = this.column()?.transform;
        return transform ? (transform(this.row()[this.column().propName]) as T[keyof T]) : this.row()[this.column().propName];
    });
    protected readonly isMouseOver: WritableSignal<boolean> = signal(false);
    protected readonly isCopied: WritableSignal<boolean> = signal(false);

    public row: InputSignal<T> = input.required();
    public column: InputSignal<ITable.Column<T>> = input.required();
    public isMobile: InputSignalWithTransform<Nullable<boolean>, Nullable<boolean>> = input<Nullable<boolean>, Nullable<boolean>>(false, {
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

    public onCopyToClipboard(): void {
        if (this.column().copyable) {
            if (isString(this.cellValue())) {
                this.#clipboard.copy(this.cellValue() as string);
            } else if (isNumber(this.cellValue())) {
                this.#clipboard.copy((this.cellValue() as number).toString());
            } else {
                this.#clipboard.copy(JSON.stringify(this.cellValue()));
            }

            this.isCopied.set(true);
            setTimeout(() => this.isCopied.set(false), 2000);
        }
    }
}
