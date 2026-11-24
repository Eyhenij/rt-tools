import { ChangeDetectionStrategy, Component, effect, inject, untracked, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Event as RouterEvent, NavigationCancel, NavigationEnd, NavigationError } from '@angular/router';

import { exhaustMap, filter, Observable, of, Subject, switchMap, take, timer } from 'rxjs';

import { RtContainerRightSidenavPanelDirective, RtRouteAsideComponent } from '@rt-tools/ui-kit-v2/container';
import { BreakpointsService } from '@rt-tools/ui-kit-v2/core';
import { RtToolbarFiltersPanelComponent } from '../filters-panel/rt-toolbar-filters-panel.component';
import { RtToolbarFiltersHub } from '../rt-toolbar-filters-hub';
import { IRtToolbar } from '../rt-toolbar.model';

const BEM_BLOCK: string = 'rt-toolbar-filters-route-aside';

/**
 * Панель отборов полосы `rt-toolbar`, которую приложение открывает своим маршрутом в аутлете `ro`.
 *
 * Полоса с `filtersPanel="app"` по нажатию кнопки сообщает `filtersOpen`, и приложение переходит на
 * маршрут этой панели. Панель рисует `rt-toolbar-filters-panel` с отборами полосы, отданными через
 * связку кита. Маршрут переживает перезагрузку, передаётся ссылкой и попадает в историю браузера.
 *
 * Закрытие идёт общим путём маршрутных панелей кита — `onClose()`: стрелка, «Применить», нажатие
 * мимо панели и Esc. Сама панель закрывается, когда отборы вернулись в полосу на широком месте и
 * когда полоса ушла со страницы. Это решается только у готовой панели: до неё место страницы ещё не
 * измерено, а закрыть ещё не открытую панель нечем.
 *
 * @example
 * ```ts
 * { path: 'filters', outlet: 'ro', component: RtToolbarFiltersRouteAsideComponent }
 * ```
 */
@Component({
    selector: 'rt-toolbar-filters-route-aside',
    templateUrl: './rt-toolbar-filters-route-aside.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // components
        RtToolbarFiltersPanelComponent,

        // directives
        RtContainerRightSidenavPanelDirective,
    ],
    host: { class: BEM_BLOCK },
})
export class RtToolbarFiltersRouteAsideComponent extends RtRouteAsideComponent<never> {
    readonly #hub: RtToolbarFiltersHub = inject(RtToolbarFiltersHub);
    readonly #breakpoints: BreakpointsService = inject(BreakpointsService);

    readonly #dismissSource: Subject<void> = new Subject<void>();

    /** Полоса уже отдала отборы: её уход со страницы закрывает панель. */
    #seen: boolean = false;

    /** Отборы уже стояли за кнопкой: их возврат в строку закрывает панель и до замера места. */
    #seenCollapsed: boolean = false;

    constructor() {
        super();
        // Страница, открытая по ссылке, ставит маршрут панели раньше полосы списка: пока полоса не
        // отдала отборы, панель ждёт её и не закрывается
        effect((): void => {
            const panel: RtContainerRightSidenavPanelDirective | undefined = this.panel();
            if (panel === undefined || !panel.ready()) {
                return;
            }
            const source: IRtToolbar.IFiltersSource | null = this.#hub.current();
            if (source === null) {
                if (this.#seen) {
                    untracked((): void => this.onClose());
                }
                return;
            }
            this.#seen = true;
            if (source.collapsed()) {
                this.#seenCollapsed = true;
                return;
            }
            // Каркас измеряет место страницы после первой отрисовки, позже маршрута панели. До замера
            // ширину даёт окно, и широкое окно при узком месте закрыло бы панель на перезагрузке
            if (this.#seenCollapsed || this.#breakpoints.placeWidth() !== null) {
                untracked((): void => this.onClose());
            }
        });

        // Стрелка или «Применить». Отбор, применённый переходом по адресу, закрывается после этого
        // перехода: второй переход, начатый сразу, отменил бы первый, и отбор не попал бы в адрес.
        // Решение ждёт одну макрозадачу: переход, начатый приложением из микрозадачи или эффекта
        // хранилища, к этому времени уже идёт
        this.#dismissSource
            .pipe(
                exhaustMap((): Observable<unknown> =>
                    timer(0).pipe(
                        switchMap((): Observable<unknown> =>
                            untracked(this.router.currentNavigation) === null ? of(null) : this.#navigationDone()
                        )
                    )
                ),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((): void => this.onClose());
    }

    protected resolve(): Observable<never | null> {
        return of(null);
    }

    protected onDismiss(): void {
        this.#dismissSource.next();
    }

    #navigationDone(): Observable<RouterEvent> {
        return this.router.events.pipe(
            filter(
                (event: RouterEvent): boolean =>
                    event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError
            ),
            take(1)
        );
    }
}
