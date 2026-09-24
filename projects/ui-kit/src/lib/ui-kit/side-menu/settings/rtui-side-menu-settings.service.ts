import {
    computed,
    DestroyRef,
    EnvironmentProviders,
    inject,
    Injectable,
    InjectionToken,
    makeEnvironmentProviders,
    Signal,
    signal,
    WritableSignal,
} from '@angular/core';

import { LOCAL_STORAGE, PlatformService, WINDOW } from '@rt-tools/core';
import { ISideMenu } from '../side-menu.types';
import { clampSubMenuWidth } from '../side-menu.logic';
import { moveFavorite, moveVisibleFavorite, normalizeFavorites } from '../favorites/favorites.logic';
import {
    normalizeMenuId,
    normalizeSettings,
    omitSettings,
    parseSettingsRecord,
    patchSettings,
    readSettings,
    SIDE_MENU_SETTINGS_KEY,
    TSideMenuSettingsRecord,
} from './side-menu-settings.logic';

/** Подписи избранного. У первого кита нет словаря, и приложение на другом языке называет их само. */
export interface IRtuiSideMenuFavoritesLabels {
    readonly title: string;
    readonly add: string;
    readonly remove: string;
    readonly drag: string;
    /** Имя заголовка блока, пока блок свёрнут: следующее нажатие его развернёт. */
    readonly expand: string;
    /** Имя заголовка блока, пока блок развёрнут. */
    readonly collapse: string;
}

/** Значок кнопки избранного: глиф набора Material Symbols и поворот. */
export interface IRtuiSideMenuFavoritesIcon {
    readonly glyph: string;
    /** Градусы по часовой стрелке; не задан — ноль. */
    readonly rotate?: number;
}

export interface IRtuiSideMenuFavoritesIcons {
    readonly remove: IRtuiSideMenuFavoritesIcon;
    readonly drag: IRtuiSideMenuFavoritesIcon;
}

export interface IRtuiSideMenuSettingsConfig {
    /** Ключ записи в хранилище; два приложения на одном адресе держат свои настройки двумя ключами. */
    readonly storageKey?: string;
    readonly labels?: Partial<IRtuiSideMenuFavoritesLabels>;
    readonly icons?: Partial<IRtuiSideMenuFavoritesIcons>;
}

const DEFAULT_LABELS: IRtuiSideMenuFavoritesLabels = {
    title: 'Favourites',
    add: 'Add to favourites',
    remove: 'Remove from favourites',
    drag: 'Hold button to drag',
    expand: 'Expand favourites',
    collapse: 'Collapse favourites',
};

const DEFAULT_ICONS: IRtuiSideMenuFavoritesIcons = {
    remove: { glyph: 'delete', rotate: 0 },
    drag: { glyph: 'arrows_outward', rotate: 90 },
};

export const RTUI_SIDE_MENU_SETTINGS_CONFIG: InjectionToken<IRtuiSideMenuSettingsConfig> = new InjectionToken<IRtuiSideMenuSettingsConfig>(
    'RTUI_SIDE_MENU_SETTINGS_CONFIG'
);

/** Один сигнал на номер меню: меню и приложение читают одно и то же, не плодя вычислений. */
function cached<T>(cache: Map<string, Signal<T>>, menuId: string, read: (menuId: string) => T): Signal<T> {
    const id: string = normalizeMenuId(menuId);
    let value: Signal<T> | undefined = cache.get(id);

    if (!value) {
        value = computed((): T => read(id));
        cache.set(id, value);
    }

    return value;
}

