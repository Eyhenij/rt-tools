import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AuthStore } from '@rt/message-bus-admin/auth/data-access';
import { SIGN_IN_PATH } from '@rt/message-bus-admin/auth/shell';
import { IAdminSession } from '@rt/message-bus-admin/auth/util';
import { ADMIN_MENU, IAdminMenuItem } from '@rt/message-bus-admin/common/container/util';
import {
    IRtSectionNav,
    RtContainerComponent,
    RtContainerContentDirective,
    RtContainerHeaderDirective,
    RtContainerLeftSidenavDirective,
    RtContainerRightSidenavDirective,
    RtHeaderComponent,
    RtSectionNavComponent,
} from '@rt-tools/ui-kit-v2';
import { exhaustMap, filter, map, Observable, startWith, Subject } from 'rxjs';

const BEM_BLOCK: string = 'admin-container';

/**
 * Оболочка админки: шапка, меню разделов и место под раздел.
 *
 * Каркас, шапка и плитки разделов — готовые компоненты кита: своя разметка под них означала бы
 * второй ответ на вопрос, как выглядит страница админки.
 *
 * Подсветку текущего раздела компонент не держит — она приходит набором, пересчитанным по адресу
 * после перехода. Адрес читается сигналом, поднятым из событий роутера: производное значение
 * следит только за прочитанными сигналами, и обычный вызов роутера зависимостью бы не стал.
 *
 * Правая шторка объявлена здесь же, и стоит в ней аутлет панелей: рисует шторку каркас, поверх
 * страницы и через наложение, а рисует он только то, что объявлено этой зоной. Аутлет, спрятанный
 * внутрь экрана раздела, оставлял бы панель стоять под таблицей — открытой, но не шторкой.
 */
@Component({
    selector: 'admin-container',
    templateUrl: './admin-container.component.html',
    styleUrl: './admin-container.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RouterOutlet,
        RtContainerComponent,
        RtContainerContentDirective,
        RtContainerHeaderDirective,
        RtContainerLeftSidenavDirective,
        RtContainerRightSidenavDirective,
        RtHeaderComponent,
        RtSectionNavComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminContainerComponent {
    readonly #router: Router = inject(Router);
    readonly #store: AuthStore = inject(AuthStore);
    readonly #signOutSource: Subject<void> = new Subject<void>();

    readonly #url: Signal<string> = toSignal(
        this.#router.events.pipe(
            filter((event: unknown): event is NavigationEnd => event instanceof NavigationEnd),
            map((event: NavigationEnd): string => event.urlAfterRedirects),
            startWith(this.#router.url)
        ),
        { initialValue: this.#router.url }
    );

    protected readonly sections: Signal<readonly IRtSectionNav.Item[]> = computed(() => {
        const url: string = this.#url();

        return ADMIN_MENU.map((item: IAdminMenuItem) => ({
            id: item.path,
            icon: item.icon,
            label: item.title,
            active: url.startsWith(item.path),
        }));
    });

    protected readonly session: Signal<IAdminSession | null> = this.#store.session;

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

    protected goTo(path: string): void {
        void this.#router.navigateByUrl(path);
    }

    protected signOut(): void {
        this.#signOutSource.next();
    }
}
