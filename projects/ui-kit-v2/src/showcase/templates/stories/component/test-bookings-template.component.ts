import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { Router, RouterOutlet, Routes } from '@angular/router';

import { translateSignal, TranslocoService } from '@jsverse/transloco';

import { RtContainerComponent } from '../../../../lib/components/container/rt-container.component';
import {
    RtContainerContentDirective,
    RtContainerHeaderDirective,
    RtContainerRightSidenavDirective,
} from '../../../../lib/components/container/rt-container.directives';
import { RtPageHeaderComponent } from '../../../../lib/components/page-header/rt-page-header.component';
import { IRtPageHeader } from '../../../../lib/components/page-header/rt-page-header.model';
import { IRtSelect } from '../../../../lib/components/select/rt-select.model';
import { NotificationBus } from '../../../../lib/platform/notification-bus.service';
import { ThemeService } from '../../../../lib/platform/theme.service';
import { APP_NAV_ITEMS, appNavLabelKeysOf, appNavSectionsOf, TAppNavLabel } from '../../app-nav.items';
import { bookingsRoute } from '../../bookings/bookings.routes';
import { AppProfileMenuComponent } from '../../profile-menu/app-profile-menu.component';

/**
 * Демонстрационная обёртка для витрины: каркас приложения, в котором живёт целый экран.
 *
 * Обёртка, а не сам экран: истории целят в неё по договорённости витрины, а экран внутри неё —
 * то же самое, что стоит у потребителя. Каркас нужен ей не для красоты: панель заведения и
 * правки открывается адресом в аутлете `ro`, а этот аутлет живёт в правом сайднаве каркаса — без
 * него панель не показалась бы вовсе.
 *
 * Верхняя навигация — тот же компонент кита, что стоит в приложении, и ряд у неё полный: разделы
 * с адресом, раздел без экрана, два раздела с панелью второго уровня и юзер-блок с попапом
 * профиля. Левого меню у каркаса нет: разделы живут в шапке, и колонка слева отняла бы у списка
 * ширину, которой у него и так нет.
 *
 * В пакет обёртка не уезжает: `src/showcase/**` исключён из сборки библиотеки.
 */

/**
 * Маршруты раздела. Объявляются здесь, а не в настройке показа: внесённые туда, они тянут
 * компоненты кита в момент разбора настройки — раньше, чем те успевают объявиться, — и витрина
 * падает на круговом импорте целиком, всеми историями сразу.
 *
 * Раздел лежит на непустом пути, а его ветка — на пустом внутри: из маршрута с непустым путём
 * относительная навигация в именованный аутлет не разрешается, и панель не открылась бы ни
 * кнопкой, ни кликом по строке.
 */
const SHOWCASE_ROUTES: Routes = [{ path: 'bookings', children: [bookingsRoute] }];

/** Адрес раздела: с него начинается показ, и по нему же узнаётся уже открытая панель. */
const SECTION_URL: string = '/bookings';

/** Ключи подписей разделов: перевод приходит списком той же длины. */
const NAV_LABEL_KEYS: string[] = appNavLabelKeysOf(APP_NAV_ITEMS);

/** Кто «вошёл» в показ. Имя выдумано, как и всё остальное в наборе. */
const SHOWCASE_USER_NAME: string = 'Мария Ветрова';

/** Заведение, названное в попапе профиля. */
const SHOWCASE_ORGANIZATION: string = 'Лотос Резортс';

/** Языки в переключателе подписаны на самих себе: свой ищут, не понимая интерфейса. */
const LOCALE_OPTIONS: ReadonlyArray<IRtSelect.Option<string>> = [
    { value: 'ru', label: 'Русский' },
    { value: 'en', label: 'English' },
];

