import { CdkTableModule } from '@angular/cdk/table';
import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { concatMap, Observable, Subject, tap } from 'rxjs';

import { translateSignal, TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { EListSortOrder, ISortModel } from '@rt-tools/utils';

import { RtButtonDirective } from '../../../../lib/components/button/rt-button.directive';
import { RtEmptyStateComponent } from '../../../../lib/components/empty-state/rt-empty-state.component';
import { RtFieldComponent } from '../../../../lib/components/field/rt-field.component';
import { RtTableSettingsRegistry } from '../../../../lib/components/table/rt-table-settings.registry';
import { RtFilterControlComponent } from '../../../../lib/components/filter-control/rt-filter-control.component';
import { IRtFilterControl } from '../../../../lib/components/filter-control/rt-filter-control.model';
import { RtIconButtonComponent } from '../../../../lib/components/icon-button/rt-icon-button.component';
import { RtInputNumberComponent } from '../../../../lib/components/input-number/rt-input-number.component';
import { RtMenuItemComponent } from '../../../../lib/components/menu/rt-menu-item.component';
import { RtCopyCellComponent } from '../../../../lib/components/table/copy-cell/rt-copy-cell.component';
import { RtTableComponent } from '../../../../lib/components/table/rt-table.component';
import { RtTableRowActionsDirective } from '../../../../lib/components/table/rt-table-row-actions.directive';
import { RtTableRowDirective } from '../../../../lib/components/table/rt-table-row.directive';
import { IRtTable } from '../../../../lib/components/table/rt-table.model';
import { RtTagComponent } from '../../../../lib/components/tag/rt-tag.component';
import { IRtTag } from '../../../../lib/components/tag/rt-tag.model';
import { NotificationBus } from '../../../../lib/platform/notification-bus.service';
import { APP_PAGE_BLOCK } from '../../app-layout.const';
import { AppSortHeaderDirective } from '../app-sort-header.directive';
import { SHOWCASE_PROPERTIES } from '../booking.data';
import {
    canCancelBooking,
    canConfirmBooking,
    canRejectBooking,
    EBookingMailBadge,
    EBookingSortProperty,
    EBookingSource,
    EBookingStatus,
    IBooking,
} from '../booking.model';
import { BookingsStore } from '../bookings.store';
import { AppListPageComponent } from '../list-page/app-list-page.component';
import { IListPage } from '../list-page/list-page.model';
import { provideListPage } from '../list-page/list-page.token';

/**
 * Раскладка экрана — общий блок слоя, а не своя: `src/showcase/templates/styles/_page.scss`.
 * Своё имя (`app-bookings-page`) носит только полоса подтверждения: она принадлежит одному
 * этому списку и объявляется директивой в шаблоне.
 */
const BEM_BLOCK: string = APP_PAGE_BLOCK;

/**
 * Свой ключ настроек таблицы: выбор столбцов лежит в хранилище под ним, и общий с другой
 * таблицей склеил бы два разных набора в одной записи.
 */
const BOOKINGS_TABLE_ID: string = 'showcase-bookings';

/** Смена состояния, уехавшая на сервер: полоса подтверждения закрывается только после успеха. */
interface IStatusRequest {
    readonly booking: IBooking.State;
    readonly status: EBookingStatus;
    readonly totalThb: number | null;
    readonly closeConfirm: boolean;
}

/** Строка таблицы: запись плюс всё, что о ней уже посчитано. */
interface IBookingRow {
    booking: IBooking.State;
    propertyLabel: string;
    sourceLabel: string;
    statusLabel: string;
    statusSeverity: IRtTag.Severity;
    /** Исход писем по заявке; `None` — писем не было, и значка нет вовсе. */
    mailBadge: EBookingMailBadge;
    mailLabel: string;
    mailSeverity: IRtTag.Severity;
    canConfirm: boolean;
    canReject: boolean;
    canCancel: boolean;
}

/** Ключи подписей: язык страницы известен только после старта приложения. */
const SOURCE_LABEL_KEYS: Readonly<Record<EBookingSource, string>> = {
    [EBookingSource.Site]: 'bookingSourceSite',
    [EBookingSource.Airbnb]: 'bookingSourceAirbnb',
    [EBookingSource.Booking]: 'bookingSourceBooking',
    [EBookingSource.Agoda]: 'bookingSourceAgoda',
    [EBookingSource.Vrbo]: 'bookingSourceVrbo',
    [EBookingSource.Direct]: 'bookingSourceDirect',
};

const STATUS_LABEL_KEYS: Readonly<Record<EBookingStatus, string>> = {
    [EBookingStatus.Unspecified]: 'bookingFilterAll',
    [EBookingStatus.Pending]: 'bookingStatusPending',
    [EBookingStatus.Confirmed]: 'bookingStatusConfirmed',
    [EBookingStatus.Rejected]: 'bookingStatusRejected',
    [EBookingStatus.Cancelled]: 'bookingStatusCancelled',
};

/** Отбор состояний и колонки таблицы — тоже ключами, по той же причине. */
const FILTER_OPTION_KEYS: ReadonlyArray<IRtFilterControl.Option<EBookingStatus>> = [
    { value: EBookingStatus.Unspecified, label: 'bookingFilterAll' },
    { value: EBookingStatus.Pending, label: 'bookingFilterPending' },
    { value: EBookingStatus.Confirmed, label: 'bookingFilterConfirmed' },
    { value: EBookingStatus.Rejected, label: 'bookingFilterRejected' },
    { value: EBookingStatus.Cancelled, label: 'bookingFilterCancelled' },
];

/** Порядок ключей задаёт порядок колонок. */
const COLUMN_KEYS: ReadonlyArray<IRtTable.ColumnConfig> = [
    { key: 'dates', label: 'bookingDates', locked: true },
    { key: 'property', label: 'bookingProperty' },
    { key: 'guest', label: 'bookingGuest' },
    { key: 'contact', label: 'bookingContact' },
    { key: 'party', label: 'bookingParty' },
    { key: 'source', label: 'bookingSource' },
    { key: 'status', label: 'bookingStatus' },
    { key: 'total', label: 'bookingTotalThb' },
];

/** Подписи исхода писем: значок читается словом, а не одним цветом. */
const MAIL_BADGE_LABEL_KEYS: Readonly<Record<EBookingMailBadge, string>> = {
    [EBookingMailBadge.None]: 'bookingMailNone',
    [EBookingMailBadge.Sent]: 'bookingMailOk',
    [EBookingMailBadge.Failed]: 'bookingMailFailed',
    [EBookingMailBadge.Pending]: 'bookingMailPending',
};

const MAIL_BADGE_SEVERITIES: Readonly<Record<EBookingMailBadge, IRtTag.Severity>> = {
    [EBookingMailBadge.None]: 'info',
    [EBookingMailBadge.Sent]: 'success',
    [EBookingMailBadge.Failed]: 'danger',
    [EBookingMailBadge.Pending]: 'warning',
};

const STATUS_SEVERITIES: Readonly<Record<EBookingStatus, IRtTag.Severity>> = {
    [EBookingStatus.Unspecified]: 'info',
    [EBookingStatus.Pending]: 'warning',
    [EBookingStatus.Confirmed]: 'success',
    [EBookingStatus.Rejected]: 'danger',
    [EBookingStatus.Cancelled]: 'info',
};

/**
 * Есть ли строке что предложить. Признак тот же, что гейтит сами пункты меню: строка без единого
 * доступного действия открывала бы пустую панель.
 */
function bookingRowHasActions(row: IBookingRow): boolean {
    return row.canConfirm || row.canReject || row.canCancel;
}

/**
 * Заявки владельца — списочный экран демонстрационного шаблона.
 *
 * Разметку страницы даёт `app-list-page`, выборку и переходы — этот класс; своим остаётся
 * таблица со столбцами и полоса подтверждения.
 *
 * Подтверждение идёт с суммой, поэтому живёт полосой над таблицей, а не в меню строки: владелец
 * видит и правит число до того, как оно уйдёт гостю письмом.
 */
@Component({
    selector: 'app-bookings-page',
    templateUrl: './bookings-page.component.html',
    styleUrl: './bookings-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        CdkTableModule,
        DecimalPipe,
        FormsModule,

        // rt-tools
        BlockDirective,
        ElemDirective,

        // components
        AppListPageComponent,
        AppSortHeaderDirective,
        RtButtonDirective,
        RtCopyCellComponent,
        RtEmptyStateComponent,
        RtFieldComponent,
        RtFilterControlComponent,
        RtIconButtonComponent,
        RtInputNumberComponent,
        RtMenuItemComponent,
        RtTableComponent,
        RtTableRowActionsDirective,
        RtTableRowDirective,
        RtTagComponent,
        TranslocoPipe,
    ],
    providers: [provideListPage((): typeof BookingsPageComponent => BookingsPageComponent)],
    host: {
        class: BEM_BLOCK,
    },
})
export class BookingsPageComponent implements IListPage.Host<IBooking.State, EBookingSortProperty>, OnInit {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #transloco: TranslocoService = inject(TranslocoService);
    readonly #router: Router = inject(Router);
    readonly #route: ActivatedRoute = inject(ActivatedRoute);
    readonly #tableSettings: RtTableSettingsRegistry = inject(RtTableSettingsRegistry);
    readonly #notificationBus: NotificationBus = inject(NotificationBus);

