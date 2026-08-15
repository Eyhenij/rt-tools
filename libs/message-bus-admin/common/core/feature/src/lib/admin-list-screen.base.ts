import { computed, Directive, effect, inject, Signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router } from '@angular/router';
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
     * Панель живёт маршрутом в аутлете `ro`, а выборка остаётся в адресе нетронутой: закрытая
     * панель возвращает тот же список — ту же страницу с тем же отбором и тем же порядком.
     */
    protected openDetails(id: string): void {
        void this.#router.navigate([{ outlets: { ro: [id] } }], { relativeTo: this.#route, queryParamsHandling: 'preserve' });
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
