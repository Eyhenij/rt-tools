import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { AuthStore } from '@rt/message-bus-admin/auth/data-access';
import { SIGN_IN_PATH } from '@rt/message-bus-admin/auth/shell';
import { IAdminSession } from '@rt/message-bus-admin/auth/util';
import { AdminHeaderComponent } from '@rt/message-bus-admin/common/container/ui';
import { ADMIN_MENU, IAdminMenuItem } from '@rt/message-bus-admin/common/container/util';
import {
    IRtPageHeader,
    RtContainerComponent,
    RtContainerContentDirective,
    RtContainerHeaderDirective,
    RtContainerRightSidenavDirective,
    RtToasterComponent,
} from '@rt-tools/ui-kit-v2';
import { exhaustMap, Observable, Subject } from 'rxjs';

const BEM_BLOCK: string = 'admin-container';

/**
 * Оболочка админки: шапка с разделами и место под раздел.
 *
 * Каркас и шапка — готовые части: каркас берётся у кита, а шапка ставит его верхний ряд. Своя
 * разметка под них означала бы второй ответ на вопрос, как выглядит страница админки.
 *
 * Подсветку текущего раздела оболочка не считает вовсе: пункт несёт адрес, а горит тот, чей адрес
 * открыт, — это решает маршрутизатор внутри кита. Прежде здесь стояло производное по событиям
 * роутера, и оно отвечало на вопрос об адресе второй раз.
 *
 * Правая шторка объявлена здесь же, и стоит в ней аутлет панелей: рисует шторку каркас, поверх
 * страницы и через наложение, а рисует он только то, что объявлено этой зоной. Аутлет, спрятанный
 * внутрь экрана раздела, оставлял бы панель стоять под таблицей — открытой, но не шторкой.
 *
 * Тостами оболочка не заведует и подписки на них не держит: она только ставит их место. Кому что
 * сказать, решают сторы разделов, и говорят они общей шиной кита — тостер её слушает сам.
 */
@Component({
    selector: 'admin-container',
    templateUrl: './admin-container.component.html',
    styleUrl: './admin-container.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RouterOutlet,
        AdminHeaderComponent,
        RtContainerComponent,
        RtContainerContentDirective,
        RtContainerHeaderDirective,
        RtContainerRightSidenavDirective,
        RtToasterComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminContainerComponent {
    readonly #router: Router = inject(Router);
    readonly #store: AuthStore = inject(AuthStore);
    readonly #signOutSource: Subject<void> = new Subject<void>();

    protected readonly sections: Signal<ReadonlyArray<IRtPageHeader.Item>> = computed(() =>
        ADMIN_MENU.map((item: IAdminMenuItem) => ({
            id: item.path,
            icon: item.icon,
            label: item.title,
            route: item.path,
        }))
    );

    protected readonly session: Signal<IAdminSession | null> = this.#store.session;

    protected readonly user: Signal<IRtPageHeader.User | null> = computed(() => {
        const session: IAdminSession | null = this.session();

        return session === null ? null : { name: session.name };
    });

    constructor() {
        this.#signOutSource
            .pipe(
                exhaustMap((): Observable<void> => this.#store.signOut()),
                takeUntilDestroyed()
            )
            .subscribe((): void => {
                void this.#router.navigate([SIGN_IN_PATH]);
            });
    }

    protected signOut(): void {
        this.#signOutSource.next();
    }
}
