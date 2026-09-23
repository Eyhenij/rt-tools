import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal, ViewEncapsulation, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { rtKitLabel } from '../../../i18n';
import { RtAsideRef } from '../../aside/rt-aside-ref';
import { RT_ASIDE_DATA } from '../../aside/rt-aside.tokens';
import { RtAsideComponent } from '../../aside/rt-aside.component';
import { RtAsideFooterComponent } from '../../aside/footer/rt-aside-footer.component';
import { RtAsideHeaderComponent } from '../../aside/header/rt-aside-header.component';
import { RtButtonDirective } from '../../button/rt-button.directive';
import { IRtDataTable } from '../../data-table/rt-data-table.model';
import { RtTableSettingsPanelComponent } from '../../table/settings-panel/rt-table-settings-panel.component';
import { IRtTable } from '../../table/rt-table.model';
import { RtToggleSwitchComponent } from '../../toggle-switch/rt-toggle-switch.component';
import { dataListColumnsFromItems, dataListSettingItems, dataListSettingsChanged } from '../rt-data-list-settings.logic';

const BEM_BLOCK: string = 'rt-data-list-settings-aside';

/**
 * Панель настройки колонок списка `rt-data-list` — панель первого кита без Material.
 *
 * Панель поднимает служба боковых панелей кита; настройку она получает её же данными и отдаёт
 * обратно закрытием. Сам список колонок рисует готовый редактор кита — перетаскивание и глаз у
 * него уже есть. Сохранение недоступно, пока в панели ничего не изменилось; отмена не меняет
 * ничего.
 */
@Component({
    selector: 'rt-data-list-settings-aside',
    templateUrl: './rt-data-list-settings-aside.component.html',
    styleUrl: './rt-data-list-settings-aside.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // components
        RtAsideComponent,
        RtAsideFooterComponent,
        RtAsideHeaderComponent,
        RtTableSettingsPanelComponent,
        RtToggleSwitchComponent,

        // directives
        BlockDirective,
        ElemDirective,
        FormsModule,
        RtButtonDirective,
    ],
    host: { class: BEM_BLOCK },
})
export class RtDataListSettingsAsideComponent<ENTITY_TYPE = Record<string, unknown>> {
    readonly #asideRef: RtAsideRef<IRtDataTable.Config.Data<ENTITY_TYPE>> =
        inject<RtAsideRef<IRtDataTable.Config.Data<ENTITY_TYPE>>>(RtAsideRef);

    /** Настройка, с которой панель открыли: с ней же сверяется, изменилось ли что-нибудь. */
    readonly #saved: IRtDataTable.Config.Data<ENTITY_TYPE> = inject(RT_ASIDE_DATA) as IRtDataTable.Config.Data<ENTITY_TYPE>;

    protected readonly title: Signal<string> = rtKitLabel('dataListSettingsTitle');
    protected readonly hint: Signal<string> = rtKitLabel('dataListSettingsHint');
    protected readonly verticalLabel: Signal<string> = rtKitLabel('dataListVerticalScrollbar');
    protected readonly horizontalLabel: Signal<string> = rtKitLabel('dataListHorizontalScrollbar');
    protected readonly saveLabel: Signal<string> = rtKitLabel('uiSave');
    protected readonly cancelLabel: Signal<string> = rtKitLabel('uiCancel');

    protected readonly items: WritableSignal<ReadonlyArray<IRtTable.ColumnSettingItem>> = signal(dataListSettingItems(this.#saved.columns));

    protected readonly isVerticalScrollbarShown: WritableSignal<boolean> = signal(this.#saved.isVerticalScrollbarShown);
    protected readonly isHorizontalScrollbarShown: WritableSignal<boolean> = signal(this.#saved.isHorizontalScrollbarShown);

    protected readonly config: Signal<IRtDataTable.Config.Data<ENTITY_TYPE>> = computed(() => ({
        isVerticalScrollbarShown: this.isVerticalScrollbarShown(),
        isHorizontalScrollbarShown: this.isHorizontalScrollbarShown(),
        columns: dataListColumnsFromItems(this.#saved.columns, this.items()),
    }));

    protected readonly isChanged: Signal<boolean> = computed(() => dataListSettingsChanged(this.#saved, this.config()));

    protected onSave(): void {
        this.#asideRef.close(this.config());
    }

    protected onCancel(): void {
        this.#asideRef.close();
    }
}
