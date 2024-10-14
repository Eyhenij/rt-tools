import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { ASIDE_REF, AsideRef, BreakpointService, Nullable, RtIconOutlinedDirective, areArraysEqual } from '../../../../util';
import { RtuiAsideContainerComponent, RtuiAsideContainerHeaderDirective } from '../../../aside';
import { RtuiDynamicSelectorAdditionalControlDirective, RtuiDynamicSelectorComponent } from '../../../dynamic-selectors';
import { ITable } from '../../util';

@Component({
    standalone: true,
    selector: 'rtui-test-aside',
    templateUrl: './rt-table-config-aside.component.html',
    styleUrls: ['./rt-table-config-aside.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,
        MatTooltip,
        MatIcon,
        MatIconButton,

        // directives
        BlockDirective,
        ElemDirective,
        RtuiAsideContainerHeaderDirective,
        RtuiDynamicSelectorAdditionalControlDirective,
        RtIconOutlinedDirective,

        // standalone components
        RtuiAsideContainerComponent,
        RtuiDynamicSelectorComponent,
    ],
    providers: [BreakpointService],
})
export class RtTableConfigAsideComponent<ENTITY_TYPE> implements OnInit {
    readonly #breakpointService: BreakpointService = inject(BreakpointService);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    public form: FormControl = new FormControl([]);

    public readonly asideRef: AsideRef<Array<ITable.Column<ENTITY_TYPE>>, Array<ITable.Column<ENTITY_TYPE>>> = inject(
        ASIDE_REF
    ) as AsideRef<Array<ITable.Column<ENTITY_TYPE>>, Array<ITable.Column<ENTITY_TYPE>>>;

    public readonly selectedColumns: WritableSignal<ITable.Column<ENTITY_TYPE>[]> = signal(this.asideRef.data);
    public readonly isMobile: Signal<boolean> = computed(() => {
        return !!this.#breakpointService.isMobile();
    });
    public readonly isVisibilityChanged: Signal<boolean> = computed(() => {
        const initValues: (keyof ENTITY_TYPE)[] = this.asideRef.data
            .filter((el: ITable.Column<ENTITY_TYPE>) => el.hidden)
            .map((el: ITable.Column<ENTITY_TYPE>) => el.propName);
        const currentValues: (keyof ENTITY_TYPE)[] = this.selectedColumns()
            .filter((el: ITable.Column<ENTITY_TYPE>) => el.hidden)
            .map((el: ITable.Column<ENTITY_TYPE>) => el.propName);
        return !areArraysEqual(initValues.sort(), currentValues.sort());
    });
    public readonly isOrderChanged: Signal<boolean> = computed(() => {
        const initValues: (keyof ENTITY_TYPE)[] = this.asideRef.data.map((el: ITable.Column<ENTITY_TYPE>) => el.propName);
        const currentValues: (keyof ENTITY_TYPE)[] = this.selectedColumns().map((el: ITable.Column<ENTITY_TYPE>) => el.propName);
        return !areArraysEqual(initValues, currentValues);
    });

    public ngOnInit(): void {
        this.form.patchValue(
            this.asideRef.data.map((el: ITable.Column<ENTITY_TYPE>) => el.propName),
            { emitEvent: false }
        );
        this.form.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((list: (keyof ENTITY_TYPE)[]) => {
            const updatedList: (ITable.Column<ENTITY_TYPE> & { orderIndex: number })[] = [];
            list.forEach((item: keyof ENTITY_TYPE, index: number) => {
                const currentItem: Nullable<ITable.Column<ENTITY_TYPE>> = this.selectedColumns().find(
                    (el: ITable.Column<ENTITY_TYPE>) => el.propName === item
                );
                if (currentItem) {
                    updatedList.push({ ...currentItem, orderIndex: index });
                }
            });
            this.selectedColumns.set(
                updatedList.sort(
                    (a: ITable.Column<ENTITY_TYPE> & { orderIndex: number }, b: ITable.Column<ENTITY_TYPE> & { orderIndex: number }) =>
                        a.orderIndex - b.orderIndex
                )
            );
        });
    }

    public save(): void {
        this.asideRef.close(this.selectedColumns());
    }

    public cancel(): void {
        this.asideRef.close();
    }

    public visibilityChange(entity: ITable.Column<ENTITY_TYPE>): void {
        this.selectedColumns.update((list: ITable.Column<ENTITY_TYPE>[]) => {
            return list.map((el: ITable.Column<ENTITY_TYPE>) => {
                return entity.propName === el.propName ? { ...el, hidden: !el.hidden } : el;
            });
        });
    }
}
