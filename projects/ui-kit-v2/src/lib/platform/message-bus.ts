import { Observable, Subject, filter } from 'rxjs';

/**
 * Базовое событие шины: дискриминируется строковым `type`. Конкретные шины
 * сужают `T` до своего union'а типов событий, а полезную нагрузку добавляют
 * наследники интерфейса.
 */
export interface IMessageBusEvent<T = string> {
    readonly type: T;
}

/**
 * Лёгкая типизированная pub/sub-шина поверх RxJS `Subject`. Не зависит от
 * Angular DI и UI: эмиттер (например, стор) и потребитель (например, layout-
 * контейнер) развязаны — отправитель не знает, кто и как отрисует событие.
 *
 * - `emit` — опубликовать событие;
 * - `onEmit` — поток всех событий;
 * - `ofType` — поток событий конкретного типа (для точечной подписки).
 */
export class MessageBus<E extends IMessageBusEvent> {
    readonly #eventSource: Subject<E> = new Subject<E>();

    public emit(event: E): void {
        this.#eventSource.next(event);
    }

    public onEmit(): Observable<E> {
        return this.#eventSource.asObservable();
    }

    public ofType<T extends E['type']>(type: T): Observable<Extract<E, { type: T }>> {
        return this.#eventSource.asObservable().pipe(filter((event: E): event is Extract<E, { type: T }> => event.type === type));
    }
}
