import {
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
import { FAVORITES_KEY, moveFavorite, normalizeFavorites, parseFavorites } from './favorites.logic';

/** Подписи избранного. У первого кита нет словаря, и приложение на другом языке называет их само. */
export interface IRtuiFavoritesLabels {
    readonly title: string;
    readonly add: string;
    readonly remove: string;
    readonly drag: string;
}

export interface IRtuiFavoritesConfig {
    /** Ключ записи в хранилище; два приложения на одном адресе держат два списка двумя ключами. */
    readonly storageKey?: string;
    readonly labels?: Partial<IRtuiFavoritesLabels>;
}

const DEFAULT_LABELS: IRtuiFavoritesLabels = {
    title: 'Favourites',
    add: 'Add to favourites',
    remove: 'Remove from favourites',
    drag: 'Hold button to drag',
};

export const RTUI_FAVORITES_CONFIG: InjectionToken<IRtuiFavoritesConfig> = new InjectionToken<IRtuiFavoritesConfig>(
    'RTUI_FAVORITES_CONFIG'
);

/**
 * Список избранного бокового меню.
 *
 * Держатель один: меню и приложение читают и пишут через этот же сервис, второй держатель того же
 * списка разошёлся бы с первым на первой правке. Поэтому сервис ставится только провайдером
 * окружения — `provideRtuiFavorites()`, — а меню берёт его необязательно: не поставлен — звёзд нет.
 *
 * Хранилище берётся токеном `@rt-tools/core`. Без него — и вне браузера — список живёт в памяти.
 * Ни чтение, ни запись не бросают: закрытое или полное хранилище не должно ронять меню.
 */
@Injectable()
export class RtuiFavoritesService {
    readonly #config: IRtuiFavoritesConfig = inject(RTUI_FAVORITES_CONFIG, { optional: true }) ?? {};
    readonly #storage: Storage | null = inject(LOCAL_STORAGE, { optional: true }) ?? null;
    readonly #key: string = this.#config.storageKey?.trim() || FAVORITES_KEY;
    readonly #ids: WritableSignal<ReadonlyArray<ISideMenu.FavoriteId>> = signal(this.#read());

    public readonly ids: Signal<ReadonlyArray<ISideMenu.FavoriteId>> = this.#ids.asReadonly();
    public readonly labels: IRtuiFavoritesLabels = { ...DEFAULT_LABELS, ...this.#definedLabels() };

    public has(id: ISideMenu.FavoriteId): boolean {
        return this.#ids().includes(id);
    }

    /** Номер, уже стоящий в списке, остаётся на своём месте. */
    public add(id: ISideMenu.FavoriteId): void {
        if (!this.has(id)) {
            this.#write([...this.#ids(), id]);
        }
    }

    public remove(id: ISideMenu.FavoriteId): void {
        if (this.has(id)) {
            this.#write(this.#ids().filter((kept: ISideMenu.FavoriteId): boolean => kept !== id));
        }
    }

    public toggle(id: ISideMenu.FavoriteId): void {
        if (this.has(id)) {
            this.remove(id);
        } else {
            this.add(id);
        }
    }

    /** Перенос по местам списка, не блока: место вне списка у источника ничего не меняет. */
    public move(from: number, to: number): void {
        this.#write(moveFavorite(this.#ids(), from, to));
    }

    /** Замена списка целиком — чужие значения и повторы отбрасываются так же, как при чтении. */
    public set(ids: ReadonlyArray<ISideMenu.FavoriteId>): void {
        this.#write(normalizeFavorites(ids));
    }

    public clear(): void {
        this.#write([]);
    }

    #read(): ISideMenu.FavoriteId[] {
        try {
            return parseFavorites(this.#storage?.getItem(this.#key) ?? null);
        } catch {
            return [];
        }
    }

    #write(ids: ReadonlyArray<ISideMenu.FavoriteId>): void {
        this.#ids.set(ids);

        try {
            this.#storage?.setItem(this.#key, JSON.stringify(ids));
        } catch {
            // хранилище закрыто или полно — список живёт в памяти до перезагрузки
        }
    }

    /** Пустая подпись равна отсутствию: иначе звезда осталась бы без имени. */
    #definedLabels(): Partial<IRtuiFavoritesLabels> {
        return Object.fromEntries(
            Object.entries(this.#config.labels ?? {}).filter(([, value]: [string, string | undefined]): boolean => Boolean(value?.trim()))
        );
    }
}

/**
 * Включение избранного: сервис и его настройки в инжектор окружения приложения.
 *
 * ```ts
 * bootstrapApplication(App, { providers: [provideRtStorage(), provideRtuiFavorites({ storageKey: 'my-app-favorites' })] });
 * ```
 */
export function provideRtuiFavorites(config: IRtuiFavoritesConfig = {}): EnvironmentProviders {
    return makeEnvironmentProviders([{ provide: RTUI_FAVORITES_CONFIG, useValue: config }, RtuiFavoritesService]);
}