/**
 * Настройки боковых меню приложения: избранное, мода подменю и его ширина.
 *
 * В хранилище под одним ключом лежит объект: у каждого меню — свои настройки под его номером.
 * Номер задаёт приложение входом `menuId` меню — например, номером пользователя, — меню без номера
 * или с пустым номером хранится под `default`. Приложение читает и пишет настройки любого меню по
 * его номеру.
 *
 * Запись начинается с чтения хранилища, а не копии в памяти: другая вкладка или другой код могли
 * записать своё после того, как сервис прочитал ключ, и запись из копии затёрла бы их. Правится одно
 * поле одного меню, остальное уходит как лежало. Изменения из других вкладок приходят событием
 * `storage` и обновляют сигналы. Кит сам ничего не удаляет: настройки меню уходят только по вызову
 * приложения.
 *
 * Держатель один: меню и приложение читают и пишут через этот же сервис. Поэтому сервис ставится
 * провайдером окружения — `provideRtuiSideMenuSettings()`, — а меню берёт его необязательно: не
 * поставлен — меню ничего не хранит, звёзд нет, мода и ширина приходят входами.
 *
 * Хранилище берётся токеном `@rt-tools/core`. Без него, вне браузера, закрытое или полное —
 * настройки живут в памяти, и ни чтение, ни запись не бросают.
 */
@Injectable()
export class RtuiSideMenuSettingsService {
    readonly #config: IRtuiSideMenuSettingsConfig = inject(RTUI_SIDE_MENU_SETTINGS_CONFIG, { optional: true }) ?? {};
    readonly #storage: Storage | null = inject(LOCAL_STORAGE, { optional: true }) ?? null;
    readonly #key: string = this.#config.storageKey?.trim() || SIDE_MENU_SETTINGS_KEY;
    readonly #menus: Map<string, Signal<ISideMenu.Settings>> = new Map();
    readonly #favorites: Map<string, Signal<ReadonlyArray<ISideMenu.FavoriteId>>> = new Map();
    readonly #modes: Map<string, Signal<ISideMenu.SubMenuMode>> = new Map();
    readonly #widths: Map<string, Signal<number | null>> = new Map();
    readonly #collapsed: Map<string, Signal<ReadonlyArray<ISideMenu.Item['id']>>> = new Map();
    /** Последняя известная запись: ею сервис живёт, пока хранилище недоступно. */
    #record: TSideMenuSettingsRecord = this.#load() ?? {};
    /** Последняя запись в хранилище не удалась — оно полно, и правда лежит в памяти. */
    #unsaved: boolean = false;
    readonly #settings: WritableSignal<Readonly<Record<string, ISideMenu.Settings>>> = signal(readSettings(this.#record));

