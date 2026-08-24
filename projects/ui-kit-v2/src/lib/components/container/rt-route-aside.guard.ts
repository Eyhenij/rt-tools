import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivateFn } from '@angular/router';

import { catchError, defer, Observable, of } from 'rxjs';

import { IRtAsideDeactivate, RtRouteAsideRegistry } from './rt-route-aside.registry';

// Объявление переехало к учёту панелей; здесь оно остаётся видимым прежним потребителям.

/**
 * Панель с несохранёнными правками спрашивает о них и при смене маршрута, а не
 * только при закрытии: аутлет `ro` занимает соседняя панель, и правки пропали бы
 * молча.
 *
 * Ставится на каждый ro-маршрут: гард висит на кнопках, нажатии мимо и Esc, а
 * смену маршрута ловит только роутер.
 *
 * Спрашивается панель, учтённая под маршрутом ухода, а не компонент, который
 * подставил роутер. Компонент — не панель, когда ro-маршрут объявлен под уровнем
 * без своего компонента: Angular отдаёт детям контекст родителя, и в гард
 * приходит компонент первичного аутлета. Ответ такого компонента к правкам
 * отношения не имеет, а вызов у него метода, которого нет, ронял навигацию — она
 * падала необработанным отказом, адрес не менялся, и приложение оставалось
 * запертым на панели.
 *
 * Компонент от роутера остаётся запасным путём: гард выведен наружу кита, и
 * панель приложения может отвечать о правках, не наследуя базовый класс, — на
 * учёт такая панель не встаёт никогда. Без запасного пути у неё вопрос о правках
 * исчез бы молча, а это тихая потеря правок.
 *
 * Спрашивать некого — уступить место можно: роутер зовёт гард и для маршрута,
 * чей компонент не создан. Без этого первая же такая навигация падает, а следом
 * отказывает любая другая.
 *
 * Отказом навигации гард не отвечает никогда, в том числе когда ответ панели
 * отказал: разрешить уход значило бы унести правки, о которых спросить не
 * удалось, а отменить и оставить всё как есть — запереть приложение на панели
 * навсегда. Поэтому уход отменяется один раз, а панель снимается с учёта, и
 * следующий уход идёт запасным путём.
 */
/** Компонент от роутера годится в ответчики, только если умеет отвечать. */
function fallbackPanel(component: IRtAsideDeactivate | null): IRtAsideDeactivate | null {
    return typeof component?.canDeactivate === 'function' ? component : null;
}

export const rtAsideUnsavedGuard: CanDeactivateFn<IRtAsideDeactivate | null> = (
    component: IRtAsideDeactivate | null,
    currentRoute: ActivatedRouteSnapshot
): Observable<boolean> => {
    const registry: RtRouteAsideRegistry = inject(RtRouteAsideRegistry);
    const registered: IRtAsideDeactivate | null = registry.find(currentRoute);
    const panel: IRtAsideDeactivate | null = registered ?? fallbackPanel(component);

    if (panel === null) {
        return of(true);
    }

    // defer: ответ панели может отказать и синхронным броском, а гард обязан
    // пережить и его.
    return defer((): Observable<boolean> => panel.canDeactivate()).pipe(
        catchError((): Observable<boolean> => {
            registry.forget(panel);

            return of(false);
        })
    );
};
