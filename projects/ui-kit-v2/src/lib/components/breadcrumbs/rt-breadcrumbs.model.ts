import { RouterLink } from '@angular/router';

export namespace IRtBreadcrumbs {
    /** Звено пути. Ссылка нужна предку; у текущего звена она не рисуется. */
    export interface Crumb {
        readonly label: string;
        readonly link?: NonNullable<RouterLink['routerLink']>;
    }

    /** Как рисуется текущее звено: в строке пути или заголовком страницы строкой ниже. */
    export type Look = 'inline' | 'heading';

    /** Предки, разложенные для показа: сколько стоит перед свёрткой, что в ней и что после. */
    export interface Fold {
        readonly head: readonly Crumb[];
        readonly hidden: readonly Crumb[];
        readonly tail: readonly Crumb[];
    }
}
