import { inject } from '@angular/core';
import { Code, ConnectError, Interceptor, StreamRequest, StreamResponse, UnaryRequest, UnaryResponse } from '@connectrpc/connect';
import { RtAuthService } from '@rt-tools/auth-angular';

type TConnectRequest = UnaryRequest | StreamRequest;
type TConnectResponse = UnaryResponse | StreamResponse;
type TConnectNext = (request: TConnectRequest) => Promise<TConnectResponse>;

function applyToken(request: TConnectRequest, auth: RtAuthService, token: string | null): void {
    if (token === null) {
        return;
    }
    for (const [name, value] of Object.entries(auth.requestHeaders(token))) {
        request.header.set(name, value);
    }
}

function isUnauthenticated(error: unknown): boolean {
    return ConnectError.from(error).code === Code.Unauthenticated;
}

async function repeat(next: TConnectNext, request: TConnectRequest, auth: RtAuthService, error: unknown): Promise<TConnectResponse> {
    const fresh: string | null = await auth.refresh();
    if (fresh === null) {
        void auth.login();
        throw error;
    }
    applyToken(request, auth, fresh);
    try {
        return await next(request);
    } catch (second: unknown) {
        if (isUnauthenticated(second)) {
            void auth.login();
        }
        throw second;
    }
}

/**
 * The interceptor of a Connect transport, called in an injection context:
 *
 * ```ts
 * createConnectTransport({ baseUrl, interceptors: [rtAuthConnectInterceptor()] })
 * ```
 *
 * It puts the token and the current organization on a call to a recipient of the token. A refusal
 * Unauthenticated refreshes the token and repeats a unary call once; a second refusal or a failed
 * refresh sends the person to the entry. A streaming call is not repeated: its messages are gone.
 */
export function rtAuthConnectInterceptor(): Interceptor {
    const auth: RtAuthService = inject(RtAuthService);
    return (next: TConnectNext): TConnectNext =>
        async (request: TConnectRequest): Promise<TConnectResponse> => {
            if (!auth.isRecipient(request.url)) {
                return next(request);
            }
            applyToken(request, auth, await auth.token());
            try {
                return await next(request);
            } catch (error: unknown) {
                if (!isUnauthenticated(error) || request.stream) {
                    throw error;
                }
                return repeat(next, request, auth, error);
            }
        };
}
