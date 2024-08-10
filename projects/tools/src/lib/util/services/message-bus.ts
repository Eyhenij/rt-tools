import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface MessageBusEvent<T = string> {
    readonly type: T;
}

export class MessageBus<M> {
    readonly #eventSource: Subject<MessageBusEvent<M>> = new Subject<MessageBusEvent<M>>();

    public emit(event: MessageBusEvent<M>): void {
        this.#eventSource.next(event);
    }

    public onEmit(): Observable<MessageBusEvent<M>> {
        return this.#eventSource.asObservable();
    }

    public ofType(eventType: M): Observable<MessageBusEvent<M>> {
        return this.onEmit().pipe(
            filter((event: MessageBusEvent<M>): event is MessageBusEvent<M> => event.type === eventType),
            map((event: MessageBusEvent<M>) => event)
        );
    }
}
