import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';

import { IRtTable } from './rt-table.model';

/**
 * Регистрация настраиваемой таблицы в реестре: её текущие/дефолтные колонки
 * (сигналы) + callback применения новых настроек (применяет к таблице и
 * персистит). Заполняется самой `rt-table`, читается route-асайдом настроек.
 */
export interface IRtTableSettingsRegistration {
    columns: Signal<ReadonlyArray<IRtTable.ColumnSettingItem>>;
    defaults: Signal<ReadonlyArray<IRtTable.ColumnSettingItem>>;
    apply: (settings: IRtTable.ColumnSettings) => void;
}

/**
 * Реестр настраиваемых таблиц — мост между `rt-table` (shared UI) и route-асайдом
 * настроек колонок, которые живут в разных ветках дерева и не видят друг друга
 * напрямую. `rt-table` регистрируется по `tableId` на init, снимается на destroy;
 * асайд читает регистрацию активной таблицы (`active()` выставляется при открытии).
 *
 * Реестр реактивный (`Map` живёт в сигнале): при F5 route-асайд инициализируется
 * раньше `rt-table`, и синхронный промах по пустому реестру не должен быть
 * финальным — асайд дожидается регистрации через `effect` (фикс F-16).
 */
@Injectable({ providedIn: 'root' })
export class RtTableSettingsRegistry {
    readonly #registrations: WritableSignal<ReadonlyMap<string, IRtTableSettingsRegistration>> = signal<
        ReadonlyMap<string, IRtTableSettingsRegistration>
    >(new Map<string, IRtTableSettingsRegistration>());

    readonly #active: WritableSignal<string | null> = signal<string | null>(null);

    /** Id таблицы, чьи настройки сейчас открыты в асайде (или `null`). */
    public readonly active: Signal<string | null> = this.#active.asReadonly();

    /**
     * Id единственной зарегистрированной таблицы (или `null`, если их 0 или >1).
     * Нужен асайду для восстановления `active` после F5: сервис пересоздан,
     * `setActive` никто не звал, но открытая страница регистрирует ровно
     * одну настраиваемую таблицу.
     */
    public readonly soleTableId: Signal<string | null> = computed((): string | null => {
        const registrations: ReadonlyMap<string, IRtTableSettingsRegistration> = this.#registrations();
        if (registrations.size !== 1) {
            return null;
        }
        const first: string | undefined = registrations.keys().next().value;
        return first ?? null;
    });

    public register(tableId: string, registration: IRtTableSettingsRegistration): void {
        this.#registrations.update(
            (current: ReadonlyMap<string, IRtTableSettingsRegistration>): ReadonlyMap<string, IRtTableSettingsRegistration> => {
                const next: Map<string, IRtTableSettingsRegistration> = new Map(current);
                next.set(tableId, registration);
                return next;
            }
        );
    }

    public unregister(tableId: string): void {
        this.#registrations.update(
            (current: ReadonlyMap<string, IRtTableSettingsRegistration>): ReadonlyMap<string, IRtTableSettingsRegistration> => {
                const next: Map<string, IRtTableSettingsRegistration> = new Map(current);
                next.delete(tableId);
                return next;
            }
        );
        if (this.#active() === tableId) {
            this.#active.set(null);
        }
    }

    /** Реактивная регистрация таблицы: `null`, пока таблица не зарегистрировалась. */
    public get(tableId: string): Signal<IRtTableSettingsRegistration | null> {
        return computed((): IRtTableSettingsRegistration | null => this.#registrations().get(tableId) ?? null);
    }

    public setActive(tableId: string): void {
        this.#active.set(tableId);
    }

    public clearActive(): void {
        this.#active.set(null);
    }
}
