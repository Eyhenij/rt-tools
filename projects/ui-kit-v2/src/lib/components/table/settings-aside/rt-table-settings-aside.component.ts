import {
    computed,
    effect,
    inject,
    signal,
    ChangeDetectionStrategy,
    Component,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { Observable, of } from 'rxjs';

import { RT_KIT_LABELS, RtKitLabelMap } from '../../../i18n';
import { RtAsideFooterComponent } from '../../aside/footer/rt-aside-footer.component';
import { RtAsideHeaderComponent } from '../../aside/header/rt-aside-header.component';
import { RtAsideComponent } from '../../aside/rt-aside.component';
import { RtButtonDirective } from '../../button/rt-button.directive';
import { RtContainerRightSidenavPanelDirective } from '../../container/rt-container.directives';
import { RtRouteAsideComponent } from '../../container/rt-route-aside.base';
import { RtIconButtonComponent } from '../../icon-button/rt-icon-button.component';
import { RtTableSettingsPanelComponent } from '../settings-panel/rt-table-settings-panel.component';
import { RtTableSettingsRegistry, type IRtTableSettingsRegistration } from '../rt-table-settings.registry';
import { IRtTable } from '../rt-table.model';

const BEM_BLOCK: string = 'rt-table-settings-aside';

/**
 * Общий route-driven side-sheet настроек колонок для любой `rt-table`. Открывается
 * навигацией на `(ro:table-settings)`; какая таблица настраивается — берётся из
 * `RtTableSettingsRegistry.active()` (потребитель выставляет `setActive(tableId)`
 * перед навигацией). Create-mode: id в route нет (`tableId` — строка, числовой базой
 * не резолвится).
 *
 * Тело списка (drag-reorder + видимость) — переиспользуемый `rt-table-settings-panel`;
 * «Сохранить»/«Сбросить» живут в chrome асайда над локальным `items`, засеянным из
 * активной регистрации. Регистрируется в `routes.ts` каждого shell под `outlet: "ro"`.
 */
@Component({
    selector: 'rt-table-settings-aside',
    templateUrl: './rt-table-settings-aside.component.html',
    styleUrls: ['./rt-table-settings-aside.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        RtAsideComponent,
        RtAsideFooterComponent,
        RtAsideHeaderComponent,
        RtButtonDirective,
        RtContainerRightSidenavPanelDirective,
        RtIconButtonComponent,
        RtTableSettingsPanelComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtTableSettingsAsideComponent extends RtRouteAsideComponent<never> {
    readonly #registry: RtTableSettingsRegistry = inject(RtTableSettingsRegistry);

    /**
     * `active` на момент создания асайда: `null` — восстановление после F5
     * (`setActive` никто не звал), непустой id — штатное открытие потребителем.
     */
    readonly #initialActive: string | null = this.#registry.active();

    /** Регистрация активной таблицы (её колонки/дефолты/apply). Реактивна к реестру. */
    readonly #registration: Signal<IRtTableSettingsRegistration | null> = computed((): IRtTableSettingsRegistration | null => {
        const tableId: string | null = this.#registry.active();
        return tableId !== null ? this.#registry.get(tableId)() : null;
    });

    /** Рабочая копия списка колонок (сидится из регистрации, редактируется телом-панелью). */
    protected readonly t: Signal<RtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly items: WritableSignal<ReadonlyArray<IRtTable.ColumnSettingItem>> = signal<ReadonlyArray<IRtTable.ColumnSettingItem>>(
        []
    );

    #seeded: boolean = false;

    /** Асайд восстановил `active` сам (после F5) — дальше живёт по штатным правилам. */
    #adopted: boolean = false;

    constructor() {
        super();
        // Фикс F-16: после F5 асайд инициализируется раньше `rt-table`, реестр в
        // этот момент пуст и `active` сброшен (root-сервис пересоздан). Вместо
        // самозакрытия на первом промахе ждём регистрацию: страница регистрирует
        // ровно одну настраиваемую таблицу — она и становится активной.
        if (this.#initialActive === null) {
            effect((): void => {
                // Усыновление одноразовое: после него асайд живёт по штатным
                // правилам (уход со страницы = закрытие), а не перепрыгивает
                // на таблицу следующей страницы.
                if (this.#adopted || this.#registry.active() !== null) {
                    return;
                }
                const sole: string | null = this.#registry.soleTableId();
                if (sole !== null) {
                    this.#adopted = true;
                    this.#registry.setActive(sole);
                }
            });
        }
        effect((): void => {
            const registration: IRtTableSettingsRegistration | null = this.#registration();
            const panel: RtContainerRightSidenavPanelDirective | undefined = this.panel();
            if (panel === undefined || !panel.ready()) {
                return;
            }
            if (registration === null) {
                // Штатно открытый (или уже усыновивший таблицу) асайд закрывается,
                // когда регистрация исчезла — уход со страницы таблицы. Асайд,
                // восстановленный после F5, регистрацию ещё ЖДЁТ — не закрываемся.
                if (this.#initialActive !== null || this.#adopted) {
                    this.onClose();
                }
                return;
            }
            if (!this.#seeded) {
                this.#seeded = true;
                this.items.set(
                    registration.columns().map((c: IRtTable.ColumnSettingItem): IRtTable.ColumnSettingItem => ({
                        ...c,
                    }))
                );
            }
        });
    }

    protected resolve(): Observable<never | null> {
        return of(null);
    }

    /** Сбросить рабочую копию к дефолтным колонкам из конфига. */
    protected onReset(): void {
        const registration: IRtTableSettingsRegistration | null = this.#registration();
        if (registration === null) {
            return;
        }
        this.items.set(registration.defaults().map((c: IRtTable.ColumnSettingItem): IRtTable.ColumnSettingItem => ({ ...c })));
    }

    /** Применить настройки к таблице (через registry) и закрыть асайд. */
    protected onSave(): void {
        const registration: IRtTableSettingsRegistration | null = this.#registration();
        if (registration !== null) {
            const items: ReadonlyArray<IRtTable.ColumnSettingItem> = this.items();
            registration.apply({
                order: items.map((item: IRtTable.ColumnSettingItem): string => item.key),
                hidden: items
                    .filter((item: IRtTable.ColumnSettingItem): boolean => item.hidden)
                    .map((item: IRtTable.ColumnSettingItem): string => item.key),
            });
        }
        this.#registry.clearActive();
        this.onClose();
    }
}
