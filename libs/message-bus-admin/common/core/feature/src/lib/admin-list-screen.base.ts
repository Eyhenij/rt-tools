import { computed, Directive, effect, inject, Signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router, UrlSegment } from '@angular/router';
import { AdminListStoreBase, TreesStore } from '@rt/message-bus-admin/common/core/data-access';
import {
    adminLabel,
    COLUMNS_ROUTE,
    IAdminListHost,
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
 *
 * Она же отвечает на всё, что общий вид страницы спрашивает у хоста: раздел только указывает
 * провайдером на себя, а ответы лежат здесь — одни на все три раздела.
 */
@Directive()
export abstract class AdminListScreenBase<TRow, TApi = TRow> implements IAdminListHost {
    readonly #route: ActivatedRoute = inject(ActivatedRoute);
    readonly #router: Router = inject(Router);
    readonly #trees: TreesStore = inject(TreesStore);
    readonly #tableSettings: RtTableSettingsRegistry = inject(RtTableSettingsRegistry);

    readonly #params: Signal<Params> = toSignal(this.#route.queryParams, { initialValue: this.#route.snapshot.queryParams });

    protected readonly query: Signal<IAdminListQuery> = computed(() => listQueryOf(this.#params(), this.sortable));

    protected readonly rows: Signal<readonly TRow[]> = computed(() => this.store.rows());
    protected readonly choices: Signal<readonly ITreeChoice[]> = computed(() => this.#trees.choices());

    protected readonly sortModel: Signal<ISortModel<string>> = computed(() => sortModelOf(this.query()));

    /**
     * Сужен ли список хоть чем-нибудь.
     *
     * Отборов у раздела бывает несколько, и пустое состояние отвечает на вопрос «сужено ли», а
     * не «каким именно отбором»: считать их порознь значило бы объяснять пустоту по-разному в
     * зависимости от того, какой отбор человек тронул последним.
     */
    protected readonly narrowed: Signal<boolean> = computed(() => this.query().tree !== '' || this.query().state !== '');

    /**
     * Чем объяснить пустой список.
     *
     * Отбор, не давший ни строки, и дерево, не приславшее ни одной записи, — разные ответы, и
     * второй означает исправную службу.
     */
    protected readonly emptyMessage: Signal<string> = computed(() => adminLabel(this.narrowed() ? 'listEmptyByFilter' : 'listEmpty'));

    /**
     * Вторая строка пустого состояния: откуда записи приходят и что человеку сделать.
     *
     * Заголовок отвечает на вопрос «сломано ли», а этот ответ — на вопрос «что теперь»: записи
     * приносит дерево, а пустоту по отбору снимает сам человек. Одной строкой оба ответа стояли
     * через двоеточие и читались как одна длинная подпись.
     */
    protected readonly emptyDescription: Signal<string> = computed(() =>
        adminLabel(this.narrowed() ? 'listEmptyByFilterFrom' : 'listEmptyFrom')
    );

    /**
     * Якоря самого списка, собранные из префикса раздела. Ячейки раздел собирает в шаблоне тем
     * же префиксом: их набор у каждого раздела свой, и общего поля под них нет.
     */
    protected readonly qaTable: Signal<string> = computed(() => `${this.qaPrefix}-table`);
    protected readonly qaRow: Signal<string> = computed(() => `${this.qaPrefix}-row`);

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

    /**
     * Префикс раздела — короткое слово, которым он зовётся в якорях проверки. Тем же словом его
     * знает общий вид страницы: из него он собирает якоря подсказки, столбцов, обновления и
     * отказа.
     *
     * Раздел называет его один раз здесь, а не строкой у каждого элемента разметки: разъехавшись
     * с префиксом страницы, такие строки молчат — спека, открывшая соседний раздел, находит по
     * ним свой же якорь и проходит зелёной.
     */
    protected abstract readonly qaPrefix: string;

    /**
     * Состояние чтения — то, что страница списка спрашивает у хоста.
     *
     * Публичны эти трое ровно затем: их зовёт не только шаблон раздела, но и вид страницы через
     * токен хоста, а внедрённое видно снаружи класса.
     */
    public readonly loading: Signal<boolean> = computed(() => this.store.pending());
    public readonly fault: Signal<IReadFault | null> = computed(() => this.store.fault());
    public readonly pageModel: Signal<IPageModel> = computed(() => pageModelOf(this.query(), this.store.total()));

    protected constructor() {
        effect((): void => {
            const asked: IAdminListQuery = this.query();

            untracked((): void => this.store.read(asked));
        });

        this.#trees.read();
    }

    /** Страница списка. Отбор и порядок при переходе остаются теми же — они лежат в том же адресе. */
    public goToPage(page: number): void {
        this.#apply({ page });
    }

    /** Размер страницы. Считать с той же страницы нельзя: при большем размере её может не быть вовсе. */
    public changeSize(size: number): void {
        this.#apply({ size, page: 1 });
    }

    /** Повторить чтение — то самое «одним действием», которого просит отказ. */
    public retry(): void {
        this.store.retry();
    }

    /**
     * Открыть настройку столбцов.
     *
     * Панель у каждой таблицы своя, и адрес её называет раздел — теми же сегментами, какими
     * открыт сам экран. Общий адрес на три раздела давал бы одну панель на три таблицы: по
     * ссылке было бы не сказать, чьи столбцы настраивают, а вернувшийся по ней человек попадал
     * бы в настройки того раздела, который открылся первым.
     *
     * Рисует панель кит, и настраиваемую таблицу он берёт из своего реестра, а не из адреса —
     * поэтому активная таблица называется до ухода на маршрут, а не после.
     *
     * Выборка при этом остаётся в адресе: закрытая панель настроек возвращает тот же список, что
     * и панель подробностей.
     */
    public openColumns(): void {
        this.#tableSettings.setActive(this.tableId);

        void this.#router.navigate([{ outlets: { ro: [...this.#section(), COLUMNS_ROUTE] } }], {
            relativeTo: this.#route.parent,
            queryParamsHandling: 'preserve',
        });
    }

    /** Порядок, названный заголовком столбца. */
    protected changeSort(sort: ISortModel<string> | null): void {
        this.#apply({ ...sortAskedOf(sort, this.sortable), page: 1 });
    }

    /** Отбор по дереву. Страница сбрасывается: у суженного списка её может не быть. */
    protected changeTree(tree: string): void {
        this.#apply({ tree, page: 1 });
    }

    /**
     * Отбор по состоянию записи. Страница сбрасывается тем же доводом, что и у отбора по дереву.
     *
     * Отбор по дереву при этом не трогается: два условия сужают список вместе, а снятый вторым
     * первый человек заметил бы не сразу и прочитал бы чужие строки как свои.
     */
    protected changeState(state: string): void {
        this.#apply({ state, page: 1 });
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
        void this.#router.navigate([{ outlets: { ro: [...this.#section(), id] } }], {
            relativeTo: this.#route.parent,
            queryParamsHandling: 'preserve',
        });
    }

    /**
     * Сегменты адреса, которыми открыт сам экран.
     *
     * С них начинается адрес всякой панели раздела: аутлет `ro` один на всю админку, и без
     * раздела впереди панели трёх разделов делили бы один адрес.
     */
    #section(): string[] {
        return this.#route.snapshot.url.map((segment: UrlSegment): string => segment.path);
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
