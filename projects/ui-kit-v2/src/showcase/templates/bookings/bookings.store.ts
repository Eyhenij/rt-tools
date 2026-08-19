import { computed, DestroyRef, inject, Injectable, InjectionToken, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { delay, Observable, of, Subject, switchMap, tap } from 'rxjs';

import { EListSortOrder, IPageModel, ISortModel } from '@rt-tools/utils';

import { SHOWCASE_BOOKINGS } from './booking.data';
import { EBookingMailBadge, EBookingSortProperty, EBookingStatus, IBooking } from './booking.model';

/**
 * Список заявок демонстрационного экрана.
 *
 * Стор настоящий: сигналы, выборка, страницы, состояния чтения и занятости. Сетевого слоя под
 * ним нет — вместо него набор в памяти и задержка ответа, — но снаружи он неотличим от того,
 * что стоит в приложении, и экран написан против него так же, как был бы написан против
 * живого. Ради одного вида хватило бы массива в компоненте; тогда экран показывал бы вид и не
 * показывал бы приёма, ради которого шаблон и заводится.
 *
 * Задержка — не украшение: без неё скелетоны таблицы и признак занятости не увидеть вовсе, а
 * они и есть половина того, что экран обещает потребителю.
 */

/** Насколько долго «идёт» чтение списка. Столько же занимают запись, снятие и смена состояния. */
const RESPONSE_DELAY_MS: number = 450;

/** Чем отвечает демонстрационный сервер: какими записями и отдаёт ли он их вообще. */
export interface IBookingsFixture {
    /** Что «лежит на сервере» к открытию экрана. */
    readonly bookings: ReadonlyArray<IBooking.State>;

    /** Чтение списка кончается отказом: экран показывает тост и пустую таблицу. */
    readonly failing: boolean;
}

/**
 * Ответ демонстрационного сервера. Объявляется историей витрины, а не экраном: пустой список и
 * отказ чтения — такие же виды экрана, как список с записями, и достаётся до них только отсюда.
 * Умолчание — полный набор и работающий сервер, поэтому экран поднимается и без объявления.
 */
export const BOOKINGS_FIXTURE: InjectionToken<IBookingsFixture> = new InjectionToken<IBookingsFixture>('BOOKINGS_FIXTURE', {
    providedIn: 'root',
    factory: (): IBookingsFixture => ({ bookings: SHOWCASE_BOOKINGS, failing: false }),
});

/** Ключ подписи, под которой владелец видит отказ чтения списка. */
const LIST_ERROR_KEY: string = 'bookingsLoadFailed';

/** Ответ сервера на чтение списка: страница записей и сколько их всего под отбором. */
interface IListAnswer {
    readonly page: ReadonlyArray<IBooking.State>;
    readonly totalCount: number;
}

/** До первого ответа список пуст: пока чтение идёт, таблица показывает скелетоны. */
const EMPTY_ANSWER: IListAnswer = { page: [], totalCount: 0 };

/** Размер страницы по умолчанию — первая ступень переключателя страниц кита. */
const SHOWCASE_PAGE_SIZE: number = 20;

/** Выборка списка: отбор, порядок и страница. Всё, что экран кладёт в адрес. */
export interface IBookingsQuery {
    readonly status: EBookingStatus;
    readonly sort: ISortModel<EBookingSortProperty> | null;
    readonly pageNumber: number;
    readonly pageSize: number;
}

const INITIAL_QUERY: IBookingsQuery = {
    status: EBookingStatus.Unspecified,
    sort: null,
    pageNumber: 1,
    pageSize: SHOWCASE_PAGE_SIZE,
};

/**
 * Числовое значение поля, по которому идёт сравнение. Дата берётся отметкой времени, а не
 * строкой: посимвольное сравнение дало бы тот же ответ и молча сломалось бы на первой же дате
 * другого формата.
 */
function numericSortValue(booking: IBooking.State, property: EBookingSortProperty): number {
    switch (property) {
        case EBookingSortProperty.Number:
            return booking.number;
        case EBookingSortProperty.Total:
            return booking.totalThb;
        default:
            return Date.parse(booking.checkIn);
    }
}

/**
 * Сравнение двух записей по полю выборки. Имя гостя сравнивается по правилам языка — иначе «Ё»
 * уезжает в конец списка, за латиницу.
 */
function compareBookings(left: IBooking.State, right: IBooking.State, property: EBookingSortProperty): number {
    if (property === EBookingSortProperty.Guest) {
        return left.guestName.localeCompare(right.guestName, 'ru');
    }

    return numericSortValue(left, property) - numericSortValue(right, property);
}

@Injectable()
export class BookingsStore {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    /** Чем отвечает сервер: набор записей и признак отказа. Объявляется историей витрины. */
    readonly #fixture: IBookingsFixture = inject(BOOKINGS_FIXTURE);

    /** Всё, что «лежит на сервере». Правки записываются сюда и переживают перечитывание списка. */
    readonly #source: WritableSignal<ReadonlyArray<IBooking.State>> = signal<ReadonlyArray<IBooking.State>>(this.#fixture.bookings);

    readonly #query: WritableSignal<IBookingsQuery> = signal<IBookingsQuery>(INITIAL_QUERY);

    readonly #pending: WritableSignal<boolean> = signal<boolean>(false);
    readonly #busy: WritableSignal<boolean> = signal<boolean>(false);
    readonly #loaded: WritableSignal<boolean> = signal<boolean>(false);
    readonly #errorKey: WritableSignal<string | null> = signal<string | null>(null);

    /** Перезапрос списка: пока идёт запрос, следующий отменяет предыдущий. */
    readonly #loadSource: Subject<void> = new Subject<void>();

    /** Отказ загрузки — событием, а не признаком: один и тот же отказ подряд обязан показаться дважды. */
    readonly #listErrorSource: Subject<string> = new Subject<string>();

    /**
     * Последний ответ сервера. Список живёт здесь, а не вычисляется из набора прямо в таблицу:
     * набор лежит в памяти, и без этого шага страница появлялась бы в кадре раньше ответа —
     * скелетонов первого чтения не видел бы никто.
     */
    readonly #answer: WritableSignal<IListAnswer> = signal<IListAnswer>(EMPTY_ANSWER);

    /** Записи, прошедшие отбор и порядок, — до нарезки на страницы. */
    readonly #selected: Signal<ReadonlyArray<IBooking.State>> = computed((): ReadonlyArray<IBooking.State> => {
        const query: IBookingsQuery = this.#query();
        const filtered: ReadonlyArray<IBooking.State> =
            query.status === EBookingStatus.Unspecified
                ? this.#source()
                : this.#source().filter((booking: IBooking.State): boolean => booking.status === query.status);

        const sort: ISortModel<EBookingSortProperty> | null = query.sort;
        if (sort === null) {
            return filtered;
        }

        const direction: number = sort.sortDirection === EListSortOrder.DESC ? -1 : 1;

        return [...filtered].sort(
            (left: IBooking.State, right: IBooking.State): number => direction * compareBookings(left, right, sort.propertyName)
        );
    });

    public readonly query: Signal<IBookingsQuery> = this.#query.asReadonly();

    public readonly pending: Signal<boolean> = this.#pending.asReadonly();

    public readonly busy: Signal<boolean> = this.#busy.asReadonly();

    public readonly loaded: Signal<boolean> = this.#loaded.asReadonly();

    public readonly errorKey: Signal<string | null> = this.#errorKey.asReadonly();

    public readonly listFailed: Signal<boolean> = computed((): boolean => this.#errorKey() !== null);

    public readonly listError: Observable<string> = this.#listErrorSource.asObservable();

    /** Страница списка: то, что видит таблица. Приезжает ответом, а не выбирается на месте. */
    public readonly entities: Signal<IBooking.State[]> = computed((): IBooking.State[] => [...this.#answer().page]);

    public readonly pageModel: Signal<IPageModel> = computed((): IPageModel => {
        const query: IBookingsQuery = this.#query();

        return {
            pageNumber: query.pageNumber,
            pageSize: query.pageSize,
            totalCount: this.#answer().totalCount,
        };
    });

    public readonly sortModel: Signal<ISortModel<EBookingSortProperty> | null> = computed(
        (): ISortModel<EBookingSortProperty> | null => this.#query().sort
    );

    constructor() {
        // Подписка объявлена один раз здесь, а не в методе чтения: быстрые нажатия по обновлению
        // дают гонку ответов, и без переключения победил бы тот, что вернулся последним, а не
        // тот, что нажали последним.
        this.#loadSource
            .pipe(
                switchMap((): Observable<null> => of(null).pipe(delay(RESPONSE_DELAY_MS))),
                tap((): void => {
                    this.#pending.set(false);
                    this.#loaded.set(true);

                    // Отказ приходит признаком и событием сразу: признак держит вид экрана, а
                    // событие показывает тост — один и тот же отказ подряд обязан показаться дважды.
                    if (this.#fixture.failing) {
                        this.#answer.set(EMPTY_ANSWER);
                        this.#errorKey.set(LIST_ERROR_KEY);
                        this.#listErrorSource.next(LIST_ERROR_KEY);

                        return;
                    }

                    this.#answer.set(this.#answerNow());
                }),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe();
    }

    public setQuery(query: IBookingsQuery): void {
        this.#query.set(query);
        this.loadList();
    }

    /**
     * Перечитывание списка. Ответ приходит с задержкой, и пока он идёт, таблица показывает
     * скелетоны: без этого состояния экран показывал бы только один из трёх своих видов.
     */
    public loadList(): void {
        this.#pending.set(true);
        this.#errorKey.set(null);
        this.#loadSource.next();
    }

    /** Одна заявка по идентификатору: панель, открытая ссылкой, не ждёт списка. */
    public loadOne(id: string): Observable<IBooking.State | null> {
        return of(this.#source().find((booking: IBooking.State): boolean => booking.id === id) ?? null).pipe(delay(RESPONSE_DELAY_MS));
    }

    /** Запись заявки: новая получает идентификатор и номер, правка ложится поверх прежней. */
    public save(draft: IBooking.Draft): Observable<IBooking.State> {
        this.#busy.set(true);

        const existing: IBooking.State | undefined = this.#source().find((booking: IBooking.State): boolean => booking.id === draft.id);
        const nextNumber: number = this.#nextNumber();
        const saved: IBooking.State = existing
            ? { ...existing, ...draft }
            : {
                  ...draft,
                  id: `bk-${nextNumber}`,
                  number: nextNumber,
                  status: EBookingStatus.Pending,
                  // Новой заявке писем ещё не слали: значка в строке у неё нет вовсе.
                  mailBadge: EBookingMailBadge.None,
              };

        return of(saved).pipe(
            delay(RESPONSE_DELAY_MS),
            tap((booking: IBooking.State): void => {
                this.#source.update((bookings: ReadonlyArray<IBooking.State>): ReadonlyArray<IBooking.State> =>
                    existing
                        ? bookings.map((item: IBooking.State): IBooking.State => (item.id === booking.id ? booking : item))
                        : [booking, ...bookings]
                );
                this.#busy.set(false);
            })
        );
    }

    /** Снятие заявки. Запись уходит из списка целиком. */
    public remove(id: string): Observable<void> {
        this.#busy.set(true);

        return of(undefined).pipe(
            delay(RESPONSE_DELAY_MS),
            tap((): void => {
                this.#source.update((bookings: ReadonlyArray<IBooking.State>): ReadonlyArray<IBooking.State> =>
                    bookings.filter((booking: IBooking.State): boolean => booking.id !== id)
                );
                this.#busy.set(false);
            })
        );
    }

    /** Смена состояния заявки: подтверждение идёт вместе с суммой, отказ и отмена — без неё. */
    public changeStatus(id: string, status: EBookingStatus, totalThb: number | null): Observable<void> {
        this.#busy.set(true);

        return of(undefined).pipe(
            delay(RESPONSE_DELAY_MS),
            tap((): void => {
                this.#source.update((bookings: ReadonlyArray<IBooking.State>): ReadonlyArray<IBooking.State> =>
                    bookings.map((booking: IBooking.State): IBooking.State =>
                        booking.id === id ? { ...booking, status, totalThb: totalThb ?? booking.totalThb } : booking
                    )
                );
                this.#busy.set(false);
            })
        );
    }

    public clearError(): void {
        this.#errorKey.set(null);
    }

    /** Ответ, который «отдаёт сервер»: отбор и порядок уже применены, осталось нарезать страницу. */
    #answerNow(): IListAnswer {
        const query: IBookingsQuery = this.#query();
        const selected: ReadonlyArray<IBooking.State> = this.#selected();
        const start: number = (query.pageNumber - 1) * query.pageSize;

        return { page: selected.slice(start, start + query.pageSize), totalCount: selected.length };
    }

    /** Номер следующей заявки: на единицу больше самого большого из существующих. */
    #nextNumber(): number {
        return this.#source().reduce((max: number, booking: IBooking.State): number => Math.max(max, booking.number), 0) + 1;
    }
}