@Component({
    selector: 'app-bookings-template',
    template: `
        <!-- Высота каркаса не прибита к вьюпорту: страница растёт под содержимое и скроллится
             целиком, а не зонами по отдельности — иначе переключатель страниц уезжает под
             нижний край и достать его нечем. -->
        <rt-container>
            <ng-container *rtContainerHeader>
                <rt-page-header ariaLabel="Разделы" [items]="headerItems()" [user]="user" [userMenu]="profileMenu" />
            </ng-container>

            <ng-container *rtContainerContent>
                <router-outlet />
            </ng-container>

            <!-- Панель заведения и правки приезжает сюда: её маршрут объявлен в аутлете ro. -->
            <ng-container *rtContainerRightSidenav>
                <router-outlet name="ro" />
            </ng-container>
        </rt-container>

        <!-- Содержимое попапа профиля. Кит открывает его наведением и рисует в перекрытии. -->
        <ng-template #profileMenu>
            <app-profile-menu
                qa-dataid="header-profile-menu"
                [canChangeOrganization]="true"
                [userName]="user.name"
                [organizationName]="organizationName"
                [locale]="locale()"
                [localeOptions]="localeOptions"
                [isDark]="isDark()"
                (changeOrganization)="onDemoAction()"
                (localeChange)="onLocaleChange($event)"
                (themeToggled)="onToggleTheme()"
                (passwordChange)="onDemoAction()"
                (logout)="onDemoAction()" />
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        RouterOutlet,

        // components
        AppProfileMenuComponent,
        RtContainerComponent,
        RtContainerContentDirective,
        RtContainerHeaderDirective,
        RtContainerRightSidenavDirective,
        RtPageHeaderComponent,
    ],
})
export class TestRtBookingsTemplateComponent implements OnInit {
    readonly #router: Router = inject(Router);
    readonly #location: Location = inject(Location);
    readonly #theme: ThemeService = inject(ThemeService);
    readonly #transloco: TranslocoService = inject(TranslocoService);
    readonly #notifications: NotificationBus = inject(NotificationBus);

    /**
     * Подписи разделов сигналом, а не строками в декларации: она вычисляется один раз при
     * загрузке файла, и смена языка оставила бы навигацию на прежнем.
     */
    readonly #navLabels: Signal<string[]> = translateSignal(NAV_LABEL_KEYS);

    readonly #locale: WritableSignal<string> = signal<string>('ru');

    /** Декларация переводится в модель кита здесь: словаря кит не знает. */
    public readonly headerItems: Signal<ReadonlyArray<IRtPageHeader.Item>> = computed((): ReadonlyArray<IRtPageHeader.Item> => {
        const labels: string[] = this.#navLabels();
        const byKey: ReadonlyMap<string, string> = new Map<string, string>(
            NAV_LABEL_KEYS.map((labelKey: string, index: number): [string, string] => [labelKey, labels[index] ?? labelKey])
        );
        const label: TAppNavLabel = (labelKey: string): string => byKey.get(labelKey) ?? labelKey;

        return appNavSectionsOf(APP_NAV_ITEMS, label);
    });

    public readonly user: IRtPageHeader.User = { name: SHOWCASE_USER_NAME, avatar: 'М' };

    public readonly organizationName: string = SHOWCASE_ORGANIZATION;

    public readonly localeOptions: ReadonlyArray<IRtSelect.Option<string>> = LOCALE_OPTIONS;

    public readonly locale: Signal<string> = this.#locale.asReadonly();

    public readonly isDark: Signal<boolean> = this.#theme.isDark;

    public ngOnInit(): void {
        // Маршруты вносятся в уже поднятый роутер: набор, объявленный при его создании, разбирался
        // бы вместе с настройкой показа и уронил бы витрину круговым импортом.
        this.#router.resetConfig(SHOWCASE_ROUTES);

        // Витрина открывает историю по своему адресу, а не по адресу раздела: без этого перехода
        // в аутлете каркаса не нарисовалось бы ничего, и история показала бы пустой каркас.
        // Уже набранный адрес при этом сохраняется: переход на раздел без разбора стирал бы
        // открытую панель, и на перезагрузке страницы она не возвращалась бы никогда.
        const requested: string = this.#location.path();

        void this.#router.navigateByUrl(requested.startsWith(SECTION_URL) ? requested : SECTION_URL);
    }

    /** Тему переключает служба кита — та же, что и в приложении: показ здесь ничего не имитирует. */
    public onToggleTheme(): void {
        this.#theme.toggle();
    }

    /** Язык у показа один: словарь второго нет, и выбор остаётся выбором. */
    public onLocaleChange(code: string): void {
        this.#locale.set(code);
    }

    /**
     * Смена заведения, смена пароля и выход у показа никуда не ведут: за ними стоят экраны
     * приложения, которых здесь нет. Нажатие отвечает тостом — тем же, каким отвечает всё
     * остальное в этом показе.
     */
    public onDemoAction(): void {
        this.#notifications.info(this.#transloco.translate('profileActionDemo'));
    }
}
