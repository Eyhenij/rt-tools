import { BooleanInput } from '@angular/cdk/coercion';
import {
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    OnInit,
    booleanAttribute,
    inject,
    input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { EListSortOrder, IPageModel, ISortModel } from '@rt-tools/utils';

import { StoryRowComponent } from '../../../../../showcase';

import { RtDataTableStopRowClickDirective } from '../../../data-table/rt-data-table-row-click.directive';
import { RtDataTableConfigService } from '../../../data-table/rt-data-table-config.service';
import { RtIconButtonComponent } from '../../../icon-button/rt-icon-button.component';
import { RtMenuItemComponent } from '../../../menu/rt-menu-item.component';
import { RtToggleSwitchComponent } from '../../../toggle-switch/rt-toggle-switch.component';
import { RtDataListSelectorsDirective } from '../../rt-data-list-selectors.directive';
import { RtDataListToolbarActionsDirective, RtDataListToolbarSelectorsDirective } from '../../rt-data-list-toolbar.directive';
import { RtDataListComponent } from '../../rt-data-list.component';
import {
    RtDataListAdditionalRowActionsDirective,
    RtDataListCustomCellsDirective,
    RtDataListRowActionsDirective,
} from '../../rt-data-list.directive';
import { ITestPerson, TEST_PEOPLE_COLUMNS } from './test-data-list-people';

/**
 * Весь список так, как его показывает витрина первого кита: те же колонки, свои ячейки с кнопкой,
 * переключателем и картинкой, свои кнопки и переключатель в панели, действия строки и её меню.
 *
 * Пары половин у показа нет: боковая панель настройки колонок и меню строки открываются поверх
 * страницы, вне половины, и там рисовались бы своим набором. Набор и тему история ставит на всю
 * страницу.
 *
 * Обвязка витрины: `tsconfig.lib.json` исключает папки историй, в пакет не уезжает.
 */
@Component({
    selector: 'app-data-list-first-kit',
    templateUrl: './test-data-list-first-kit.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtDataListComponent,
        RtIconButtonComponent,
        RtMenuItemComponent,
        RtToggleSwitchComponent,
        StoryRowComponent,

        // directives
        RtDataListAdditionalRowActionsDirective,
        RtDataListCustomCellsDirective,
        RtDataListRowActionsDirective,
        RtDataListSelectorsDirective,
        RtDataListToolbarActionsDirective,
        RtDataListToolbarSelectorsDirective,
        RtDataTableStopRowClickDirective,

        // modules
        FormsModule,
    ],
    providers: [RtDataTableConfigService],
})
export class TestRtDataListFirstKitComponent implements OnInit {
    readonly #configService: RtDataTableConfigService<ITestPerson> = inject(RtDataTableConfigService);

    /** Одна ячейка ряда: весь список, подписанный набором, в котором он нарисован. */
    protected readonly captions: readonly string[] = ['вид первого кита, его фиолетовая тема'];

    /** Подпись ряда: какая это история первого кита. */
    public readonly caption: InputSignal<string> = input.required<string>();

    public readonly storageKey: InputSignal<string> = input.required<string>();
    public readonly rows: InputSignal<ITestPerson[]> = input<ITestPerson[]>([]);
    public readonly page: InputSignal<IPageModel> = input.required<IPageModel>();
    public readonly selectedIds: InputSignal<number[]> = input<number[]>([]);
    public readonly filtersShown: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly multiSelect: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    /** Порядок по номеру — как у первого кита в обеих историях. */
    public readonly sort: ISortModel<'id'> = { propertyName: 'id', sortDirection: EListSortOrder.ASC };

    public ngOnInit(): void {
        this.#configService.initConfig(this.storageKey(), TEST_PEOPLE_COLUMNS);
    }
}
