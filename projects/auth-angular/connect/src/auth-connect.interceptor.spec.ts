import { TestBed } from '@angular/core/testing';
import { Code, ConnectError, UnaryRequest, UnaryResponse } from '@connectrpc/connect';

import { claimsWith, KeycloakDouble, startAuth } from '../../src/testing/keycloak-double';
import { rtAuthConnectInterceptor } from './auth-connect.interceptor';

type TUnaryNext = (request: UnaryRequest) => Promise<UnaryResponse>;

/** A unary call to the address: the interceptor reads only the address, the kind and the headers. */
function unaryCall(url: string): UnaryRequest {
    return { url, stream: false, header: new Headers() } as Partial<UnaryRequest> as UnaryRequest;
}

const ANSWER: UnaryResponse = { stream: false } as Partial<UnaryResponse> as UnaryResponse;

async function intercepted(next: TUnaryNext): Promise<{ double: KeycloakDouble; call: TUnaryNext }> {
    const double: KeycloakDouble = new KeycloakDouble();
    double.signIn(claimsWith(['orders:read']));
    await startAuth(double);
    const call: TUnaryNext = TestBed.runInInjectionContext(rtAuthConnectInterceptor)(next as never) as TUnaryNext;
    return { double, call };
}

describe('rtAuthConnectInterceptor', () => {
    it('SC-AUTH-32 — an answer Unauthenticated of Connect is repeated once', async () => {
        const tokens: (string | null)[] = [];
        const { double, call } = await intercepted(async (request: UnaryRequest): Promise<UnaryResponse> => {
            tokens.push(request.header.get('Authorization'));
            if (tokens.length === 1) {
                throw new ConnectError('expired', Code.Unauthenticated);
            }
            return ANSWER;
        });

        await call(unaryCall('/api/orders.v1.OrderService/List'));

        expect(tokens).toEqual(['Bearer token-1', 'Bearer token-2']);
        expect(double.loginCalls).toHaveLength(0);
    });

    it('SC-AUTH-32 — a second refusal sends the person to the entry', async () => {
        const next: jest.Mock<Promise<UnaryResponse>, []> = jest.fn(async (): Promise<UnaryResponse> => {
            throw new ConnectError('expired', Code.Unauthenticated);
        });
        const { double, call } = await intercepted(next);

        await expect(call(unaryCall('/api/orders.v1.OrderService/List'))).rejects.toMatchObject({ code: Code.Unauthenticated });
        expect(next).toHaveBeenCalledTimes(2);
        expect(double.loginCalls).toHaveLength(1);
    });

    it('SC-AUTH-28 — a call to a foreign address carries no token', async () => {
        const headers: boolean[] = [];
        const { call } = await intercepted(async (request: UnaryRequest): Promise<UnaryResponse> => {
            headers.push(request.header.has('Authorization'));
            return ANSWER;
        });

        await call(unaryCall('https://foreign.test/svc/Method'));

        expect(headers).toEqual([false]);
    });
});
