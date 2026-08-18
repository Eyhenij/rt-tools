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

import { BlockDirective, ConcatClassesPipe, ElemDirective, ModDirective } from '@rt-tools/core';
import { TNullable } from '@rt-tools/utils';
import { EListSortOrder, TListSortOrderType, ISortModel } from '@rt-tools/utils';
import { RtIconOutlinedDirective } from '@rt-tools/core';
import { ITable } from '../../util/table-column.interface';

const BEM_BLOCK: string = 'rtui-table-header-cell';

@Component({
    selector: 'rtui-table-header-cell',
    host: { class: BEM_BLOCK },
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
        ConcatClassesPipe,
        ModDirective,

        // Directives
        RtIconOutlinedDirective,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtuiTableHeaderCellComponent {
    readonly #sanitizer: DomSanitizer = inject(DomSanitizer);
    protected readonly sortOrderTypes: typeof EListSortOrder = EListSortOrder;

    public headerModel: InputSignal<ITable.Header> = input.required<ITable.Header>();
    public sortModel: InputSignal<TNullable<ISortModel<string>>> = input.required<TNullable<ISortModel<string>>>();
    public currentSortModel: InputSignal<TNullable<ISortModel<string>>> = input.required<TNullable<ISortModel<string>>>();
    public headerDataEllipsisMaxLines: InputSignalWithTransform<number, number> = input<number, number>(1, {
        transform: numberAttribute,
    });

    public readonly sortChange: OutputEmitterRef<ISortModel<string>> = output<ISortModel<string>>();

    public readonly active: Signal<boolean> = computed(() => {
        return (
            !!this.currentSortModel()?.propertyName &&
            !!this.sortModel()?.propertyName &&
            this.currentSortModel()?.propertyName === this.sortModel()?.propertyName
        );
    });

    @HostBinding('style')
    protected get style(): SafeStyle {
        // eslint-disable-next-line sonarjs/no-angular-bypass-sanitization -- строка стиля собрана китом из настройки колонок, а не из значения, введённого пользователем
        return this.#sanitizer.bypassSecurityTrustStyle(`text-align: ${this.headerModel().align};`);
    }

    @HostListener('click')
    protected handleClick(): void {
        const sortPropertyName: TNullable<string> = this.sortModel()?.propertyName;

        if (sortPropertyName) {
            this.sortChange.emit({
                propertyName: sortPropertyName,
                sortDirection: this.getNextSortOrder(),
            });
        }
    }

    private getNextSortOrder(): TListSortOrderType {
        if (this.currentSortModel()?.sortDirection?.toLowerCase() === EListSortOrder.ASC) {
            return EListSortOrder.DESC;
        }

        return EListSortOrder.ASC;
    }
}
