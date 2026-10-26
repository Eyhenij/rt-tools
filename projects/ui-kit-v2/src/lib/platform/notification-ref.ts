import { Observable, ReplaySubject, Subject } from 'rxjs';

import { INotification } from './notification.model';

/**
 * Ручка показанного тоста. Её возвращает шина уведомлений при отправке: приложение закрывает
 * тост, когда задача кончилась или сеть вернулась, меняет текст и долю на ходу и узнаёт, почему тост
 * ушёл. Своему компоненту тоста она же приходит инъекцией.
 *
 * Тостер слушает обновления и просьбу закрыть, а уход отмечает `markClosed`. После ухода ручка
 * молчит: обновление и повторное закрытие ушедшего тоста ничего не делают.
 */
export class NotificationRef implements INotification.IRef {
    readonly #updateSource: Subject<INotification.Update> = new Subject<INotification.Update>();
    readonly #dismissSource: Subject<void> = new Subject<void>();
    readonly #closedSource: ReplaySubject<INotification.CloseReason> = new ReplaySubject<INotification.CloseReason>(1);

    #closed: boolean = false;

    /** Меняет показанный тост: текст, важность, долю, подробности или данные своего компонента. */
    public update(patch: INotification.Update): void {
        if (!this.#closed) {
            this.#updateSource.next(patch);
        }
    }

    /** Закрывает тост его анимацией ухода; `afterDismissed()` сообщит `dismiss`. */
    public dismiss(): void {
        if (!this.#closed) {
            this.#dismissSource.next();
        }
    }

    /** Один раз сообщает, почему тост ушёл, и завершается. Подписка после ухода тоже получит ответ. */
    public afterDismissed(): Observable<INotification.CloseReason> {
        return this.#closedSource.asObservable();
    }

    /** Поток обновлений — для тостера. */
    public onUpdate(): Observable<INotification.Update> {
        return this.#updateSource.asObservable();
    }

    /** Поток просьб закрыть — для тостера. */
    public onDismissRequest(): Observable<void> {
        return this.#dismissSource.asObservable();
    }

    /** Тост ушёл: тостер сообщает причину, и ручка замолкает. */
    public markClosed(reason: INotification.CloseReason): void {
        if (this.#closed) {
            return;
        }

        this.#closed = true;
        this.#closedSource.next(reason);
        this.#closedSource.complete();
        this.#updateSource.complete();
        this.#dismissSource.complete();
    }
}
