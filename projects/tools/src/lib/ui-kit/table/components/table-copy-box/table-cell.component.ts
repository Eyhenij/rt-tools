import { Clipboard } from '@angular/cdk/clipboard';
import {
    AfterContentChecked,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
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
    viewChild,
} from '@angular/core';
import { MatIconButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { BlockDirective, ElemDirective, ModDirective } from '../../../../bem';
import { Nullable, isNumber, isString } from '../../../../util';
import { ITable } from '../../util/table-column.interface';

@Component({
    standalone: true,
    selector: 'rtui-table-cell',
    templateUrl: './table-cell.component.html',
    styleUrls: ['./table-cell.component.scss'],
    imports: [MatIcon, MatIconButton, MatMiniFabButton, MatTooltip, BlockDirective, ElemDirective, ModDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableCellComponent<T> implements AfterContentChecked {
    readonly #clipboard: Clipboard = inject(Clipboard);
    readonly #sanitizer: DomSanitizer = inject(DomSanitizer);

    protected readonly cellValue: Signal<T[keyof T]> = computed(() => this.row()[this.column().propName]);
    protected readonly isTitleCollapsed: WritableSignal<boolean> = signal(false);
    protected readonly isMouseOver: WritableSignal<boolean> = signal(false);
    protected readonly isCopied: WritableSignal<boolean> = signal(false);

    protected readonly titleTplRef: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>('titleTpl');

    public row: InputSignal<T> = input.required();
    public column: InputSignal<ITable.Column<T>> = input.required();
    public isMobile: InputSignalWithTransform<Nullable<boolean>, boolean> = input.required<Nullable<boolean>, boolean>({
        transform: booleanAttribute,
    });
    // TODO: get rid of this
    public isTitleArray: InputSignalWithTransform<Nullable<boolean>, boolean> = input<Nullable<boolean>, boolean>(null, {
        transform: booleanAttribute,
    });
    public breakTitle: InputSignalWithTransform<Nullable<boolean>, boolean> = input<Nullable<boolean>, boolean>(null, {
        transform: booleanAttribute,
    });
    public isCopyButtonShown: InputSignalWithTransform<Nullable<boolean>, boolean> = input<Nullable<boolean>, boolean>(true, {
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

    public ngAfterContentChecked(): void {
        setTimeout(() => {
            this.checkEllipsis();
        }, 500);
    }

    public checkEllipsis(): void {
        const element: HTMLElement = this.titleTplRef()?.nativeElement;

        if (element) {
            const titleWidth: number = element.offsetWidth;
            const textWidth: number = element.scrollWidth;
            if (textWidth > titleWidth) {
                this.isTitleCollapsed.set(true);
            }
        }
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
