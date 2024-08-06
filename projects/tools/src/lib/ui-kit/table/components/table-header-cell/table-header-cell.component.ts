import { NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    HostListener,
    InputSignal,
    OutputEmitterRef,
    Signal,
    computed,
    inject,
    input,
    output,
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
    standalone: true,
    selector: 'rtui-table-header-cell',
    templateUrl: './table-header-cell.component.html',
    styleUrls: ['./table-header-cell.component.scss'],
    imports: [
        MatIcon,
        MatIconButton,
        MatTooltip,
        MatMiniFabButton,
        BlockDirective,
        ElemDirective,
        ModDirective,
        NgClass,
        RtIconOutlinedDirective,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtuiTableHeaderCellComponent<SORT_PROPERTY> {
    readonly #sanitizer: DomSanitizer = inject(DomSanitizer);

    public headerModel: InputSignal<ITable.Header> = input.required<ITable.Header>();
    public currentSortPropertyName: InputSignal<SORT_PROPERTY> = input.required<SORT_PROPERTY>();
    public sortModel: InputSignal<Nullable<SortModel<SORT_PROPERTY>>> = input.required<Nullable<SortModel<SORT_PROPERTY>>>();
    public headerDataEllipsisMaxLines: InputSignal<number> = input<number>(1);

    public active: Signal<boolean> = computed(() => this.currentSortPropertyName() === this.sortModel()?.propertyName);

    public readonly sortChange: OutputEmitterRef<SortModel<SORT_PROPERTY>> = output<SortModel<SORT_PROPERTY>>();

    public readonly sortOrderType: typeof LIST_SORT_ORDER_ENUM = LIST_SORT_ORDER_ENUM;

    @HostBinding('style')
    private get style(): SafeStyle {
        return this.#sanitizer.bypassSecurityTrustStyle(`text-align: ${this.headerModel().align};`);
    }

    @HostListener('click')
    private handleClick(): void {
        const sortPropertyName: SORT_PROPERTY | undefined = this.sortModel()?.propertyName;
        if (sortPropertyName) {
            this.sortChange.emit({
                propertyName: sortPropertyName,
                sortDirection: this.#getNextSortOrder(sortPropertyName),
            });
        }
    }

    #getNextSortOrder(sortPropertyName: SORT_PROPERTY): ListSortOrderType {
        if (sortPropertyName === LIST_SORT_ORDER_ENUM.ASC) {
            return LIST_SORT_ORDER_ENUM.DESC;
        }

        return LIST_SORT_ORDER_ENUM.ASC;
    }
}
