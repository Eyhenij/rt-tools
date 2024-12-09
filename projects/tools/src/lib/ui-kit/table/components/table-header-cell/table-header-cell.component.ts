import { NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    HostBinding,
    HostListener,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    numberAttribute,
    output,
    OutputEmitterRef,
    Signal,
} from '@angular/core';
import { MatIconButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { BlockDirective, ElemDirective, ModDirective } from '../../../../bem';
import { Nullable, RtIconOutlinedDirective } from '../../../../util';
import { LIST_SORT_ORDER_ENUM, ListSortOrderType } from '../../util/list-sort-order.enum';
import { SortModel } from '../../util/lists.interface';
import { ITable } from '../../util/table-column.interface';

@Component({
    selector: 'rtui-table-header-cell',
    templateUrl: './table-header-cell.component.html',
    styleUrls: ['./table-header-cell.component.scss'],
    imports: [
        NgClass,

        // Material
        MatIcon,
        MatIconButton,
        MatTooltip,
        MatMiniFabButton,

        // Bem
        BlockDirective,
        ElemDirective,
        ModDirective,

        // Directives
        RtIconOutlinedDirective,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtuiTableHeaderCellComponent {
    readonly #sanitizer: DomSanitizer = inject(DomSanitizer);
    protected readonly sortOrderTypes: typeof LIST_SORT_ORDER_ENUM = LIST_SORT_ORDER_ENUM;

    public headerModel: InputSignal<ITable.Header> = input.required<ITable.Header>();
    public sortModel: InputSignal<Nullable<SortModel<string>>> = input.required<Nullable<SortModel<string>>>();
    public currentSortModel: InputSignal<Nullable<SortModel<string>>> = input.required<Nullable<SortModel<string>>>();
    public headerDataEllipsisMaxLines: InputSignalWithTransform<number, number> = input<number, number>(1, {
        transform: numberAttribute,
    });

    public readonly sortChange: OutputEmitterRef<SortModel<string>> = output<SortModel<string>>();

    public readonly active: Signal<boolean> = computed(() => {
        return (
            !!this.currentSortModel()?.propertyName &&
            !!this.sortModel()?.propertyName &&
            this.currentSortModel()?.propertyName === this.sortModel()?.propertyName
        );
    });

    @HostBinding('style')
    private get style(): SafeStyle {
        return this.#sanitizer.bypassSecurityTrustStyle(`text-align: ${this.headerModel().align};`);
    }

    @HostListener('click')
    private handleClick(): void {
        const sortPropertyName: Nullable<string> = this.sortModel()?.propertyName;

        if (sortPropertyName) {
            this.sortChange.emit({
                propertyName: sortPropertyName,
                sortDirection: this.getNextSortOrder(),
            });
        }
    }

    private getNextSortOrder(): ListSortOrderType {
        if (this.currentSortModel()?.sortDirection?.toLowerCase() === LIST_SORT_ORDER_ENUM.ASC) {
            return LIST_SORT_ORDER_ENUM.DESC;
        }

        return LIST_SORT_ORDER_ENUM.ASC;
    }
}
