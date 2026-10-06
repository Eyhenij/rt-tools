import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, Observable, switchMap, throwError } from 'rxjs';

import { RtAuthService } from './auth.service';

function withToken(request: HttpRequest<unknown>, auth: RtAuthService, token: string | null): HttpRequest<unknown> {
    return token === null ? request : request.clone({ setHeaders: auth.requestHeaders(token) });
}

function isUnauthorized(error: unknown): boolean {
    return error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized;
}

/** The second and last try after a 401: a fresh token, or the entry when there is none. */
function repeatOnce(
    request: HttpRequest<unknown>,
    next: HttpHandlerFn,
    auth: RtAuthService,
    error: unknown
): Observable<HttpEvent<unknown>> {
    return from(auth.refresh()).pipe(
        switchMap((fresh: string | null): Observable<HttpEvent<unknown>> => {
            if (fresh === null) {
                void auth.login();
                return throwError((): unknown => error);
            }
            return next(withToken(request, auth, fresh));
        }),
        catchError((second: unknown): Observable<HttpEvent<unknown>> => {
            if (second !== error && isUnauthorized(second)) {
                void auth.login();
            }
            return throwError((): unknown => second);
        })
    );
}

/**
 * Puts the token and the current organization on a request to a recipient of the token.
 *
 * An answer 401 refreshes the token and repeats the request once. A second 401 or a failed
 * refresh sends the person to the entry, and the request ends with the error.
 */
export const rtAuthInterceptor: HttpInterceptorFn = (
    request: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const auth: RtAuthService = inject(RtAuthService);
    if (!auth.isRecipient(request.url)) {
        return next(request);
    }
    return from(auth.token()).pipe(
        switchMap((token: string | null): Observable<HttpEvent<unknown>> => next(withToken(request, auth, token))),
        catchError((error: unknown): Observable<HttpEvent<unknown>> =>
            isUnauthorized(error) ? repeatOnce(request, next, auth, error) : throwError((): unknown => error)
        )
    );
};
