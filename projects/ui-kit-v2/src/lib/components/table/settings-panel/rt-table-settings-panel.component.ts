import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { inject, model, ChangeDetectionStrategy, Component, ModelSignal, Signal, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, RtKitLabelMap } from '../../../i18n';
import { RtIconButtonComponent } from '../../icon-button/rt-icon-button.component';
import { RtIconComponent } from '../../icon/rt-icon.component';
import { IRtTable } from '../rt-table.model';

const BEM_BLOCK: string = 'rt-table-settings-panel';

/**
 * Презентационный редактор списка колонок таблицы: reorder (drag-drop) + видимость
 * (глаз). Locked-колонки всегда видимы и не перетаскиваются. Двусторонний `items` —
 * текущее состояние; контейнер (route-асайд настроек) владеет сигналом, читает его
 * для «Сохранить»/«Сбросить» и передаёт сюда через `[(items)]`.
 */
@Component({
    selector: 'rt-table-settings-panel',
    templateUrl: './rt-table-settings-panel.component.html',
    styleUrl: './rt-table-settings-panel.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // @angular/cdk
        CdkDrag,
        CdkDragHandle,
        CdkDropList,

        // standalone components / directives
        RtIconButtonComponent,
        RtIconComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtTableSettingsPanelComponent {
    protected readonly t: Signal<RtKitLabelMap> = inject(RT_KIT_LABELS);

    public readonly items: ModelSignal<ReadonlyArray<IRtTable.ColumnSettingItem>> =
        model.required<ReadonlyArray<IRtTable.ColumnSettingItem>>();

    /** Reorder через drag-drop. Locked-строки drag-disabled; индексы — по всему списку. */
    protected onDrop(event: CdkDragDrop<ReadonlyArray<IRtTable.ColumnSettingItem>>): void {
        if (event.previousIndex === event.currentIndex) {
            return;
        }
        const next: IRtTable.ColumnSettingItem[] = [...this.items()];
        moveItemInArray(next, event.previousIndex, event.currentIndex);
        this.items.set(next);
    }

    /** Переключить видимость колонки (locked — нельзя). */
    protected onToggleHidden(key: string): void {
        this.items.update((items: ReadonlyArray<IRtTable.ColumnSettingItem>): ReadonlyArray<IRtTable.ColumnSettingItem> =>
            items.map((item: IRtTable.ColumnSettingItem): IRtTable.ColumnSettingItem =>
                item.key === key && item.locked !== true ? { ...item, hidden: !item.hidden } : item
            )
        );
    }
}
