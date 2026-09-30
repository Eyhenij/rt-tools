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

import { ERtStorageKeys } from '../../platform/storage-keys.enum';
import {
    normalizeSideMenuId,
    normalizeSideMenuSettings,
    omitSideMenuSettings,
    parseSideMenuSettingsRecord,
    patchSideMenuSettings,
    readSideMenuSettings,
    TRtSideMenuSettingsRecord,
} from './rt-side-menu-settings.logic';
import { clampSideMenuWidth } from './rt-side-menu.logic';
import { IRtSideMenu } from './rt-side-menu.model';

export interface IRtSideMenuSettingsConfig {
    /** Свой ключ хранилища, если приложению нужен не общий ключ кита. */
    readonly storageKey?: string;
}

export const RT_SIDE_MENU_SETTINGS_CONFIG: InjectionToken<IRtSideMenuSettingsConfig> = new InjectionToken<IRtSideMenuSettingsConfig>(
    'RT_SIDE_MENU_SETTINGS_CONFIG'
);

/** Сигнал на номер меню один: повторный вызов отдаёт тот же. */
function cached<T>(cache: Map<string, Signal<T>>, menuId: string, read: (menuId: string) => T): Signal<T> {
    const id: string = normalizeSideMenuId(menuId);
    let value: Signal<T> | undefined = cache.get(id);

    if (!value) {
        value = computed((): T => read(id));
        cache.set(id, value);
    }

    return value;
}

/**
 * Настройки боковых меню в хранилище браузера: режим и ширина подменю под номером каждого меню.
 *
 * Перед каждой записью ключ читается заново: соседняя вкладка или приложение могли записать своё,
 * и запись из копии затёрла бы их. Правится одно поле одного меню, остальное уходит как лежало.
 * Изменения из других вкладок приходят событием `storage` и обновляют сигналы.
 *
 * Хранилище берётся токеном `@rt-tools/core` напрямую, а не общим сервисом хранилища: сервису
 * нужно знать, что запись не удалась, и держать правду в памяти до перезагрузки. Без хранилища, вне
 * браузера, закрытое или полное — настройки живут в памяти, и ни чтение, ни запись не бросают.
 *
 * Сервис ставится провайдером окружения — `provideRtSideMenuSettings()`, — а меню берёт его
 * необязательно: не поставлен — меню ничего не хранит, режим и ширина приходят входами.
 */
@Injectable()
export class RtSideMenuSettingsService {
    readonly #config: IRtSideMenuSettingsConfig = inject(RT_SIDE_MENU_SETTINGS_CONFIG, { optional: true }) ?? {};
    readonly #storage: Storage | null = inject(LOCAL_STORAGE, { optional: true }) ?? null;
    readonly #key: string = this.#config.storageKey?.trim() || ERtStorageKeys.SideMenu;
    readonly #menus: Map<string, Signal<IRtSideMenu.Settings>> = new Map();
    readonly #modes: Map<string, Signal<IRtSideMenu.SubMenuMode>> = new Map();
    readonly #widths: Map<string, Signal<number | null>> = new Map();
    /** Последняя известная запись: ею сервис живёт, пока хранилище недоступно. */
    #record: TRtSideMenuSettingsRecord = this.#load() ?? {};
    /** Последняя запись в хранилище не удалась — оно полно, и правда лежит в памяти. */
    #unsaved: boolean = false;
    readonly #settings: WritableSignal<Readonly<Record<string, IRtSideMenu.Settings>>> = signal(readSideMenuSettings(this.#record));

    /** Номера меню, чьи настройки лежат в хранилище. */
    public readonly menuIds: Signal<string[]> = computed((): string[] => Object.keys(this.#settings()));

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
    public settings(menuId: string): Signal<IRtSideMenu.Settings> {
        return cached(this.#menus, menuId, (id: string): IRtSideMenu.Settings => this.#settings()[id] ?? {});
    }

    public subMenuMode(menuId: string): Signal<IRtSideMenu.SubMenuMode> {
        return cached(this.#modes, menuId, (id: string): IRtSideMenu.SubMenuMode => this.#settings()[id]?.subMenuMode ?? 'hover');
    }

    public subMenuWidth(menuId: string): Signal<number | null> {
        return cached(this.#widths, menuId, (id: string): number | null => this.#settings()[id]?.subMenuWidth ?? null);
    }

    public setSubMenuMode(menuId: string, mode: IRtSideMenu.SubMenuMode): void {
        this.#update(menuId, { subMenuMode: mode });
    }

    public setSubMenuWidth(menuId: string, width: number): void {
        this.#update(menuId, { subMenuWidth: clampSideMenuWidth(width) });
    }

    /** Настройки меню уходят только по вызову приложения: кит сам ничего не удаляет. */
    public deleteSettings(menuId: string): void {
        this.#commit(omitSideMenuSettings(this.#fresh(), normalizeSideMenuId(menuId)));
    }

    /** Прочитать хранилище → поправить поля одного меню → записать. */
    #update(menuId: string, patch: Partial<IRtSideMenu.Settings>): void {
        const record: TRtSideMenuSettingsRecord = this.#fresh();
        const id: string = normalizeSideMenuId(menuId);

        this.#commit(patchSideMenuSettings(record, id, { ...normalizeSideMenuSettings(record[id]), ...patch }));
    }

    #commit(record: TRtSideMenuSettingsRecord): void {
        this.#apply(record);

        try {
            this.#storage?.setItem(this.#key, JSON.stringify(record));
            this.#unsaved = false;
        } catch {
            // хранилище закрыто или полно — настройки живут в памяти до перезагрузки
            this.#unsaved = true;
        }
    }

    #apply(record: TRtSideMenuSettingsRecord): void {
        this.#record = record;
        this.#settings.set(readSideMenuSettings(record));
    }

    /** Запись из хранилища, а если оно недоступно или не приняло прошлую запись — последняя известная. */
    #fresh(): TRtSideMenuSettingsRecord {
        return this.#unsaved ? this.#record : (this.#load() ?? this.#record);
    }

    /** Пусто — хранилища нет или оно не отвечает. Сломанная запись читается пустой, но читается. */
    #load(): TRtSideMenuSettingsRecord | null {
        if (!this.#storage) {
            return null;
        }

        try {
            return parseSideMenuSettingsRecord(this.#storage.getItem(this.#key));
        } catch {
            return null;
        }
    }
}

/**
 * Сервис настроек бокового меню для приложения.
 *
 * ```ts
 * bootstrapApplication(App, { providers: [provideRtSideMenuSettings()] });
 * ```
 */
export function provideRtSideMenuSettings(config: IRtSideMenuSettingsConfig = {}): EnvironmentProviders {
    return makeEnvironmentProviders([{ provide: RT_SIDE_MENU_SETTINGS_CONFIG, useValue: config }, RtSideMenuSettingsService]);
}
