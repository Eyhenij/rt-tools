import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, Signal, viewChild, WritableSignal } from '@angular/core';
import { AbstractControl, FormsModule, NgForm } from '@angular/forms';

import { Observable } from 'rxjs';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtAsideFooterComponent } from '../../../../lib/components/aside/footer/rt-aside-footer.component';
import { RtAsideHeaderComponent } from '../../../../lib/components/aside/header/rt-aside-header.component';
import { RtAsideComponent } from '../../../../lib/components/aside/rt-aside.component';
import { RtAsideSectionComponent } from '../../../../lib/components/aside-section/rt-aside-section.component';
import { RtButtonDirective } from '../../../../lib/components/button/rt-button.directive';
import { RtConfirmDirective } from '../../../../lib/components/confirm-popover/rt-confirm.directive';
import { RtContainerRightSidenavPanelDirective } from '../../../../lib/components/container/rt-container.directives';
import { RtRouteAsideComponent } from '../../../../lib/components/container/rt-route-aside.base';
import { RtDatePickerComponent } from '../../../../lib/components/date-picker/rt-date-picker.component';
import { RtFieldComponent } from '../../../../lib/components/field/rt-field.component';
import { RtInputComponent } from '../../../../lib/components/input/rt-input.component';
import { RtInputNumberComponent } from '../../../../lib/components/input-number/rt-input-number.component';
import { RtMessageComponent } from '../../../../lib/components/message/rt-message.component';
import { RtSelectComponent } from '../../../../lib/components/select/rt-select.component';
import { IRtSelect } from '../../../../lib/components/select/rt-select.model';
import { RtTagComponent } from '../../../../lib/components/tag/rt-tag.component';
import { IRtTag } from '../../../../lib/components/tag/rt-tag.model';
import { SHOWCASE_PROPERTIES } from '../booking.data';
import { bookingDraftProblem, bookingProblemKey, EBookingDraftProblem, EBookingSource, EBookingStatus, IBooking } from '../booking.model';
import { BookingsStore } from '../bookings.store';

const BEM_BLOCK: string = 'app-booking-aside';

/** Подписи состояний заявки: их же показывает метка в шапке панели. */
const STATUS_LABEL_KEYS: Readonly<Record<EBookingStatus, string>> = {
    [EBookingStatus.Unspecified]: 'bookingFilterAll',
    [EBookingStatus.Pending]: 'bookingStatusPending',
    [EBookingStatus.Confirmed]: 'bookingStatusConfirmed',
    [EBookingStatus.Rejected]: 'bookingStatusRejected',
    [EBookingStatus.Cancelled]: 'bookingStatusCancelled',
};

const STATUS_SEVERITIES: Readonly<Record<EBookingStatus, IRtTag.Severity>> = {
    [EBookingStatus.Unspecified]: 'info',
    [EBookingStatus.Pending]: 'warning',
    [EBookingStatus.Confirmed]: 'success',
    [EBookingStatus.Rejected]: 'danger',
    [EBookingStatus.Cancelled]: 'info',
};

/** Откуда пришла заявка — тем же набором, что стоит колонкой таблицы. */
const SOURCE_LABEL_KEYS: Readonly<Record<EBookingSource, string>> = {
    [EBookingSource.Site]: 'bookingSourceSite',
    [EBookingSource.Airbnb]: 'bookingSourceAirbnb',
    [EBookingSource.Booking]: 'bookingSourceBooking',
    [EBookingSource.Agoda]: 'bookingSourceAgoda',
    [EBookingSource.Vrbo]: 'bookingSourceVrbo',
    [EBookingSource.Direct]: 'bookingSourceDirect',
};

/**
 * Панель заявки: открывается навигацией на `(ro:add)` или `(ro:edit/:bookingId)`, поэтому
 * переживает перезагрузку страницы и передаётся ссылкой.
 *
 * Заведение и правка — один компонент на два адреса: поля у них одни и те же, а две панели
 * разошлись бы при первой правке.
 */
