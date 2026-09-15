import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IAdminSession, ISetupState, ISignInPair } from '@rt/message-bus-admin/auth/util';
import { asSpokenFault, READ_TIMEOUT_MS } from '@rt/message-bus-admin/common/core/api';
import { catchError, Observable, timeout } from 'rxjs';

/**
 * Три операции входа приёмника. Больше он про вошедшего ничего не отдаёт и отдать не может:
 * значение входа живёт в куке, недоступной скриптам, а срок — в самой куке и в хранилище.
 *
 * `withCredentials` стоит на каждом вызове: на своей машине админка поднимается своим портом, и
 * без него браузер не пошлёт куку приёмнику вовсе — экран будет выглядеть невошедшим при живом
 * входе.
 */
@Injectable({ providedIn: 'root' })
export class AuthApiService {
    readonly #http: HttpClient = inject(HttpClient);

    public signIn(pair: ISignInPair): Observable<IAdminSession> {
        return this.#http.post<IAdminSession>('/api/auth/login', pair, { withCredentials: true });
    }

    public signOut(): Observable<void> {
        return this.#http.post<void>('/api/auth/logout', {}, { withCredentials: true });
    }

    public session(): Observable<IAdminSession> {
        return this.#http.get<IAdminSession>('/api/auth/session', { withCredentials: true });
    }

    /** Ждёт ли узел первой записи. Открыто без входа: спрашивает тот, кому входить нечем. */
    public setupState(): Observable<ISetupState> {
        return this.#http.get<ISetupState>('/api/setup');
    }

    /**
     * Завести первую запись и войти ею: ответ и кука те же, что у входа. Отказ приезжает со
     * словом приёмника — пустое поле, закрытый экран, — и разбирается тем же разбором, что отказ
     * правки человека.
     */
    public setUp(pair: ISignInPair): Observable<IAdminSession> {
        return this.#http
            .post<IAdminSession>('/api/setup', pair, { withCredentials: true })
            .pipe(timeout(READ_TIMEOUT_MS), catchError(asSpokenFault));
    }
}
