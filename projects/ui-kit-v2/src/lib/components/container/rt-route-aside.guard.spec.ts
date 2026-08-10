import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, GuardResult, MaybeAsync, Route } from '@angular/router';

import { firstValueFrom, isObservable, Observable, of, throwError } from 'rxjs';

import { IRtAsideDeactivate, rtAsideUnsavedGuard } from './rt-route-aside.guard';
import { RtRouteAsideRegistry } from './rt-route-aside.registry';

const ROUTE: Route = { path: 'edit/:id', outlet: 'ro' };

function panel(answer: boolean): IRtAsideDeactivate {
    return { canDeactivate: (): Observable<boolean> => of(answer) };
}

function snapshot(): ActivatedRouteSnapshot {
    return { routeConfig: ROUTE } as ActivatedRouteSnapshot;
}

/**
 * Роутер передаёт гарду ещё два аргумента — состояние нынешнее и следующее. Ни
 * одного из них гард не читает, поэтому спека подставляет пустые значения.
 */
function statesArgs(): [never, never] {
    return [undefined, undefined] as unknown as [never, never];
}

/**
 * Ответ гарда, приведённый к одному виду. Роутер разрешает гарду вернуть и
 * значение, и промис, и поток, поэтому спека разбирает все три случая, а не
 * приводит результат к потоку насильно.
 *
 * Гард инжектит учёт панелей, поэтому зовётся в области внедрения.
 */
async function guardAnswer(component: IRtAsideDeactivate | null): Promise<GuardResult> {
    const answer: MaybeAsync<GuardResult> = TestBed.runInInjectionContext((): MaybeAsync<GuardResult> =>
        rtAsideUnsavedGuard(component, snapshot(), ...statesArgs())
    );

    return isObservable(answer) ? firstValueFrom(answer) : answer;
}

describe('rtAsideUnsavedGuard', () => {
    let registry: RtRouteAsideRegistry;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        registry = TestBed.inject(RtRouteAsideRegistry);
    });

    it('SC-UKV-24 — спрашивает панель, учтённую под маршрутом ухода, а не подставленный компонент', async () => {
        // В гард приходит компонент первичного аутлета: так роутер поступает,
        // когда ro-маршрут лежит под уровнем без своего компонента.
        const screen: IRtAsideDeactivate = panel(true);

        registry.register(snapshot(), panel(false));

        await expect(guardAnswer(screen)).resolves.toBe(false);
    });

    it('SC-UKV-26 — уступает место, когда отвечать о правках некому', async () => {
        await expect(guardAnswer(null)).resolves.toBe(true);
    });

    it('SC-UKV-26 — переживает компонент, не умеющий ответить о правках', async () => {
        // Компонент экрана раздела: метода о правках у него нет вовсе.
        const screen: IRtAsideDeactivate = {} as IRtAsideDeactivate;

        await expect(guardAnswer(screen)).resolves.toBe(true);
    });

    it('SC-UKV-30 — спрашивает панель потребителя, не вставшую на учёт', async () => {
        await expect(guardAnswer(panel(false))).resolves.toBe(false);
        await expect(guardAnswer(panel(true))).resolves.toBe(true);
    });

    it('SC-UKV-31 — отказавший ответ панели уход отменяет и снимает панель с учёта', async () => {
        const broken: IRtAsideDeactivate = {
            canDeactivate: (): Observable<boolean> => throwError((): Error => new Error('поток ответа отказал')),
        };

        registry.register(snapshot(), broken);

        await expect(guardAnswer(null)).resolves.toBe(false);
        expect(registry.find(snapshot())).toBeNull();
        // Следующий уход идёт запасным путём: приложение на панели не заперто.
        await expect(guardAnswer(null)).resolves.toBe(true);
    });

    it('SC-UKV-31 — переживает синхронный бросок ответа', async () => {
        const broken: IRtAsideDeactivate = {
            canDeactivate: (): Observable<boolean> => {
                throw new Error('ответ бросил на месте');
            },
        };

        registry.register(snapshot(), broken);

        await expect(guardAnswer(null)).resolves.toBe(false);
    });
});