@Component({
    selector: 'app-booking-aside',
    templateUrl: './booking-aside.component.html',
    styleUrl: './booking-aside.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        FormsModule,

        // rt-tools
        BlockDirective,
        ElemDirective,

        // components
        RtAsideComponent,
        RtAsideFooterComponent,
        RtAsideHeaderComponent,
        RtAsideSectionComponent,
        RtButtonDirective,
        RtConfirmDirective,
        RtContainerRightSidenavPanelDirective,
        RtDatePickerComponent,
        RtFieldComponent,
        RtInputComponent,
        RtInputNumberComponent,
        RtMessageComponent,
        RtSelectComponent,
        RtTagComponent,
        TranslocoPipe,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class BookingAsideComponent extends RtRouteAsideComponent<IBooking.State> {
    readonly #store: BookingsStore = inject(BookingsStore);
    readonly #transloco: TranslocoService = inject(TranslocoService);

    /**
     * Та же заявка, но считающаяся изменившейся только при смене самой записи. От неё питаются
     * поля формы: список раздела перечитывается после каждого действия, и `linkedSignal` от
     * нового объекта с теми же данными сбрасывал бы набранное владельцем.
     */
    readonly #bookingForm: Signal<IBooking.State | null> = computed((): IBooking.State | null => this.entity(), {
        equal: (left: IBooking.State | null, right: IBooking.State | null): boolean => (left?.id ?? '') === (right?.id ?? ''),
    });

    protected override readonly idParamName: string = 'bookingId';

    /** Объекты выпадающего списка — те же, что показывает колонка таблицы. */
    protected readonly propertyOptions: ReadonlyArray<IRtSelect.Option<string>> = SHOWCASE_PROPERTIES.map(
        (property: { id: string; label: string }): IRtSelect.Option<string> => ({ value: property.id, label: property.label })
    );

    /** Источники выпадающего списка: подписи переводятся, значения — те же, что в записи. */
    protected readonly sourceOptions: Signal<ReadonlyArray<IRtSelect.Option<EBookingSource>>> = computed(
        (): ReadonlyArray<IRtSelect.Option<EBookingSource>> =>
            Object.values(EBookingSource).map((source: EBookingSource): IRtSelect.Option<EBookingSource> => ({
                value: source,
                label: this.#transloco.translate(SOURCE_LABEL_KEYS[source]),
            }))
    );

    /** Пока заявка читается, поля показаны скелетонами: пустые выглядели бы как заявка без данных. */
    protected readonly bookingLoading: Signal<boolean> = this.resolving;

    protected readonly propertyId: WritableSignal<string> = linkedSignal<IBooking.State | null, string>({
        source: this.#bookingForm,
        computation: (booking: IBooking.State | null): string => booking?.propertyId ?? '',
    });

    protected readonly checkIn: WritableSignal<string> = linkedSignal<IBooking.State | null, string>({
        source: this.#bookingForm,
        computation: (booking: IBooking.State | null): string => booking?.checkIn ?? '',
    });

    protected readonly checkOut: WritableSignal<string> = linkedSignal<IBooking.State | null, string>({
        source: this.#bookingForm,
        computation: (booking: IBooking.State | null): string => booking?.checkOut ?? '',
    });

    protected readonly guestName: WritableSignal<string> = linkedSignal<IBooking.State | null, string>({
        source: this.#bookingForm,
        computation: (booking: IBooking.State | null): string => booking?.guestName ?? '',
    });

    protected readonly guestEmail: WritableSignal<string> = linkedSignal<IBooking.State | null, string>({
        source: this.#bookingForm,
        computation: (booking: IBooking.State | null): string => booking?.guestEmail ?? '',
    });

    protected readonly guestMessenger: WritableSignal<string> = linkedSignal<IBooking.State | null, string>({
        source: this.#bookingForm,
        computation: (booking: IBooking.State | null): string => booking?.guestMessenger ?? '',
    });

    protected readonly adults: WritableSignal<number> = linkedSignal<IBooking.State | null, number>({
        source: this.#bookingForm,
        computation: (booking: IBooking.State | null): number => booking?.adults ?? 1,
    });

    protected readonly children: WritableSignal<number> = linkedSignal<IBooking.State | null, number>({
        source: this.#bookingForm,
        computation: (booking: IBooking.State | null): number => booking?.children ?? 0,
    });

    protected readonly source: WritableSignal<EBookingSource> = linkedSignal<IBooking.State | null, EBookingSource>({
        source: this.#bookingForm,
        computation: (booking: IBooking.State | null): EBookingSource => booking?.source ?? EBookingSource.Direct,
    });

    protected readonly totalThb: WritableSignal<number> = linkedSignal<IBooking.State | null, number>({
        source: this.#bookingForm,
        computation: (booking: IBooking.State | null): number => booking?.totalThb ?? 0,
    });

    protected readonly comment: WritableSignal<string> = linkedSignal<IBooking.State | null, string>({
        source: this.#bookingForm,
        computation: (booking: IBooking.State | null): string => booking?.comment ?? '',
    });

    /** Ключ заголовка: шапка называет действие, а номер заявки уходит надстрочником. */
    protected readonly title: Signal<string> = computed((): string => (this.isCreateMode() ? 'bookingCreateTitle' : 'bookingEditTitle'));

    protected readonly overline: Signal<string> = computed((): string => {
        const booking: IBooking.State | null = this.entity();

        return booking === null || booking.number === 0 ? '' : `№ ${booking.number}`;
    });

    /** Состояние заявки меткой: его меняют действиями из списка, а не полем формы. */
    protected readonly statusLabel: Signal<string> = computed((): string =>
        this.#transloco.translate(STATUS_LABEL_KEYS[this.entity()?.status ?? EBookingStatus.Pending])
    );

    protected readonly statusSeverity: Signal<IRtTag.Severity> = computed(
        (): IRtTag.Severity => STATUS_SEVERITIES[this.entity()?.status ?? EBookingStatus.Pending]
    );

    readonly #draft: Signal<IBooking.Draft> = computed((): IBooking.Draft => ({
        id: this.entityId() ?? '',
        propertyId: this.propertyId(),
        checkIn: this.checkIn(),
        checkOut: this.checkOut(),
        guestName: this.guestName(),
        guestEmail: this.guestEmail(),
        guestMessenger: this.guestMessenger(),
        adults: this.adults(),
        children: this.children(),
        source: this.source(),
        totalThb: this.totalThb(),
        comment: this.comment(),
    }));

    /**
     * Причина, по которой черновик не годится. Пустое имя гостя у новой записи ошибкой не
     * считается: владелец только открыл форму, и красная плашка над пустым полем читается как
     * поломка.
     */
    protected readonly problemKey: Signal<string> = computed((): string => {
        const problem: EBookingDraftProblem | null = bookingDraftProblem(this.#draft());
        if (problem === EBookingDraftProblem.EmptyGuest && !this.guestName()) {
            return '';
        }

        return bookingProblemKey(problem);
    });

    /** Форму собирает `ngForm` при отрисовке шаблона — до неё контрола ещё нет. */
    protected readonly panelForm: Signal<NgForm | undefined> = viewChild(NgForm);

    /** Нетронутая форма не отправляется: запрос без правок вернул бы тост об успехе ни о чём. */
    protected readonly formPristine: Signal<boolean> = this.pristineSignal(
        computed((): AbstractControl | undefined => this.panelForm()?.control)
    );

    protected readonly canSave: Signal<boolean> = computed(
        (): boolean => !this.formPristine() && bookingDraftProblem(this.#draft()) === null && !this.submitting()
    );

    constructor() {
        super();
        this.guardUnsavedChanges({ pristine: this.formPristine, save: (): void => this.save() });
    }

    /** Заявка читается по идентификатору: панель, открытая ссылкой, не ждёт списка. */
    protected resolve(id: string): Observable<IBooking.State | null> {
        return this.#store.loadOne(id);
    }

    /**
     * Отказ стора закрывается вместе с панелью: стор живёт на маршруте раздела, и незакрытая
     * ошибка висела бы красной плашкой на списке, а потом всплыла бы в форме соседней заявки, с
     * которой ничего не делали.
     */
    protected override onClosed(): void {
        this.#store.clearError();
        super.onClosed();
    }

    /**
     * Правка поля снимает исход прошлой попытки: он был про прежнее значение — и
     * «сохранено» над изменённой формой говорит неправду ровно так же, как
     * устаревший отказ.
     */
    protected updateGuestName(value: string): void {
        this.guestName.set(value);
        this.#store.clearError();
        this.submitError.set(null);
        this.submitSuccess.set(null);
    }

    protected save(): void {
        if (!this.canSave()) {
            return;
        }

        // Удача приходит туда же, где задан вопрос, — в панель, рядом с формой.
        // Панель остаётся открытой: закрывает её человек, он и решает, правит ли
        // дальше.
        this.runMutation(this.#store.save(this.#draft()), {
            successMessage: this.#transloco.translate('bookingSaved'),
            errorText: (): string => this.#store.errorKey() ?? 'bookingSaveFailed',
        });
    }

    /** Снятие заявки. Гостю письма при этом не уходит: запись просто исчезает из списка. */
    protected remove(): void {
        const bookingId: string | null = this.entityId();
        if (bookingId === null) {
            return;
        }

        // Здесь наоборот: записи больше нет, и держать над ней панель правки
        // нечего — сообщение внутри неё никто не увидит, поэтому об удаче
        // говорит тост.
        this.runMutation(this.#store.remove(bookingId), {
            successText: this.#transloco.translate('bookingDeleted'),
            errorText: (): string => this.#store.errorKey() ?? 'bookingSaveFailed',
            closeOnSuccess: true,
        });
    }
}
