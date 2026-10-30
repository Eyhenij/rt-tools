import { Injectable, Type } from '@angular/core';

import { Observable } from 'rxjs';

import { MessageBus } from './message-bus';
import { NotificationRef } from './notification-ref';
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
 *
 * `open` и `openFromComponent` возвращают `NotificationRef` — ручку показанного тоста: закрыть его,
 * обновить на ходу и узнать, почему он ушёл.
 */
@Injectable({ providedIn: 'root' })
export class NotificationBus {
    readonly #bus: MessageBus<INotification.Event> = new MessageBus<INotification.Event>();

    public emit(event: INotification.Event): void {
        this.#bus.emit(event);
    }

    /**
     * Тост с ручкой: закрыть его, обновить на ходу и узнать, почему он ушёл. Тип события по
     * умолчанию — важность. `emit` и `success`/`info`/`warning`/`error` ручки не возвращают: их
     * зовут из стрелок с типом `void`, и смена типа сломала бы сборку таких мест.
     */
    public open(payload: INotification.Payload, type: string = payload.severity): NotificationRef {
        const ref: NotificationRef = new NotificationRef();

        this.#bus.emit({ type, payload, ref });

        return ref;
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

    /**
     * Тост из своего компонента: компонент встаёт на место сообщения и получает `data` токеном
     * `RT_TOAST_DATA`, а ручку — инъекцией `NotificationRef`. Сообщение остаётся именем тоста для
     * чтения с экрана, когда компонент своего текста не даёт.
     */
    public openFromComponent(
        component: Type<unknown>,
        options: INotification.ComponentOptions = {},
        type: string = 'component'
    ): NotificationRef {
        const { severity = 'info', message = '', ...rest } = options;

        return this.open({ ...rest, message, severity, component }, type);
    }
}
