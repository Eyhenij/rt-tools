import {
    computed,
    EnvironmentProviders,
    inject,
    Injectable,
    InjectionToken,
    makeEnvironmentProviders,
    Signal,
    signal,
    WritableSignal,
} from '@angular/core';

import { LOCAL_STORAGE } from '@rt-tools/core';
import { ISideMenu } from '../side-menu.types';
import { moveFavorite, normalizeFavorites, parseSettings, SIDE_MENU_SETTINGS_KEY } from './favorites.logic';

/** Подписи избранного. У первого кита нет словаря, и приложение на другом языке называет их само. */
export interface IRtuiSideMenuFavoritesLabels {
    readonly title: string;
    readonly add: string;
    readonly remove: string;
    readonly drag: string;
}

export interface IRtuiSideMenuFavoritesConfig {
    /** Ключ записи в хранилище; два приложения на одном адресе держат свои настройки двумя ключами. */
    readonly storageKey?: string;
    readonly labels?: Partial<IRtuiSideMenuFavoritesLabels>;
}

const DEFAULT_LABELS: IRtuiSideMenuFavoritesLabels = {
    title: 'Favourites',
    add: 'Add to favourites',
    remove: 'Remove from favourites',
    drag: 'Hold button to drag',
};

export const RTUI_SIDE_MENU_FAVORITES_CONFIG: InjectionToken<IRtuiSideMenuFavoritesConfig> =
    new InjectionToken<IRtuiSideMenuFavoritesConfig>('RTUI_SIDE_MENU_FAVORITES_CONFIG');

/**
 * Избранное боковых меню приложения.
 *
 * В хранилище под одним ключом лежит объект: у каждого меню — свои настройки под его номером, в них
 * список избранного. Номер меню задаёт приложение входом `menuId` меню; меню без номера — `default`.
 * Приложение читает и пишет список любого меню по его номеру и видит, какие номера уже хранятся.
 *
 * Держатель один: меню и приложение читают и пишут через этот же сервис, второй держатель того же
 * ключа разошёлся бы с первым на первой правке. Поэтому сервис ставится только провайдером
 * окружения — `provideRtuiSideMenuFavorites()`, — а меню берёт его необязательно: не поставлен —
 * звёзд нет.
 *
 * Хранилище берётся токеном `@rt-tools/core`. Без него — и вне браузера — настройки живут в памяти.
 * Ни чтение, ни запись не бросают: закрытое или полное хранилище не должно ронять меню.
 */
@Injectable()
export class RtuiSideMenuFavoritesService {
    readonly #config: IRtuiSideMenuFavoritesConfig = inject(RTUI_SIDE_MENU_FAVORITES_CONFIG, { optional: true }) ?? {};
    readonly #storage: Storage | null = inject(LOCAL_STORAGE, { optional: true }) ?? null;
    readonly #key: string = this.#config.storageKey?.trim() || SIDE_MENU_SETTINGS_KEY;
    readonly #settings: WritableSignal<Readonly<Record<string, ISideMenu.Settings>>> = signal(this.#read());
    readonly #lists: Map<string, Signal<ReadonlyArray<ISideMenu.FavoriteId>>> = new Map();

    /** Номера меню, чьи настройки лежат в хранилище. */
    public readonly menuIds: Signal<string[]> = computed((): string[] => Object.keys(this.#settings()));
    public readonly labels: IRtuiSideMenuFavoritesLabels = { ...DEFAULT_LABELS, ...this.#definedLabels() };

    /** Список избранного одного меню. Сигнал на номер один: повторный вызов отдаёт тот же. */
    public ids(menuId: string): Signal<ReadonlyArray<ISideMenu.FavoriteId>> {
        let list: Signal<ReadonlyArray<ISideMenu.FavoriteId>> | undefined = this.#lists.get(menuId);

        if (!list) {
            list = computed((): ReadonlyArray<ISideMenu.FavoriteId> => this.#settings()[menuId]?.favorites ?? []);
            this.#lists.set(menuId, list);
        }

        return list;
    }

    public has(menuId: string, id: ISideMenu.FavoriteId): boolean {
        return this.ids(menuId)().includes(id);
    }

    /** Номер, уже стоящий в списке, остаётся на своём месте. */
    public add(menuId: string, id: ISideMenu.FavoriteId): void {
        if (!this.has(menuId, id)) {
            this.#write(menuId, [...this.ids(menuId)(), id]);
        }
    }

    public remove(menuId: string, id: ISideMenu.FavoriteId): void {
        if (this.has(menuId, id)) {
            this.#write(
                menuId,
                this.ids(menuId)().filter((kept: ISideMenu.FavoriteId): boolean => kept !== id)
            );
        }
    }

    public toggle(menuId: string, id: ISideMenu.FavoriteId): void {
        if (this.has(menuId, id)) {
            this.remove(menuId, id);
        } else {
            this.add(menuId, id);
        }
    }

    /** Перенос по местам списка, не блока: место вне списка у источника ничего не меняет. */
    public move(menuId: string, from: number, to: number): void {
        this.#write(menuId, moveFavorite(this.ids(menuId)(), from, to));
    }

    /** Замена списка целиком — чужие значения и повторы отбрасываются так же, как при чтении. */
    public set(menuId: string, ids: ReadonlyArray<ISideMenu.FavoriteId>): void {
        this.#write(menuId, normalizeFavorites(ids));
    }

    public clear(menuId: string): void {
        this.#write(menuId, []);
    }

    #read(): Record<string, ISideMenu.Settings> {
        try {
            return parseSettings(this.#storage?.getItem(this.#key) ?? null);
        } catch {
            return {};
        }
    }

    /** Пишется весь объект: настройки остальных меню уходят в хранилище такими, какими были. */
    #write(menuId: string, ids: ReadonlyArray<ISideMenu.FavoriteId>): void {
        const settings: Readonly<Record<string, ISideMenu.Settings>> = {
            ...this.#settings(),
            [menuId]: { ...this.#settings()[menuId], favorites: [...ids] },
        };

        this.#settings.set(settings);

        try {
            this.#storage?.setItem(this.#key, JSON.stringify(settings));
        } catch {
            // хранилище закрыто или полно — настройки живут в памяти до перезагрузки
        }
    }

    /** Пустая подпись равна отсутствию: иначе звезда осталась бы без имени. */
    #definedLabels(): Partial<IRtuiSideMenuFavoritesLabels> {
        return Object.fromEntries(
            Object.entries(this.#config.labels ?? {}).filter(([, value]: [string, string | undefined]): boolean => Boolean(value?.trim()))
        );
    }
}

/**
 * Включение избранного: сервис и его настройки в инжектор окружения приложения.
 *
 * ```ts
 * bootstrapApplication(App, { providers: [provideRtStorage(), provideRtuiSideMenuFavorites({ storageKey: 'my-app-side-menu' })] });
 * ```
 */
export function provideRtuiSideMenuFavorites(config: IRtuiSideMenuFavoritesConfig = {}): EnvironmentProviders {
    return makeEnvironmentProviders([{ provide: RTUI_SIDE_MENU_FAVORITES_CONFIG, useValue: config }, RtuiSideMenuFavoritesService]);
}
