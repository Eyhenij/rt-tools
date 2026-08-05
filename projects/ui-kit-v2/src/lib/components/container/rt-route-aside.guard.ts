import { CanDeactivateFn } from '@angular/router';

import { Observable, of } from 'rxjs';

/** Панель, которая умеет ответить на вопрос «можно ли уступить место». */
export interface IRtAsideDeactivate {
    canDeactivate(): Observable<boolean>;
}

/**
 * Панель с несохранёнными правками спрашивает о них и при смене маршрута, а не
 * только при закрытии: аутлет `ro` занимает соседняя панель, и правки пропали бы
 * молча.
 *
 * Ставится на каждый ro-маршрут: гард висит на кнопках, нажатии мимо и Esc, а
 * смену маршрута ловит только роутер.
 *
 * Панели может не быть: роутер зовёт гард и для маршрута, чей компонент не создан.
 * Спрашивать тогда не о чем — уступить место можно. Без этой проверки первая же
 * такая навигация падает, а следом отказывает любая другая: маршрут остаётся
 * активным, и приложение застревает на адресе панели.
 */
export const rtAsideUnsavedGuard: CanDeactivateFn<IRtAsideDeactivate | null> = (
    component: IRtAsideDeactivate | null
): Observable<boolean> => component?.canDeactivate() ?? of(true);
