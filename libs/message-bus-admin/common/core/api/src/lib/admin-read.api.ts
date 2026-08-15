import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { IAdminListQuery, IReadFault, readFaultOf } from '@rt/message-bus-admin/common/core/util';
import { IPage } from '@rt/message-bus-common';
import { catchError, Observable, throwError, timeout, TimeoutError } from 'rxjs';

/**
 * Обращение к операциям чтения груза: один вид запроса на все три раздела.
 *
 * Разделы отличаются адресом и формой строки, а не способом спросить, — поэтому предел ожидания,
 * куки и разбор отказа живут здесь, а не повторяются у каждого. Расходившись, они дали бы одному
 * разделу повтор по сроку, а другому — вечное ожидание.
 *
 * `withCredentials` стоит на каждом вызове: на своей машине админка поднимается своим портом, и
 * без него браузер не пошлёт куку приёмнику вовсе — чтение будет выглядеть невошедшим при живом
 * входе.
 */

/**
 * Сколько ждать ответа.
 *
 * Запрос, висящий без предела, выглядит так же, как работающая служба: человек ждёт вместо того,
 * чтобы повторить. Пятнадцать секунд — заметно больше самого медленного чтения страницы и
 * заметно меньше того, за что читающий успевает решить, что всё сломалось.
 */
export const READ_TIMEOUT_MS: number = 15_000;

/** Выборка в параметры запроса. Пустой отбор не посылается вовсе: приёмник читает его как «все». */
function askedParams(query: IAdminListQuery): HttpParams {
    let params: HttpParams = new HttpParams()
        .set('page', String(query.page))
        .set('size', String(query.size))
        .set('sort', query.sort)
        .set('dir', query.dir);

    if (query.tree !== '') {
        params = params.set('tree', query.tree);
    }

    return params;
}

/**
 * Отказ в род, понятный экрану.
 *
 * Вышедший срок ожидания приходит своим типом, а не ответом, и кода у него нет: он приводится к
 * нулю — тому же, каким каркас отвечает на обрыв связи. Для человека это одно и то же: служба
 * не ответила, и остаётся повторить.
 */
export function asReadFault(error: unknown): Observable<never> {
    if (error instanceof TimeoutError) {
        return throwError((): IReadFault => readFaultOf(0, null));
    }

    if (error instanceof HttpErrorResponse) {
        return throwError((): IReadFault => readFaultOf(error.status, error.error));
    }

    return throwError((): IReadFault => readFaultOf(0, null));
}

/** Страница списка. Форму строки называет тот, кто зовёт: она у каждого раздела своя. */
export function readPage<TRow>(http: HttpClient, path: string, query: IAdminListQuery): Observable<IPage<TRow>> {
    return http
        .get<IPage<TRow>>(path, { params: askedParams(query), withCredentials: true })
        .pipe(timeout(READ_TIMEOUT_MS), catchError(asReadFault));
}

/** Одна запись целиком — то, что показывает панель подробностей. */
export function readOne<TRow>(http: HttpClient, path: string, id: string): Observable<TRow> {
    return http
        .get<TRow>(`${path}/${encodeURIComponent(id)}`, { withCredentials: true })
        .pipe(timeout(READ_TIMEOUT_MS), catchError(asReadFault));
}
