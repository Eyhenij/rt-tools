import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface MessageBusEvent<T = string> {
    readonly type: T;
}

export class MessageBus<T extends MessageBusEvent<M>, M> {
    #eventSource: Subject<T> = new Subject<T>();

    public emit(event: T): void {
        this.#eventSource.next(event);
    }

    public onEmit(): Observable<T> {
        return this.#eventSource.asObservable();
    }

    public ofType(eventType: M): Observable<T> {
        return this.onEmit().pipe(
            filter((event: T): boolean => event.type === eventType),
            map((event: T) => event)
        );
    }
}