    /** Номера меню, чьи настройки лежат в хранилище. */
    public readonly menuIds: Signal<string[]> = computed((): string[] => Object.keys(this.#settings()));
    public readonly labels: IRtuiSideMenuFavoritesLabels = { ...DEFAULT_LABELS, ...this.#definedLabels() };
    /** Заданный приложением значок заменяет свой целиком, незаданный остаётся по умолчанию. */
    public readonly icons: IRtuiSideMenuFavoritesIcons = {
        remove: this.#icon(this.#config.icons?.remove, DEFAULT_ICONS.remove),
        drag: this.#icon(this.#config.icons?.drag, DEFAULT_ICONS.drag),
    };

    constructor() {
        if (!inject(PlatformService).isPlatformBrowser) {
            return;
        }

        const view: Window = inject(WINDOW);
        const onStorage: (event: StorageEvent) => void = (event: StorageEvent): void => {
            if (event.key === this.#key || event.key === null) {
                this.#unsaved = false;
                this.#apply(this.#fresh());
            }
        };

        view.addEventListener('storage', onStorage);
        inject(DestroyRef).onDestroy((): void => view.removeEventListener('storage', onStorage));
    }

    /** Настройки одного меню целиком, с незнакомыми полями; не сохранены — пустой объект. */
    public settings(menuId: string): Signal<ISideMenu.Settings> {
        return cached(this.#menus, menuId, (id: string): ISideMenu.Settings => this.#settings()[id] ?? {});
    }

    /** Список избранного одного меню. Сигнал на номер один: повторный вызов отдаёт тот же. */
    public ids(menuId: string): Signal<ReadonlyArray<ISideMenu.FavoriteId>> {
        return cached(this.#favorites, menuId, (id: string): ReadonlyArray<ISideMenu.FavoriteId> => this.#settings()[id]?.favorites ?? []);
    }

    /** Мода подменю, которую выбрал человек; ничего не выбрано — открытие наведением. */
    public subMenuMode(menuId: string): Signal<ISideMenu.SubMenuMode> {
        return cached(this.#modes, menuId, (id: string): ISideMenu.SubMenuMode => this.#settings()[id]?.subMenuMode ?? 'hover');
    }

    /** Ширина закреплённого подменю; ничего не выбрано — пусто, и ширину ставит оформление. */
    public subMenuWidth(menuId: string): Signal<number | null> {
        return cached(this.#widths, menuId, (id: string): number | null => this.#settings()[id]?.subMenuWidth ?? null);
    }

    /** Пункты полосы, чей блок избранного свёрнут; ничего не свёрнуто — пустой список. */
    public favoritesCollapsed(menuId: string): Signal<ReadonlyArray<ISideMenu.Item['id']>> {
        return cached(
            this.#collapsed,
            menuId,
            (id: string): ReadonlyArray<ISideMenu.Item['id']> => this.#settings()[id]?.favoritesCollapsed ?? []
        );
    }

    /** Сворачивает или разворачивает блок одного раздела; остальные разделы остаются как были. */
    public setFavoritesCollapsed(menuId: string, sectionId: ISideMenu.Item['id'], collapsed: boolean): void {
        this.#update(menuId, (current: ISideMenu.Settings): Partial<ISideMenu.Settings> => {
            const others: Array<ISideMenu.Item['id']> = (current.favoritesCollapsed ?? []).filter(
                (id: ISideMenu.Item['id']): boolean => id !== sectionId
            );

            return { favoritesCollapsed: collapsed ? [...others, sectionId] : others };
        });
    }

    public setSubMenuMode(menuId: string, mode: ISideMenu.SubMenuMode): void {
        this.#update(menuId, (): Partial<ISideMenu.Settings> => ({ subMenuMode: mode }));
    }

    /** Пишется приведённая к пределам: за них уводит и рука, и чужая правка записи. */
    public setSubMenuWidth(menuId: string, width: number): void {
        this.#update(menuId, (): Partial<ISideMenu.Settings> => ({ subMenuWidth: clampSubMenuWidth(width) }));
    }

    public has(menuId: string, id: ISideMenu.FavoriteId): boolean {
        return this.ids(menuId)().includes(id);
    }

    /** Номер, уже стоящий в списке, остаётся на своём месте. */
    public add(menuId: string, id: ISideMenu.FavoriteId): void {
        this.#updateFavorites(menuId, (ids: ISideMenu.FavoriteId[]): ISideMenu.FavoriteId[] => (ids.includes(id) ? ids : [...ids, id]));
    }

    public remove(menuId: string, id: ISideMenu.FavoriteId): void {
        this.#updateFavorites(menuId, (ids: ISideMenu.FavoriteId[]): ISideMenu.FavoriteId[] =>
            ids.filter((kept: ISideMenu.FavoriteId): boolean => kept !== id)
        );
    }

    /** Решает по записи хранилища, а не по копии: другая вкладка могла уже поменять список. */
    public toggle(menuId: string, id: ISideMenu.FavoriteId): void {
        this.#updateFavorites(menuId, (ids: ISideMenu.FavoriteId[]): ISideMenu.FavoriteId[] =>
            ids.includes(id) ? ids.filter((kept: ISideMenu.FavoriteId): boolean => kept !== id) : [...ids, id]
        );
    }

    /** Перенос по местам списка, не блока: место вне списка у источника ничего не меняет. */
    public move(menuId: string, from: number, to: number): void {
        this.#updateFavorites(menuId, (ids: ISideMenu.FavoriteId[]): ISideMenu.FavoriteId[] => moveFavorite(ids, from, to));
    }

    /**
     * Перенос по местам видимых номеров, как в блоке меню: видимые меняются местами между собой,
     * скрытые — пункт которых меню сейчас не показывает — остаются на своих.
     */
    public moveVisible(menuId: string, visibleIds: ReadonlyArray<ISideMenu.FavoriteId>, from: number, to: number): void {
        this.#updateFavorites(menuId, (ids: ISideMenu.FavoriteId[]): ISideMenu.FavoriteId[] =>
            moveVisibleFavorite(ids, visibleIds, from, to)
        );
    }

    /** Замена списка целиком — чужие значения и повторы отбрасываются так же, как при чтении. */
    public set(menuId: string, ids: ReadonlyArray<ISideMenu.FavoriteId>): void {
        this.#updateFavorites(menuId, (): ISideMenu.FavoriteId[] => normalizeFavorites(ids));
    }

    public clear(menuId: string): void {
        this.#updateFavorites(menuId, (): ISideMenu.FavoriteId[] => []);
    }

    /** Удаление всех настроек одного меню. Сам кит его не вызывает: удаляет только приложение. */
    public deleteSettings(menuId: string): void {
        this.#commit(omitSettings(this.#fresh(), normalizeMenuId(menuId)));
    }

    #updateFavorites(menuId: string, next: (ids: ISideMenu.FavoriteId[]) => ISideMenu.FavoriteId[]): void {
        this.#update(menuId, (current: ISideMenu.Settings): Partial<ISideMenu.Settings> => ({ favorites: next(current.favorites ?? []) }));
    }

    /** Прочитать хранилище → поправить поля одного меню → записать. */
    #update(menuId: string, patch: (current: ISideMenu.Settings) => Partial<ISideMenu.Settings>): void {
        const record: TSideMenuSettingsRecord = this.#fresh();
        const id: string = normalizeMenuId(menuId);

        this.#commit(patchSettings(record, id, patch(normalizeSettings(record[id]))));
    }

