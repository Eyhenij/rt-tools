/**
 * Заявка на бронь — предмет демонстрационного экрана витрины.
 *
 * Модель настоящая, а не набор строк для показа: экран уровня `Templates` показывает, как
 * страница собирается из компонентов кита, и собирается она вокруг записи со своими уровнями —
 * состоянием, черновиком и выборкой. Экран, построенный на плоском объекте, показал бы вид, но
 * не приём.
 *
 * Обвязка витрины: `src/showcase/**` исключён из сборки библиотеки и в пакет не уезжает.
 */

/** Откуда пришла заявка. Набор закрытый: его называют и таблица, и панель, и отбор. */
export enum EBookingSource {
    Site = 'site',
    Airbnb = 'airbnb',
    Booking = 'booking',
    Agoda = 'agoda',
    Vrbo = 'vrbo',
    Direct = 'direct',
}

/** Что с заявкой сделали. `Unspecified` — значение отбора «все», а не состояние записи. */
export enum EBookingStatus {
    Unspecified = '',
    Pending = 'pending',
    Confirmed = 'confirmed',
    Rejected = 'rejected',
    Cancelled = 'cancelled',
}

/** Исход писем гостю по этой заявке. `None` — писем не было, и значка в строке нет вовсе. */
export enum EBookingMailBadge {
    None = 'none',
    Sent = 'sent',
    Failed = 'failed',
    Pending = 'pending',
}

/** Поле, по которому сортирует список. Имена те же, что ушли бы на сервер. */
export enum EBookingSortProperty {
    Number = 'number',
    CheckIn = 'checkIn',
    Guest = 'guestName',
    Total = 'totalThb',
}

export namespace IBooking {
    /** Заявка так, как её показывают: всё уже разрешено, ничего доставать не надо. */
    export interface State {
        readonly id: string;
        readonly number: number;
        readonly propertyId: string;
        readonly checkIn: string;
        readonly checkOut: string;
        readonly guestName: string;
        readonly guestEmail: string;
        readonly guestMessenger: string;
        readonly adults: number;
        readonly children: number;
        readonly source: EBookingSource;
        readonly status: EBookingStatus;
        readonly totalThb: number;
        readonly comment: string;
        readonly mailBadge: EBookingMailBadge;
    }

    /**
     * Заявка так, как её отдают на запись. Номер, исход писем и состояние сюда не входят:
     * первые два назначает сервер, третье меняется своими действиями, а не формой.
     */
    export interface Draft {
        readonly id: string;
        readonly propertyId: string;
        readonly checkIn: string;
        readonly checkOut: string;
        readonly guestName: string;
        readonly guestEmail: string;
        readonly guestMessenger: string;
        readonly adults: number;
        readonly children: number;
        readonly source: EBookingSource;
        readonly totalThb: number;
        readonly comment: string;
    }
}

/** Причина, по которой черновик не годится к записи. */
export enum EBookingDraftProblem {
    EmptyGuest = 'emptyGuest',
    BadDates = 'badDates',
    EmptyParty = 'emptyParty',
}

/** Подпись причины ключом словаря. Пустая строка — черновик годен. */
export function bookingProblemKey(problem: EBookingDraftProblem | null): string {
    switch (problem) {
        case EBookingDraftProblem.EmptyGuest:
            return 'bookingProblemGuest';
        case EBookingDraftProblem.BadDates:
            return 'bookingProblemDates';
        case EBookingDraftProblem.EmptyParty:
            return 'bookingProblemParty';
        default:
            return '';
    }
}

/**
 * Что не так с черновиком. Порядок проверок задаёт, о чём владельцу скажут первым: пустое имя
 * гостя важнее прочего — без него заявка не заявка.
 */
export function bookingDraftProblem(draft: IBooking.Draft): EBookingDraftProblem | null {
    if (!draft.guestName.trim()) {
        return EBookingDraftProblem.EmptyGuest;
    }

    // Даты сравниваются числами, а не строками: записаны они как `ГГГГ-ММ-ДД`, и посимвольное
    // сравнение дало бы тот же ответ, но молча сломалось бы на первой же дате другого формата.
    if (!draft.checkIn || !draft.checkOut || Date.parse(draft.checkOut) <= Date.parse(draft.checkIn)) {
        return EBookingDraftProblem.BadDates;
    }

    if (draft.adults < 1) {
        return EBookingDraftProblem.EmptyParty;
    }

    return null;
}

/**
 * Действия, доступные строке. Отклонить можно только то, что ещё ждёт ответа; отменить — только
 * подтверждённое: гостю в обоих случаях уходит письмо, и предлагать невозможное нельзя.
 */
export function canConfirmBooking(booking: IBooking.State): boolean {
    return booking.status === EBookingStatus.Pending;
}

export function canRejectBooking(booking: IBooking.State): boolean {
    return booking.status === EBookingStatus.Pending;
}

export function canCancelBooking(booking: IBooking.State): boolean {
    return booking.status === EBookingStatus.Confirmed;
}
