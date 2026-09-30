import { computed, DestroyRef, inject, Signal, signal, WritableSignal } from '@angular/core';

import { EMPTY, filter, Observable } from 'rxjs';

import { IDBStorageService } from '@rt-tools/core';

import { defaultColumnItems, resolveColumns, withoutLockedHidden } from './rt-table-columns.logic';
import { RtTableSettingsPersistence } from './rt-table-settings.persistence';
import { RtTableSettingsRegistry, type IRtTableSettingsRegistration } from './rt-table-settings.registry';
import { IRtTable } from './rt-table.model';

/**
 * Настройка колонок одной таблицы: применённые настройки, объявление реестру, загрузка и запись.
 *
 * Лежит отдельно от компонента: это целое со своим состоянием, а компонент только отдаёт ему свои
 * входы и зовёт на старте и в конце жизни. Входы приезжают функциями, а не сигналами: поле с
 * этим классом заводится раньше, чем поля входов компонента, и читать их можно только позже.
 * Внедрение зовётся в конструкторе — класс заводится полем компонента, где оно доступно.
 * Подписку на сохранённые настройки держит компонент: подписка в методе здесь запрещена.
 */
export class RtTableColumnSettings {
    readonly #registry: RtTableSettingsRegistry = inject(RtTableSettingsRegistry);
    readonly #persistence: RtTableSettingsPersistence = new RtTableSettingsPersistence(
        inject<IDBStorageService<IRtTable.ColumnSettings>>(IDBStorageService),
        inject(DestroyRef)
    );

    readonly #config: () => ReadonlyArray<IRtTable.ColumnConfig>;
    readonly #tableId: () => string | null;

    /** Настройки колонок, применённые поверх конфига; `null` — умолчания конфига. */
    readonly #applied: WritableSignal<IRtTable.ColumnSettings | null> = signal<IRtTable.ColumnSettings | null>(null);

    /** Колонки конфига без настроек пользователя — с них панель начинает после сброса. */
    readonly #defaults: Signal<ReadonlyArray<IRtTable.ColumnSettingItem>> = computed((): ReadonlyArray<IRtTable.ColumnSettingItem> =>
        defaultColumnItems(this.#config())
    );

    /** Ключ записи настроек. `null` — таблица не настраиваемая: нет ключа или конфига. */
    readonly #persistableTableId: Signal<string | null> = computed((): string | null => {
        const id: string | null = this.#tableId();
        return id !== null && this.#config().length > 0 ? id : null;
    });

    /** Разрешённые колонки в применённом порядке, с текущим признаком скрытости. */
    public readonly resolved: Signal<ReadonlyArray<IRtTable.ColumnSettingItem>> = computed((): ReadonlyArray<IRtTable.ColumnSettingItem> =>
        resolveColumns(this.#config(), this.#applied())
    );

    /** Таблица настраиваемая: есть и конфиг колонок, и ключ таблицы. */
    public readonly canConfigure: Signal<boolean> = computed((): boolean => this.#config().length > 0 && this.#tableId() !== null);

    constructor(config: () => ReadonlyArray<IRtTable.ColumnConfig>, tableId: () => string | null) {
        this.#config = config;
        this.#tableId = tableId;
    }

    /** Объявить таблицу реестру: с этой минуты её настраивает панель. */
    public start(): void {
        this.#register();
    }

    /**
     * Сохранённые настройки таблицы. У ненастраиваемой таблицы и у таблицы без записи поток пуст:
     * применять нечего. Подписывается компонент — на старте своей жизни.
     */
    public saved(): Observable<IRtTable.ColumnSettings> {
        const persistedTableId: string | null = this.#persistableTableId();
        if (persistedTableId === null) {
            return EMPTY;
        }

        return this.#persistence
            .load(persistedTableId)
            .pipe(filter((settings: IRtTable.ColumnSettings | undefined): settings is IRtTable.ColumnSettings => settings !== undefined));
    }

    /** Снять таблицу с реестра в конце её жизни. */
    public stop(): void {
        const tableId: string | null = this.#tableId();
        if (tableId !== null) {
            this.#registry.unregister(tableId);
        }
    }

    /** Применить настройки: закреплённые колонки скрыть нельзя. */
    public apply(settings: IRtTable.ColumnSettings): void {
        this.#applied.set(withoutLockedHidden(this.#config(), settings));
    }

    /**
     * Объявляет таблицу реестру: её колонки, умолчания и приём применения настроек. Реестр —
     * мост к панели настроек, которую потребитель открывает переходом по адресу.
     */
    #register(): void {
        const tableId: string | null = this.#tableId();
        if (tableId === null || !this.canConfigure()) {
            return;
        }
        const registration: IRtTableSettingsRegistration = {
            columns: this.resolved,
            defaults: this.#defaults,
            apply: (settings: IRtTable.ColumnSettings): void => {
                this.apply(settings);
                this.#persist(settings);
            },
        };
        this.#registry.register(tableId, registration);
    }

    /** Сохраняет настройки колонок у настраиваемой таблицы; у прочих сохранять нечего. */
    #persist(settings: IRtTable.ColumnSettings): void {
        const tableId: string | null = this.#persistableTableId();
        if (tableId !== null) {
            this.#persistence.save(tableId, settings);
        }
    }
}
