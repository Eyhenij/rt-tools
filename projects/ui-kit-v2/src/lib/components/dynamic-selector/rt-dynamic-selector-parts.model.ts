import { Signal, TemplateRef } from '@angular/core';

import { IRtIcon, IRtInput, TRtRadius } from '@rt-tools/ui-kit-v2/core';
import { IRtDynamicSelector } from './rt-dynamic-selector.model';

/**
 * Что части семьи динамических селекторов берут у корня. Отдельно от модели селектора: модель
 * читают настройки кита в ядре, а эти типы сами читают ядро.
 */
export namespace IRtDynamicSelectorParts {
    /** Настройки окна выбора — входы корня под теми же именами. */
    export interface PopupSettings<T> {
        readonly keyExp: Signal<keyof T & string>;
        readonly displayExp: Signal<keyof T & string>;
        readonly displayWith: Signal<((entity: T) => string) | null>;
        readonly mode: Signal<IRtDynamicSelector.Mode>;
        readonly multiToggleShown: Signal<boolean>;
        readonly selectAllShown: Signal<boolean>;
        readonly localSearch: Signal<boolean>;
        readonly lazyLoad: Signal<boolean>;
        readonly loading: Signal<boolean>;
        readonly fetching: Signal<boolean>;
        readonly pinnedKeys: Signal<ReadonlyArray<unknown>>;
        readonly navigateTitle: Signal<string>;
        readonly navigateLink: Signal<string>;
        readonly searchTerm: Signal<string>;
        readonly searchAppearance: Signal<IRtInput.Appearance>;
        readonly searchRadius: Signal<TRtRadius | null>;
        readonly emptyResultsText: Signal<string>;
        readonly applyLabel: Signal<string>;
        readonly applyLabelCase: Signal<IRtDynamicSelector.LabelCase>;
        readonly autofocusSearch: Signal<boolean>;
        readonly titleWrap: Signal<boolean>;
        readonly highlightSearch: Signal<boolean>;
    }

    /** Что окно выбора берёт у корня: записи, настройки и куда сообщать о действиях человека. */
    export interface PopupSource<T> {
        readonly settings: PopupSettings<T>;
        /** Предлагаемые записи: ещё не выбранные, отсортированные корнем. */
        readonly entities: Signal<ReadonlyArray<T>>;
        /** Применённые ключи в порядке отметок. */
        readonly apply: (keys: unknown[]) => void;
        readonly cancel: () => void;
        /** Запрос для поиска на сервере: через паузу после последней клавиши. */
        readonly search: (query: string) => void;
        readonly loadMore: () => void;
        /** Отмеченные записи, ещё не применённые. */
        readonly temporaryChoice: (entities: T[]) => void;
    }

    /** Что список выбранного берёт у корня: строки, настройки и куда сообщать о действиях человека. */
    export interface ListSource<T> {
        readonly rows: Signal<ReadonlyArray<IRtDynamicSelector.ListRow<T>>>;
        readonly draggable: Signal<boolean>;
        readonly editable: Signal<boolean>;
        readonly disabled: Signal<boolean>;
        /** Полоса под строками; приглашение корня встаёт на её место. */
        readonly actionsShown: Signal<boolean>;
        /** Сброс и очистка в полосе; без них в полосе остаётся кнопка добавления. */
        readonly resetClearShown: Signal<boolean>;
        readonly removeShown: Signal<boolean>;
        readonly resetDisabled: Signal<boolean>;
        readonly clearDisabled: Signal<boolean>;
        readonly buttonRadius: Signal<TRtRadius | null>;
        readonly clearIcon: Signal<IRtIcon.Name>;
        readonly titleWrap: Signal<boolean>;
        readonly titleTpl: Signal<TemplateRef<IRtDynamicSelector.RowContext<T>> | null>;
        readonly controlsTpl: Signal<TemplateRef<IRtDynamicSelector.RowContext<T>> | null>;
        readonly remove: (key: unknown) => void;
        readonly move: (move: IRtDynamicSelector.Move) => void;
        readonly edit: (edit: IRtDynamicSelector.TextEdit) => void;
        readonly reset: () => void;
        readonly clear: () => void;
    }
}
