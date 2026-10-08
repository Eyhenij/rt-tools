import { Code, ConnectError, createContextKey, ContextKey, Interceptor, UnaryRequest, StreamRequest } from '@connectrpc/connect';

import { hasPermission, ICaller } from '@rt-tools/auth-contract';

import { TAccess } from './access.js';
import { KeycloakTokenVerifier } from './token-verifier.js';

/** The part of a Connect service description the access map is checked against. */
export interface IConnectServiceLike {
    readonly typeName: string;
    readonly methods: readonly { readonly name: string; readonly localName: string }[];
}

/** The access of every method of one service, keyed by the local method name. */
export type TConnectServiceAccess<SERVICE extends { readonly method: object }> = { readonly [METHOD in keyof SERVICE['method']]: TAccess };

/** The caller the interceptor accepted, read by a procedure from its context values. */
export const CONNECT_CALLER: ContextKey<ICaller | null> = createContextKey<ICaller | null>(null, { description: 'rt-tools.auth.caller' });

/**
 * The accesses of one service as entries `typeName/MethodName`, checked against its description.
 *
 * Every method declares exactly one access, and a key that names no method is refused too: both
 * would otherwise show only to the person who calls the method.
 */
export function connectAccessEntries(
    service: IConnectServiceLike,
    access: Readonly<Record<string, TAccess>>
): readonly [string, TAccess][] {
    const names: Set<string> = new Set(service.methods.map((method: { localName: string }): string => method.localName));
    const missing: string[] = [...names].filter((name: string): boolean => !(name in access));
    const unknown: string[] = Object.keys(access).filter((name: string): boolean => !names.has(name));
    if (missing.length || unknown.length) {
        throw new Error(
            `Every method of ${service.typeName} declares exactly one access; missing: ${missing.join(', ') || 'none'}; unknown: ${unknown.join(', ') || 'none'}`
        );
    }
    return service.methods.map((method: { name: string; localName: string }): [string, TAccess] => [
        `${service.typeName}/${method.name}`,
        access[method.localName],
    ]);
}

/**
 * The Connect interceptor of an admin server: the same token check as the NestJS guard, and the
 * same two refusals — `unauthenticated` and `permission_denied` — without naming the right.
 *
 * A method the map does not name is refused: the map is closed by default, as the guard is.
 */
export function createAuthInterceptor(verifier: KeycloakTokenVerifier, entries: readonly (readonly [string, TAccess])[]): Interceptor {
    const accessOf: Map<string, TAccess> = new Map(entries);
    return (next: Parameters<Interceptor>[0]) => async (request: UnaryRequest | StreamRequest) => {
        const access: TAccess | undefined = accessOf.get(`${request.method.parent.typeName}/${request.method.name}`);
        if (!access) {
            throw new ConnectError('unauthenticated', Code.Unauthenticated);
        }
        if (access.kind !== 'public') {
            const caller: ICaller | null = await verifier.callerOf(request.header.get('authorization'));
            if (!caller) {
                throw new ConnectError('unauthenticated', Code.Unauthenticated);
            }
            if (access.kind === 'permission' && !hasPermission(caller, access.permission)) {
                throw new ConnectError('permission denied', Code.PermissionDenied);
            }
            request.contextValues.set(CONNECT_CALLER, caller);
        }
        return next(request);
    };
}
