import { Params, Router, UrlTree } from '@angular/router';

import { rootSegmentsOf } from './rt-route-aside.logic';

/** Аутлеты, которые уход панели снимает вместе со своим. */
export type TRtRouteAsideOutlets = Record<string, Array<string> | null>;

/**
 * Уходы панели по маршруту и разрешение на них.
 *
 * Разрешение выдаётся вплотную к вызову маршрутизатора и снимается итогом навигации:
 * между закрытием панели и уходом наложение доигрывает своё, и разрешение, выданное
 * раньше, досталось бы чужому уходу — тронутая форма уехала бы без вопроса. Читается оно
 * тоже один раз: иначе первое же закрытие после записи сняло бы вопрос о правках со всех
 * следующих уходов.
 */
export class RtRouteAsideNavigation {
    readonly #router: Router;
    #leaveAllowed: boolean = false;

    constructor(router: Router) {
        this.#router = router;
    }

    /** Разрешение на этот уход. Читается один раз и снимается чтением. */
    public consumeLeaveAllowance(): boolean {
        const allowed: boolean = this.#leaveAllowed;

        this.#leaveAllowed = false;

        return allowed;
    }

    /** Уход, начатый самой панелью: разрешение живёт ровно эту навигацию. */
    public allowed(navigate: () => Promise<boolean>): void {
        this.#leaveAllowed = true;

        void navigate()
            .catch((): boolean => false)
            .then((): void => {
                this.#leaveAllowed = false;
            });
    }

    /**
     * Адрес, на который уходит панель. Свой аутлет она снимает тем же деревом: абсолютные
     * команды меняют только первичную ветку, и панель, открытая в корне приложения, переход
     * пережила бы — маршрута под неё в корне нет, а такую навигацию маршрутизатор отклоняет
     * молча, оставляя приложение на панели, которой на экране уже нет.
     */
    public relatedTree(outlets: TRtRouteAsideOutlets, commands: readonly unknown[], queryParams: Params | null = null): UrlTree {
        return this.#router.createUrlTree([{ outlets: { ...outlets, primary: rootSegmentsOf(commands) } }], { queryParams });
    }
}