    #commit(record: TSideMenuSettingsRecord): void {
        this.#apply(record);

        try {
            this.#storage?.setItem(this.#key, JSON.stringify(record));
            this.#unsaved = false;
        } catch {
            // хранилище закрыто или полно — настройки живут в памяти до перезагрузки
            this.#unsaved = true;
        }
    }

    #apply(record: TSideMenuSettingsRecord): void {
        this.#record = record;
        this.#settings.set(readSettings(record));
    }

    /** Запись из хранилища, а если оно недоступно или не приняло прошлую запись — последняя известная. */
    #fresh(): TSideMenuSettingsRecord {
        return this.#unsaved ? this.#record : (this.#load() ?? this.#record);
    }

    /** Пусто — хранилища нет или оно не отвечает. Сломанная запись читается пустой, но читается. */
    #load(): TSideMenuSettingsRecord | null {
        if (!this.#storage) {
            return null;
        }

        try {
            return parseSettingsRecord(this.#storage.getItem(this.#key));
        } catch {
            return null;
        }
    }

    /** Пустая подпись равна отсутствию: иначе звезда осталась бы без имени. */
    #definedLabels(): Partial<IRtuiSideMenuFavoritesLabels> {
        return Object.fromEntries(
            Object.entries(this.#config.labels ?? {}).filter(([, value]: [string, string | undefined]): boolean => Boolean(value?.trim()))
        );
    }

    /** Пустой глиф равен отсутствию, как пустая подпись: иначе кнопка осталась бы без значка. */
    #icon(icon: IRtuiSideMenuFavoritesIcon | undefined, fallback: IRtuiSideMenuFavoritesIcon): IRtuiSideMenuFavoritesIcon {
        const glyph: string = icon?.glyph?.trim() ?? '';
        if (!glyph) {
            return fallback;
        }
        const rotate: number | undefined = icon?.rotate;

        return { glyph, rotate: rotate !== undefined && Number.isFinite(rotate) ? rotate : 0 };
    }
}

/**
 * Включение настроек меню: сервис и его настройки в инжектор окружения приложения.
 *
 * ```ts
 * bootstrapApplication(App, { providers: [provideRtStorage(), provideRtuiSideMenuSettings({ storageKey: 'my-app-side-menu' })] });
 * ```
 */
export function provideRtuiSideMenuSettings(config: IRtuiSideMenuSettingsConfig = {}): EnvironmentProviders {
    return makeEnvironmentProviders([{ provide: RTUI_SIDE_MENU_SETTINGS_CONFIG, useValue: config }, RtuiSideMenuSettingsService]);
}
