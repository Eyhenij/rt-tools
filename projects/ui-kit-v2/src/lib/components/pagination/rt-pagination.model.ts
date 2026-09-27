export namespace IRtPagination {
    /** Элемент полосы страниц: номер или разрыв «…». */
    export type PageItem = number | 'gap';

    /**
     * Счёт номеров: `neighbours` — первая, последняя и соседи открытой, при одной странице полосы
     * номеров нет; `seven` — семь мест первого кита, и одна страница рисуется номером со стрелками.
     */
    export type Numbering = 'neighbours' | 'seven';
}
