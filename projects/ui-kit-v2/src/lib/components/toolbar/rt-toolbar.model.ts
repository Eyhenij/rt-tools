import { Signal, TemplateRef } from '@angular/core';

export namespace IRtToolbar {
    /** Где нарисован слот отборов: в полосе широкого экрана или в панели узкого. */
    export type TFiltersPlace = 'bar' | 'panel';

    /** Контекст шаблона `rtToolbarFilters`: полю в панели нужна подпись над ним, полю в полосе — нет. */
    export interface IFiltersContext {
        $implicit: TFiltersPlace;
    }

    /**
     * Кто открывает панель отборов по кнопке узкого места: `kit` — сама полоса службой боковых
     * панелей, `app` — приложение своим маршрутом по выходу `filtersOpen`.
     */
    export type TFiltersPanel = 'kit' | 'app';

    /** Данные панели отборов: шаблон слота и два нажатия подвала. */
    export interface IFiltersPanelData {
        template: TemplateRef<IFiltersContext>;
        reset: () => void;
        apply: () => void;
    }

    /**
     * Отборы полосы, отданные панели приложения: шаблон, признак «отборы за кнопкой», два нажатия
     * подвала, которые доходят до выходов `filtersReset` и `filtersApply` полосы, и возврат фокуса в
     * поле полосы — панель зовёт его, когда закрылась на широком месте с фокусом внутри.
     */
    export interface IFiltersSource extends IFiltersPanelData {
        collapsed: Signal<boolean>;
        focusBar: () => void;
    }
}
