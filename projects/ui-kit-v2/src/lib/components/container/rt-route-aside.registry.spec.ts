import { ActivatedRouteSnapshot, Route } from '@angular/router';

import { Observable, of } from 'rxjs';

import { IRtAsideDeactivate } from './rt-route-aside.registry';
import { RtRouteAsideRegistry } from './rt-route-aside.registry';

function panel(answer: boolean): IRtAsideDeactivate {
    return { canDeactivate: (): Observable<boolean> => of(answer) };
}

/**
 * Гарду роутер отдаёт снимок маршрута; учёту от него нужно одно — объявление
 * маршрута, та же ссылка на объект и у панели, и у снимка.
 */
function snapshotOf(route: Route | null): ActivatedRouteSnapshot {
    return { routeConfig: route } as ActivatedRouteSnapshot;
}

describe('RtRouteAsideRegistry', () => {
    function setup(): RtRouteAsideRegistry {
        return new RtRouteAsideRegistry();
    }

    it('отдаёт панель, учтённую под маршрутом ухода', () => {
        const registry: RtRouteAsideRegistry = setup();
        const route: Route = { path: 'edit/:id' };
        const registered: IRtAsideDeactivate = panel(true);

        registry.register(snapshotOf(route), registered);

        expect(registry.find(snapshotOf(route))).toBe(registered);
    });

    it('отдаёт пусто, когда под маршрутом никого нет', () => {
        expect(setup().find(snapshotOf({ path: 'edit/:id' }))).toBeNull();
    });

    it('отдаёт пусто, когда у маршрута нет объявления', () => {
        const registry: RtRouteAsideRegistry = setup();

        registry.register(snapshotOf(null), panel(true));

        expect(registry.find(snapshotOf(null))).toBeNull();
    });

    it('SC-UKV-27 — снятая с учёта панель о правках больше не спрашивается', () => {
        const registry: RtRouteAsideRegistry = setup();
        const route: Route = { path: 'edit/:id' };
        const gone: IRtAsideDeactivate = panel(false);

        registry.register(snapshotOf(route), gone);
        registry.unregister(snapshotOf(route), gone);

        expect(registry.find(snapshotOf(route))).toBeNull();
    });

    it('SC-UKV-28 — панели двух каркасов не отвечают друг за друга', () => {
        const registry: RtRouteAsideRegistry = setup();
        // Аутлет у обоих каркасов назван одинаково, а объявления маршрутов разные.
        const first: Route = { path: 'edit/:id', outlet: 'ro' };
        const second: Route = { path: 'edit/:id', outlet: 'ro' };
        const firstPanel: IRtAsideDeactivate = panel(true);
        const secondPanel: IRtAsideDeactivate = panel(false);

        registry.register(snapshotOf(first), firstPanel);
        registry.register(snapshotOf(second), secondPanel);

        expect(registry.find(snapshotOf(first))).toBe(firstPanel);
        expect(registry.find(snapshotOf(second))).toBe(secondPanel);
    });

    it('уходящая панель не снимает с учёта ту, что заняла её место', () => {
        const registry: RtRouteAsideRegistry = setup();
        const route: Route = { path: 'edit/:id' };
        const leaving: IRtAsideDeactivate = panel(true);
        const arrived: IRtAsideDeactivate = panel(false);

        registry.register(snapshotOf(route), leaving);
        registry.register(snapshotOf(route), arrived);
        // Уходящая панель уничтожается позже той, что встала на её место.
        registry.unregister(snapshotOf(route), leaving);

        expect(registry.find(snapshotOf(route))).toBe(arrived);
    });

    it('забытая панель снимается со всех маршрутов, где стояла', () => {
        const registry: RtRouteAsideRegistry = setup();
        const first: Route = { path: 'edit/:id' };
        const second: Route = { path: 'view/:id' };
        const broken: IRtAsideDeactivate = panel(true);

        registry.register(snapshotOf(first), broken);
        registry.register(snapshotOf(second), broken);
        registry.forget(broken);

        expect(registry.find(snapshotOf(first))).toBeNull();
        expect(registry.find(snapshotOf(second))).toBeNull();
    });
});
