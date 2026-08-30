import { Router, UrlTree } from '@angular/router';

import { RtRouteAsideNavigation } from './rt-route-aside.navigation';

interface ITreeCall {
    commands: unknown;
    extras: unknown;
}

/** Двойник маршрутизатора: навигации нужен только сбор дерева адреса. */
function routerDouble(calls: ITreeCall[]): Router {
    return {
        createUrlTree: (commands: unknown, extras: unknown): UrlTree => {
            calls.push({ commands, extras });

            return {} as UrlTree;
        },
    } as unknown as Router;
}

describe('RtRouteAsideNavigation', () => {
    it('без начатого ухода разрешения нет', () => {
        expect(new RtRouteAsideNavigation(routerDouble([])).consumeLeaveAllowance()).toBe(false);
    });

    it('уход, начатый панелью, разрешение выдаёт', () => {
        const navigation: RtRouteAsideNavigation = new RtRouteAsideNavigation(routerDouble([]));

        navigation.allowed((): Promise<boolean> => new Promise((): void => undefined));

        expect(navigation.consumeLeaveAllowance()).toBe(true);
    });

    it('разрешение читается один раз', () => {
        const navigation: RtRouteAsideNavigation = new RtRouteAsideNavigation(routerDouble([]));

        navigation.allowed((): Promise<boolean> => new Promise((): void => undefined));
        navigation.consumeLeaveAllowance();

        expect(navigation.consumeLeaveAllowance()).toBe(false);
    });

    it('невостребованное разрешение снимается итогом навигации', async (): Promise<void> => {
        const navigation: RtRouteAsideNavigation = new RtRouteAsideNavigation(routerDouble([]));

        navigation.allowed((): Promise<boolean> => Promise.resolve(true));
        await Promise.resolve();
        await Promise.resolve();

        expect(navigation.consumeLeaveAllowance()).toBe(false);
    });

    it('отказ навигации разрешения не оставляет', async (): Promise<void> => {
        const navigation: RtRouteAsideNavigation = new RtRouteAsideNavigation(routerDouble([]));

        navigation.allowed((): Promise<boolean> => Promise.reject(new Error('отклонено')));
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();

        expect(navigation.consumeLeaveAllowance()).toBe(false);
    });

    it('адрес ухода снимает свой аутлет и кладёт команды в первичную ветку', () => {
        const calls: ITreeCall[] = [];
        const navigation: RtRouteAsideNavigation = new RtRouteAsideNavigation(routerDouble(calls));

        navigation.relatedTree({ ro: null }, ['/guests', '7'], { page: 2 });

        expect(calls).toEqual([{ commands: [{ outlets: { ro: null, primary: ['guests', '7'] } }], extras: { queryParams: { page: 2 } } }]);
    });

    it('без параметров адреса они не передаются', () => {
        const calls: ITreeCall[] = [];
        const navigation: RtRouteAsideNavigation = new RtRouteAsideNavigation(routerDouble(calls));

        navigation.relatedTree({ ro: null }, ['guests']);

        expect(calls[0].extras).toEqual({ queryParams: null });
    });
});
