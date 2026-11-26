import { afterNextRender, ChangeDetectionStrategy, Component, inject, Injector, Signal, signal, viewChild } from '@angular/core';

import { RtContainerComponent } from '../../../container/rt-container.component';
import { RtContainerContentDirective, RtContainerRightSidenavDirective } from '../../../container/rt-container.directives';
import { ERtDataTableColumnType, IRtDataTable } from '../../../data-table/rt-data-table.model';
import { RtDataListSettingsAsideComponent } from '../../../data-list/settings/rt-data-list-settings-aside.component';
import { RtDetailListComponent } from '../../../detail-list/rt-detail-list.component';
import { RtDetailRowComponent } from '../../../detail-list/rt-detail-row.component';
import { RtFieldComponent } from '../../../field/rt-field.component';
import { RtSelectComponent } from '../../../select/rt-select.component';
import { IRtSelect } from '../../../select/rt-select.model';
import { IRtTable } from '../../../table/rt-table.model';
import { RtTableSettingsRegistry } from '../../../table/rt-table-settings.registry';
import { RtTableSettingsAsideComponent } from '../../../table/settings-aside/rt-table-settings-aside.component';
import { RtToolbarComponent, RtToolbarFiltersDirective } from '../../../toolbar/rt-toolbar.component';
import { RtWorkspaceComponent } from '../../../workspace/rt-workspace.component';
import {
    RtWorkspaceAsideDirective,
    RtWorkspaceCenterDirective,
    RtWorkspaceListDirective,
} from '../../../workspace/rt-workspace.directives';
import { RtAsideRef } from '../../rt-aside-ref';
import { RtAsideService } from '../../rt-aside.service';
import { TAsideSheetPanel, TestRtAsideSheetPanelComponent } from './test-rt-aside-sheet-panel.component';

/** Кадр макета асайда-шторки: что открыто поверх страницы. */
export type TAsideSheetFrame = TAsideSheetPanel | 'question' | 'filters' | 'workspace' | 'columns' | 'list';

/** Колонки таблицы броней: их показывает панель настроек колонок. */
const COLUMNS: ReadonlyArray<IRtTable.ColumnSettingItem> = [
    { key: 'guest', label: 'Гость', locked: true, hidden: false },
    { key: 'tour', label: 'Тур', hidden: false },
    { key: 'dates', label: 'Даты', hidden: false },
    { key: 'sum', label: 'Сумма', hidden: true },
];

/** Таблица броней списком: её вид настраивает панель «Вид списка». */
const LIST_CONFIG: IRtDataTable.Config.Data<Record<string, unknown>> = {
    isVerticalScrollbarShown: false,
    isHorizontalScrollbarShown: true,
    columns: [
        {
            align: 'left',
            propName: 'guest',
            type: ERtDataTableColumnType.TEXT,
            copyable: false,
            header: { align: 'left', label: 'Гость' },
            displayName: 'Гость',
            hidden: false,
        },
    ],
};

const STATUSES: ReadonlyArray<IRtSelect.Option<string>> = [
    { value: 'new', label: 'Новая' },
    { value: 'work', label: 'В работе', description: 'Заявку взял исполнитель' },
    { value: 'waiting', label: 'Ожидает ответа', description: 'Клиенту задан вопрос' },
    { value: 'closed', label: 'Закрыта' },
];

const PAYMENTS: ReadonlyArray<IRtSelect.Option<string>> = [
    { value: 'paid', label: 'Оплачено' },
    { value: 'due', label: 'Ждёт оплаты' },
];

const TABLE_ID: string = 'story-bookings';

/** Блок обёртки на её узле: страница под панелью во всю высоту окна. */
const BEM_BLOCK: string = 'app-aside-sheet';

/**
 * Демонстрационная обёртка витрины асайда-шторки: страница со списком броней и открытая поверх неё
 * панель того кадра, который назван входом. Панели службы кита открываются при первой отрисовке,
 * отборы полосы — нажатием кнопки фильтров из `play`, сведения рабочего стола и настройки колонок —
 * своими хозяевами. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-aside-sheet',
    templateUrl: './test-rt-aside-sheet.component.html',
    styleUrl: './test-rt-aside-sheet.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtToolbarComponent,
        RtToolbarFiltersDirective,
        RtFieldComponent,
        RtSelectComponent,
        RtWorkspaceComponent,
        RtWorkspaceListDirective,
        RtWorkspaceCenterDirective,
        RtWorkspaceAsideDirective,
        RtDetailListComponent,
        RtDetailRowComponent,
        RtContainerComponent,
        RtContainerContentDirective,
        RtContainerRightSidenavDirective,
        RtTableSettingsAsideComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class TestRtAsideSheetComponent {
    readonly #aside: RtAsideService = inject(RtAsideService);
    readonly #injector: Injector = inject(Injector);

    protected readonly workspace: Signal<RtWorkspaceComponent | undefined> = viewChild(RtWorkspaceComponent);
    protected readonly container: Signal<RtContainerComponent | undefined> = viewChild(RtContainerComponent);
    protected readonly statuses: ReadonlyArray<IRtSelect.Option<string>> = STATUSES;
    protected readonly payments: ReadonlyArray<IRtSelect.Option<string>> = PAYMENTS;

    public frame: TAsideSheetFrame = 'record';

    constructor() {
        const registry: RtTableSettingsRegistry = inject(RtTableSettingsRegistry);
        registry.register(TABLE_ID, {
            columns: signal(COLUMNS).asReadonly(),
            defaults: signal(COLUMNS).asReadonly(),
            apply: (): void => undefined,
        });
        registry.setActive(TABLE_ID);
        afterNextRender((): void => this.#open(), { injector: this.#injector });
    }

    #open(): void {
        switch (this.frame) {
            case 'record':
            case 'question':
                this.#unsaved(this.#panel('record'));
                return;
            case 'app':
            case 'tabs':
            case 'long-tabs':
            case 'footer':
                this.#panel(this.frame);
                return;
            case 'list':
                this.#aside.open(RtDataListSettingsAsideComponent, { data: LIST_CONFIG, position: 'right' });
                return;
            case 'workspace':
                this.workspace()?.openAside();
                return;
            case 'columns':
                this.container()?.openRight();
                return;
            default:
                return;
        }
    }

    /** Панель кадра открывает служба кита: какую из панелей рисовать, панель узнаёт из данных открытия. */
    #panel(panel: TAsideSheetPanel): RtAsideRef {
        return this.#aside.open<TestRtAsideSheetPanelComponent, TAsideSheetPanel>(TestRtAsideSheetPanelComponent, {
            data: panel,
            position: 'right',
        });
    }

    /** Кадр с вопросом: у записи несохранённые правки, и «×» спрашивает внизу экрана. */
    #unsaved(ref: RtAsideRef): void {
        ref.unsaved.set(this.frame === 'question');
    }
}
