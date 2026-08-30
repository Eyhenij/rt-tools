import { IRtTable } from './rt-table.model';

/** Имя внутренней «…»-колонки действий, добавляемой при `[showRowActions]`. */
export const RT_TABLE_ROW_ACTIONS_COLUMN: string = 'rtRowActions';

/**
 * Колонки конфига без применённых настроек пользователя — источник для кнопки
 * «Сбросить» в панели. Закрытая колонка видима всегда: скрыть её панель не даёт.
 */
export function defaultColumnItems(config: ReadonlyArray<IRtTable.ColumnConfig>): ReadonlyArray<IRtTable.ColumnSettingItem> {
    return config.map((column: IRtTable.ColumnConfig): IRtTable.ColumnSettingItem => ({
        ...column,
        hidden: column.locked === true ? false : column.hidden === true,
    }));
}

/**
 * Разрешённые колонки настраиваемой таблицы: конфиг в применённом порядке с текущим
 * признаком скрытия.
 *
 * Порядок берётся из сохранённых настроек, а колонки, появившиеся в конфиге после
 * сохранения, встают в конец: настройки, снятые с прежнего состава, иначе прятали бы
 * новую колонку молча. Настроек нет — порядок и скрытие берутся из самого конфига.
 */
export function resolveColumns(
    config: ReadonlyArray<IRtTable.ColumnConfig>,
    settings: IRtTable.ColumnSettings | null
): ReadonlyArray<IRtTable.ColumnSettingItem> {
    if (config.length === 0) {
        return [];
    }

    const byKey: Map<string, IRtTable.ColumnConfig> = new Map(
        config.map((column: IRtTable.ColumnConfig): [string, IRtTable.ColumnConfig] => [column.key, column])
    );

    const orderedKeys: ReadonlyArray<string> = settings
        ? [
              ...settings.order.filter((key: string): boolean => byKey.has(key)),
              ...config
                  .filter((column: IRtTable.ColumnConfig): boolean => !settings.order.includes(column.key))
                  .map((column: IRtTable.ColumnConfig): string => column.key),
          ]
        : config.map((column: IRtTable.ColumnConfig): string => column.key);

    const hiddenKeys: ReadonlySet<string> = new Set(
        settings
            ? settings.hidden
            : config
                  .filter((column: IRtTable.ColumnConfig): boolean => column.hidden === true)
                  .map((column: IRtTable.ColumnConfig): string => column.key)
    );

    return orderedKeys
        .map((key: string): IRtTable.ColumnConfig | undefined => byKey.get(key))
        .filter((column: IRtTable.ColumnConfig | undefined): column is IRtTable.ColumnConfig => column !== undefined)
        .map((column: IRtTable.ColumnConfig): IRtTable.ColumnSettingItem => ({
            ...column,
            hidden: column.locked === true ? false : hiddenKeys.has(column.key),
        }));
}

/**
 * Имена колонок для строк CDK: у настраиваемой таблицы — видимые в применённом порядке,
 * у остальных — то, что назвал вход `[columns]`. Колонка действий встаёт последней, когда
 * действия строки включены.
 */
export function displayedColumnKeys(
    resolved: ReadonlyArray<IRtTable.ColumnSettingItem>,
    legacyColumns: ReadonlyArray<string>,
    configurable: boolean,
    showRowActions: boolean
): ReadonlyArray<string> {
    const base: ReadonlyArray<string> = configurable
        ? resolved
              .filter((column: IRtTable.ColumnSettingItem): boolean => !column.hidden)
              .map((column: IRtTable.ColumnSettingItem): string => column.key)
        : [...legacyColumns];

    return showRowActions ? [...base, RT_TABLE_ROW_ACTIONS_COLUMN] : [...base];
}

/**
 * Настройки панели, приведённые к конфигу: ключи закрытых колонок из списка скрытых
 * вычищаются. Панель их не предлагает, но настройки приезжают и из хранилища — снятые с
 * той поры, когда колонка закрытой ещё не была.
 */
export function withoutLockedHidden(
    config: ReadonlyArray<IRtTable.ColumnConfig>,
    settings: IRtTable.ColumnSettings
): IRtTable.ColumnSettings {
    const lockedKeys: ReadonlySet<string> = new Set(
        config
            .filter((column: IRtTable.ColumnConfig): boolean => column.locked === true)
            .map((column: IRtTable.ColumnConfig): string => column.key)
    );

    return {
        order: [...settings.order],
        hidden: settings.hidden.filter((key: string): boolean => !lockedKeys.has(key)),
    };
}