    /** Смена состояния заявки: запросы идут по одному, в порядке нажатий. */
    readonly #statusSource: Subject<IStatusRequest> = new Subject<IStatusRequest>();

    readonly #sourceLabels: Signal<Readonly<Record<EBookingSource, string>>> = computed((): Readonly<Record<EBookingSource, string>> =>
        this.#translateMap(SOURCE_LABEL_KEYS)
    );

    readonly #statusLabels: Signal<Readonly<Record<EBookingStatus, string>>> = computed((): Readonly<Record<EBookingStatus, string>> =>
        this.#translateMap(STATUS_LABEL_KEYS)
    );

    readonly #mailBadgeLabels: Signal<Readonly<Record<EBookingMailBadge, string>>> = computed(
        (): Readonly<Record<EBookingMailBadge, string>> => this.#translateMap(MAIL_BADGE_LABEL_KEYS)
    );

    readonly #filterLabels: Signal<string[]> = translateSignal(
        FILTER_OPTION_KEYS.map((option: IRtFilterControl.Option<EBookingStatus>): string => option.label)
    );

    readonly #columnLabels: Signal<string[]> = translateSignal(COLUMN_KEYS.map((column: IRtTable.ColumnConfig): string => column.label));

    /** Ключ настроек столбцов: таблица держит выбор в хранилище браузера под ним. */
    protected readonly tableId: string = BOOKINGS_TABLE_ID;

    /** Перечисление в разметку: меню строки называет состояние, в которое переводит заявку. */
    protected readonly BookingStatus: typeof EBookingStatus = EBookingStatus;

    /** Поля сортировки в разметку: заголовок колонки называет то, по чему сортирует сервер. */
    protected readonly sortProperties: typeof EBookingSortProperty = EBookingSortProperty;

    /** Заявка, для которой открыта полоса подтверждения; `null` — полосы нет. */
    protected readonly confirming: WritableSignal<IBooking.State | null> = signal<IBooking.State | null>(null);

    /** Сумма в полосе подтверждения. Уходит гостю письмом, поэтому правится до отправки. */
    protected readonly confirmTotalThb: WritableSignal<number> = signal<number>(0);

    /**
     * Владелец подтверждает заявку с нулевой суммой и ещё не согласился на это. Второе нажатие
     * той же кнопки согласие и означает: письмо без цены — не то же самое, что письмо с ценой.
     */
    protected readonly zeroTotalPending: WritableSignal<boolean> = signal<boolean>(false);

    protected readonly loading: Signal<boolean> = computed((): boolean => this.store.pending());

    /**
     * «Заявок пока нет» — утверждение о списке, а не о том, что таблица пуста: пока чтение не
     * кончилось или кончилось отказом, известно только, что показывать нечего.
     */
    protected readonly listEmpty: Signal<boolean> = computed((): boolean => this.store.loaded() && !this.store.listFailed());

    /** Пока запрос состояния идёт, действия над строками недоступны: второй клик отправил бы второе письмо. */
    protected readonly actionsDisabled: Signal<boolean> = computed((): boolean => this.store.busy());

    protected readonly sortModel: Signal<ISortModel<EBookingSortProperty> | null> = computed((): ISortModel<EBookingSortProperty> | null =>
        this.store.sortModel()
    );

    protected readonly statusFilterOptions: Signal<ReadonlyArray<IRtFilterControl.Option<EBookingStatus>>> = computed(
        (): ReadonlyArray<IRtFilterControl.Option<EBookingStatus>> => {
            const labels: string[] = this.#filterLabels();

            return FILTER_OPTION_KEYS.map(
                (option: IRtFilterControl.Option<EBookingStatus>, index: number): IRtFilterControl.Option<EBookingStatus> => ({
                    value: option.value,
                    label: labels[index] ?? option.label,
                })
            );
        }
    );

    protected readonly columnsConfig: Signal<ReadonlyArray<IRtTable.ColumnConfig>> = computed((): ReadonlyArray<IRtTable.ColumnConfig> => {
        const labels: string[] = this.#columnLabels();

        return COLUMN_KEYS.map((column: IRtTable.ColumnConfig, index: number): IRtTable.ColumnConfig => ({
            ...column,
            label: labels[index] ?? column.label,
        }));
    });

    protected readonly activeFilter: Signal<EBookingStatus> = computed((): EBookingStatus => this.store.query().status);

    protected readonly rows: Signal<IBookingRow[]> = computed((): IBookingRow[] => {
        const sourceLabels: Readonly<Record<EBookingSource, string>> = this.#sourceLabels();
        const statusLabels: Readonly<Record<EBookingStatus, string>> = this.#statusLabels();
        const mailLabels: Readonly<Record<EBookingMailBadge, string>> = this.#mailBadgeLabels();

        return this.store.entities().map((booking: IBooking.State): IBookingRow => ({
            booking,
            propertyLabel: this.#propertyLabel(booking.propertyId),
            sourceLabel: sourceLabels[booking.source],
            statusLabel: statusLabels[booking.status],
            statusSeverity: STATUS_SEVERITIES[booking.status],
            mailBadge: booking.mailBadge,
            mailLabel: mailLabels[booking.mailBadge],
            mailSeverity: MAIL_BADGE_SEVERITIES[booking.mailBadge],
            canConfirm: canConfirmBooking(booking),
            canReject: canRejectBooking(booking),
            canCancel: canCancelBooking(booking),
        }));
    });

    /** Признак строки для таблицы: ссылка на функцию, а не стрелка в шаблоне. */
    protected readonly hasRowActions: (row: IBookingRow) => boolean = bookingRowHasActions;

    public readonly store: BookingsStore = inject(BookingsStore);

    constructor() {
        // Смена состояния идёт по одному запросу за раз: два нажатия подряд по разным строкам
        // должны применить оба, а не последнее — гостю уходит письмо на каждое.
        this.#statusSource
            .pipe(
                concatMap((request: IStatusRequest): Observable<void> =>
                    this.store.changeStatus(request.booking.id, request.status, request.totalThb).pipe(
                        tap((): void => {
                            if (request.closeConfirm) {
                                this.cancelConfirm();
                            }
                            this.store.loadList();
                        })
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe();
    }

    public ngOnInit(): void {
        // Отказ чтения подаётся тостом, а повторить владелец может кнопкой обновления: список
        // при этом остаётся пустым, и молчаливая пустая таблица читалась бы как «записей нет».
        this.store.listError
            .pipe(takeUntilDestroyed(this.#destroyRef))
            .subscribe((key: string): void => this.#notificationBus.error(this.#transloco.translate(key)));

        this.store.loadList();
    }

    public reload(): void {
        this.store.loadList();
    }

    /** Заведение заявки: панель открывается адресом, поэтому переживает перезагрузку страницы. */
    public openCreate(): void {
        void this.#router.navigate([{ outlets: { ro: ['add'] } }], { relativeTo: this.#route });
    }

    public openColumnSettings(): void {
        // Активная таблица называется до перехода, а не после: без этого панель ищет её сама и
        // берёт единственную зарегистрированную. На витрине истории одного файла живут на одной
        // странице подряд, и в этот миг регистрация успевает смениться — панель открывается и
        // тут же закрывает себя. Кит требует ровно этого от потребителя, а экран здесь и есть
        // образец потребителя.
        this.#tableSettings.setActive(BOOKINGS_TABLE_ID);
        void this.#router.navigate([{ outlets: { ro: ['table-settings'] } }], { relativeTo: this.#route });
    }

    public onPageChange(pageNumber: number): void {
        this.store.setQuery({ ...this.store.query(), pageNumber });
    }

    public onPageSizeChange(pageSize: number): void {
        this.store.setQuery({ ...this.store.query(), pageSize, pageNumber: 1 });
    }

    /**
     * Клик по заголовку колонки. Три стороны по кругу: вверх, вниз, никак — третья возвращает
     * список к порядку по умолчанию, и без неё выбранную колонку не отменить.
     */
    public onSortChange(propertyName: string): void {
        const property: EBookingSortProperty = propertyName as EBookingSortProperty;
        const current: ISortModel<EBookingSortProperty> | null = this.store.sortModel();

        let next: ISortModel<EBookingSortProperty> | null;
        if (current === null || current.propertyName !== property) {
            next = { propertyName: property, sortDirection: EListSortOrder.ASC };
        } else if (current.sortDirection === EListSortOrder.ASC) {
            next = { propertyName: property, sortDirection: EListSortOrder.DESC };
        } else {
            // Третий клик по той же колонке снимает порядок: без этой ветки выбранную колонку
            // не отменить, и список навсегда остаётся отсортированным по случайно нажатой.
            next = null;
        }

        this.store.setQuery({ ...this.store.query(), sort: next, pageNumber: 1 });
    }

    /** Отбор по состоянию. Страница сбрасывается: на третьей странице отобранного может не быть. */
    protected selectFilter(status: EBookingStatus): void {
        this.store.setQuery({ ...this.store.query(), status, pageNumber: 1 });
    }

    /** Клик по строке открывает заявку панелью правки — тем же адресом, что и ссылка на неё. */
    protected openBooking(booking: IBooking.State): void {
        void this.#router.navigate([{ outlets: { ro: ['edit', booking.id] } }], { relativeTo: this.#route });
    }

    /** Открыть полосу подтверждения. Сумма подставляется из заявки, чтобы её было что править. */
    protected startConfirm(booking: IBooking.State): void {
        this.confirming.set(booking);
        this.confirmTotalThb.set(booking.totalThb);
        this.zeroTotalPending.set(false);
    }

    protected cancelConfirm(): void {
        this.confirming.set(null);
        this.confirmTotalThb.set(0);
        this.zeroTotalPending.set(false);
    }

    /** Правка суммы снимает предупреждение о нуле: оно было про прежнее значение. */
    protected onConfirmTotalChange(value: number | null): void {
        this.confirmTotalThb.set(value ?? 0);
        this.zeroTotalPending.set(false);
    }

    /**
     * Подтверждение заявки. Нулевая сумма отправляется только со второго нажатия: письмо без
     * цены не отзывается, а промах в поле суммы виден только владельцу и только до отправки.
     */
    protected applyConfirm(booking: IBooking.State): void {
        if (this.confirmTotalThb() === 0 && !this.zeroTotalPending()) {
            this.zeroTotalPending.set(true);

            return;
        }

        this.#statusSource.next({
            booking,
            status: EBookingStatus.Confirmed,
            totalThb: this.confirmTotalThb(),
            closeConfirm: true,
        });
    }

    /** Отказ и отмена: сумму не трогают, поэтому идут прямо из меню строки. */
    protected changeStatus(booking: IBooking.State, status: EBookingStatus): void {
        this.#statusSource.next({ booking, status, totalThb: null, closeConfirm: false });
    }

    /** Подпись объекта по его идентификатору; неизвестный показывается самим идентификатором. */
    #propertyLabel(propertyId: string): string {
        return (
            SHOWCASE_PROPERTIES.find((property: { id: string; label: string }): boolean => property.id === propertyId)?.label ?? propertyId
        );
    }

    /** Карта «значение перечисления → переведённая подпись» из карты ключей. */
    #translateMap<KEY_TYPE extends string>(keys: Readonly<Record<KEY_TYPE, string>>): Readonly<Record<KEY_TYPE, string>> {
        const entries: Array<[string, string]> = Object.entries(keys).map(([value, key]: [string, unknown]): [string, string] => [
            value,
            this.#transloco.translate(String(key)),
        ]);

        return Object.fromEntries(entries) as Readonly<Record<KEY_TYPE, string>>;
    }
}
