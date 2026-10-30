import { TemplateRef } from '@angular/core';

export namespace IRtToolbar {
    /** Где нарисован слот отборов: в полосе широкого экрана или в панели узкого. */
    export type TFiltersPlace = 'bar' | 'panel';

    /** Контекст шаблона `rtToolbarFilters`: полю в панели нужна подпись над ним, полю в полосе — нет. */
    export interface IFiltersContext {
        $implicit: TFiltersPlace;
    }

    /** Данные панели отборов: шаблон слота и два нажатия подвала. */
    export interface IFiltersPanelData {
        template: TemplateRef<IFiltersContext>;
        reset: () => void;
        apply: () => void;
    }
}
