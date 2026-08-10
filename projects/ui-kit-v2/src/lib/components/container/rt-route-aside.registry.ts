import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Route } from '@angular/router';

import { IRtAsideDeactivate } from './rt-route-aside.guard';

/**
 * Учёт панелей, стоящих на экране: из него роутерный гард узнаёт, кого спрашивать
 * о несохранённых правках.
 *
 * Спрашивать компонент, который роутер подставляет в гард, нельзя: когда
 * ro-маршрут объявлен под уровнем без своего компонента, Angular отдаёт детям
 * контекст родителя, и в гард приходит компонент первичного аутлета — экран
 * раздела, а не панель.
 *
 * Ключ записи — объявление маршрута, а не порядок постановки. Гард стоит на
 * каждом ro-маршруте, и одна навигация зовёт его за каждый уходящий маршрут
 * отдельно: учёт стеком дал бы ответ не той панели и два вопроса о правках
 * подряд. Объявление маршрута — та же ссылка на объект и у панели, и у снимка,
 * который роутер отдаёт гарду, поэтому два каркаса на экране не путаются даже
 * при одинаково названных аутлетах: маршруты у них разные.
 *
 * Служба корневая: гард живёт в инжекторе маршрута и до службы, поставленной на
 * уровне компонента, не дотянулся бы вовсе. Одного учёта на приложение хватает —
 * записи различает маршрут. Переменной уровня модуля учёт быть не может: та
 * пережила бы запрос при отдаче страницы сервером и оказалась бы общей на два
 * приложения, поднятых на одной странице.
 */
@Injectable({ providedIn: 'root' })
export class RtRouteAsideRegistry {
    readonly #panels: Map<Route, IRtAsideDeactivate> = new Map<Route, IRtAsideDeactivate>();

    /**
     * Панель встала на экран. Повторная постановка под тем же маршрутом заменяет
     * запись: аутлет держит одну панель, и отвечать должна нынешняя.
     */
    public register(route: ActivatedRouteSnapshot, panel: IRtAsideDeactivate): void {
        const key: Route | null = route.routeConfig;

        if (key === null) {
            return;
        }

        this.#panels.set(key, panel);
    }

    /**
     * Панель ушла с экрана. Запись снимается только своя: пока уходящая панель
     * доигрывает уход, её место мог занять сосед, и снятие вслепую стёрло бы
     * запись того, кто на экране остался.
     */
    public unregister(route: ActivatedRouteSnapshot, panel: IRtAsideDeactivate): void {
        const key: Route | null = route.routeConfig;

        if (key === null || this.#panels.get(key) !== panel) {
            return;
        }

        this.#panels.delete(key);
    }

    /** Снятие панели, чей ответ о правках отказал: спрашивать её больше нечем. */
    public forget(panel: IRtAsideDeactivate): void {
        for (const [key, registered] of this.#panels) {
            if (registered === panel) {
                this.#panels.delete(key);
            }
        }
    }

    /** Панель, отвечающая за уход с этого маршрута, или её отсутствие. */
    public find(route: ActivatedRouteSnapshot): IRtAsideDeactivate | null {
        const key: Route | null = route.routeConfig;

        if (key === null) {
            return null;
        }

        return this.#panels.get(key) ?? null;
    }
}
