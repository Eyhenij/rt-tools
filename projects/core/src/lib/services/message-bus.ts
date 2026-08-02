import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface IMessageBusEvent<T = string> {
    readonly type: T;
}

export class MessageBus<M> {
    readonly #eventSource: Subject<IMessageBusEvent<M>> = new Subject<IMessageBusEvent<M>>();

    public emit(event: IMessageBusEvent<M>): void {
        this.#eventSource.next(event);
    }

    public onEmit(): Observable<IMessageBusEvent<M>> {
        return this.#eventSource.asObservable();
    }

    public ofType(eventType: M): Observable<IMessageBusEvent<M>> {
        return this.onEmit().pipe(
            filter((event: IMessageBusEvent<M>): event is IMessageBusEvent<M> => event.type === eventType),
            map((event: IMessageBusEvent<M>) => event)
        );
    }
}
