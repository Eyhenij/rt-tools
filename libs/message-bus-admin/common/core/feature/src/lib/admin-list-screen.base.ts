import { computed, Directive, effect, inject, Signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router, UrlSegment } from '@angular/router';
import { AdminListStoreBase, TreesStore } from '@rt/message-bus-admin/common/core/data-access';
import {
    adminLabel,
    IAdminListQuery,
    IReadFault,
    listQueryOf,
    listQueryParams,
    pageModelOf,
    sortAskedOf,
    sortModelOf,
} from '@rt/message-bus-admin/common/core/util';
import { ITreeChoice } from '@rt/message-bus-common';
import { IPageModel, ISortModel } from '@rt-tools/utils';
import { RtTableSettingsRegistry } from '@rt-tools/ui-kit-v2';

/**
 * Адрес панели настройки столбцов в аутлете `ro`.
 *
 * Раздела в нём нет намеренно — в отличие от адреса подробностей: настраиваемую таблицу панель
 * берёт из реестра кита, а не из адреса, и второй ответ на тот же вопрос разошёлся бы с первым.
 */
const COLUMNS_ROUTE: string = 'table-settings';

/**
 * Общая основа списочного экрана: связь адреса, стора и таблицы.
 *
 * Раздел объявляет три вещи — свой стор, свои сортируемые поля и свою таблицу в шаблоне. Всё
 * остальное здесь: выборка читается из адреса, страница и порядок уходят обратно в адрес,
 * чтение начинается само, а строки, занятость, отказ и деревья отбора приходят готовыми
 * сигналами.
 *
 * Выборка живёт в адресе, а не в поле экрана: перезагрузка на второй странице отобранного
 * списка иначе возвращает на первую, а ссылка на увиденное не передаётся никому. Отсюда и
 * порядок действий — экран не читает список сам, а меняет адрес, и чтение начинается от него.
 *
 * `@Directive()` без селектора — так основа передаёт наследнику и внедрение, и эффекты: тем же
 * приёмом объявлена основа панели в ките.
 */
@Directive()
export abstract class AdminListScreenBase<TRow, TApi = TRow> {
    readonly #route: ActivatedRoute = inject(ActivatedRoute);
    readonly #router: Router = inject(Router);
    readonly #trees: TreesStore = inject(TreesStore);
    readonly #tableSettings: RtTableSettingsRegistry = inject(RtTableSettingsRegistry);

    readonly #params: Signal<Params> = toSignal(this.#route.queryParams, { initialValue: this.#route.snapshot.queryParams });

    protected readonly query: Signal<IAdminListQuery> = computed(() => listQueryOf(this.#params(), this.sortable));

    protected readonly rows: Signal<readonly TRow[]> = computed(() => this.store.rows());
    protected readonly loading: Signal<boolean> = computed(() => this.store.pending());
    protected readonly fault: Signal<IReadFault | null> = computed(() => this.store.fault());
    protected readonly choices: Signal<readonly ITreeChoice[]> = computed(() => this.#trees.choices());

    protected readonly pageModel: Signal<IPageModel> = computed(() => pageModelOf(this.query(), this.store.total()));
    protected readonly sortModel: Signal<ISortModel<string>> = computed(() => sortModelOf(this.query()));

    /**
     * Чем объяснить пустой список.
     *
     * Отбор, не давший ни строки, и дерево, не приславшее ни одной записи, — разные ответы, и
     * второй означает исправную службу.
     */
    protected readonly emptyMessage: Signal<string> = computed(() =>
        adminLabel(this.query().tree === '' ? 'listEmpty' : 'listEmptyByFilter')
    );

    /** Стор раздела: он знает адрес операции и форму строки. */
    protected abstract readonly store: AdminListStoreBase<TRow, TApi>;

    /**
     * Поля, по которым раздел даёт сортировать. Первое — порядок по умолчанию, и оно же
     * подставляется вместо поля, которого в наборе нет: просить у приёмника порядок, на который
     * он отвечает отказом, незачем.
     */
    protected abstract readonly sortable: readonly string[];

    /**
     * Признак таблицы раздела: им кит узнаёт, чьи столбцы настраивают и под каким ключом их
     * запомнить. Раздел объявляет его и так — этой же строкой таблица зовётся в шаблоне.
     */
    protected abstract readonly tableId: string;

    protected constructor() {
        effect((): void => {
            const asked: IAdminListQuery = this.query();

            untracked((): void => this.store.read(asked));
        });

        this.#trees.read();
    }

    /** Страница списка. Отбор и порядок при переходе остаются теми же — они лежат в том же адресе. */
    protected goToPage(page: number): void {
        this.#apply({ page });
    }

    /** Размер страницы. Считать с той же страницы нельзя: при большем размере её может не быть вовсе. */
    protected changeSize(size: number): void {
        this.#apply({ size, page: 1 });
    }

    /** Порядок, названный заголовком столбца. */
    protected changeSort(sort: ISortModel<string> | null): void {
        this.#apply({ ...sortAskedOf(sort, this.sortable), page: 1 });
    }

    /** Отбор по дереву. Страница сбрасывается: у суженного списка её может не быть. */
    protected changeTree(tree: string): void {
        this.#apply({ tree, page: 1 });
    }

    /** Повторить чтение — то самое «одним действием», которого просит отказ. */
    protected retry(): void {
        this.store.retry();
    }

    /**
     * Открыть запись панелью подробностей.
     *
     * Панель живёт маршрутом в аутлете `ro` рядом с экраном, а не под ним: рисует её правая
     * шторка оболочки, и аутлет объявлен там же, где каркас. Поэтому и уход идёт от оболочки, а
     * адрес панели называет раздел своими же сегментами — теми, которыми экран открыт сам.
     *
     * Выборка при этом остаётся в адресе нетронутой: закрытая панель возвращает тот же список —
     * ту же страницу с тем же отбором и тем же порядком.
     */
    protected openDetails(id: string): void {
        const section: string[] = this.#route.snapshot.url.map((segment: UrlSegment): string => segment.path);

        void this.#router.navigate([{ outlets: { ro: [...section, id] } }], {
            relativeTo: this.#route.parent,
            queryParamsHandling: 'preserve',
        });
    }

    /**
     * Открыть настройку столбцов.
     *
     * Панель везёт кит и открывает её своим маршрутом в том же аутлете `ro`, что и подробности:
     * какую таблицу настраивают, он берёт не из адреса, а из реестра — поэтому активная таблица
     * называется до ухода на маршрут, а не после.
     *
     * Выборка при этом остаётся в адресе: закрытая панель настроек возвращает тот же список, что
     * и панель подробностей.
     */
    protected openColumns(): void {
        this.#tableSettings.setActive(this.tableId);

        void this.#router.navigate([{ outlets: { ro: [COLUMNS_ROUTE] } }], {
            relativeTo: this.#route.parent,
            queryParamsHandling: 'preserve',
        });
    }

    /**
     * Выборка обратно в адрес.
     *
     * Значение, равное умолчанию, снимается пустотой — так роутер убирает параметр из адреса, и
     * ссылка на первую страницу остаётся той же, с какой стороны на неё ни прийти.
     */
    #apply(patch: Partial<IAdminListQuery>): void {
        const next: IAdminListQuery = { ...this.query(), ...patch };

        void this.#router.navigate([], {
            relativeTo: this.#route,
            queryParams: listQueryParams(next, this.sortable),
            queryParamsHandling: 'merge',
        });
    }
}
