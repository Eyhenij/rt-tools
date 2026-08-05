import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { MessageBus } from './message-bus';
import { INotification } from './notification.model';

/**
 * Шина уведомлений приложения. Эмиттеры (сторы) публикуют сюда событие с
 * готовым текстом и severity и больше ничего не знают об отрисовке. Подписчик
 * (`rt-toaster`) слушает `onEmit()` и показывает toast'ы.
 *
 * Convenience-методы `success/info/warning/error` собирают событие: первым
 * аргументом — текст для пользователя, вторым (необязательно) — доменный
 * action-тип для точечной фильтрации через `ofType`. Если тип не передан,
 * подставляется значение severity.
 */
@Injectable({ providedIn: 'root' })
export class NotificationBus {
    readonly #bus: MessageBus<INotification.Event> = new MessageBus<INotification.Event>();

    public emit(event: INotification.Event): void {
        this.#bus.emit(event);
    }

    public onEmit(): Observable<INotification.Event> {
        return this.#bus.onEmit();
    }

    public ofType(type: string): Observable<INotification.Event> {
        return this.#bus.ofType(type);
    }

    public success(message: string, type: string = 'success', options: INotification.Options = {}): void {
        this.emit({ type, payload: { message, severity: 'success', ...options } });
    }

    public info(message: string, type: string = 'info', options: INotification.Options = {}): void {
        this.emit({ type, payload: { message, severity: 'info', ...options } });
    }

    public warning(message: string, type: string = 'warning', options: INotification.Options = {}): void {
        this.emit({ type, payload: { message, severity: 'warning', ...options } });
    }

    public error(message: string, type: string = 'danger', options: INotification.Options = {}): void {
        this.emit({ type, payload: { message, severity: 'danger', ...options } });
    }
}
