import 'reflect-metadata';

import { TPermission } from '@rt-tools/auth-contract';

/**
 * What an operation is open to. Every operation declares exactly one: the start audit refuses an
 * operation that declares none or two, so a forgotten declaration never opens anything.
 */
export type TAccess =
    /** Open to everyone, without a token. */
    | { readonly kind: 'public' }
    /** Open to anyone with an accepted token. */
    | { readonly kind: 'signed-in' }
    /** Open to a caller with the right. */
    | { readonly kind: 'permission'; readonly permission: TPermission };

/** The key the declarations of a handler lie under: a list, so a second one is seen, not lost. */
export const ACCESS_DECLARATIONS: string = 'rt-tools.auth.access';

/** The declarations of a handler, in the order written. */
export function accessDeclarationsOf(handler: object): readonly TAccess[] {
    const declared: unknown = Reflect.getMetadata(ACCESS_DECLARATIONS, handler);
    return Array.isArray(declared) ? (declared as TAccess[]) : [];
}

function declare(access: TAccess): MethodDecorator {
    return (_target: object, _key: string | symbol, descriptor: PropertyDescriptor): void => {
        const handler: object = descriptor.value as object;
        Reflect.defineMetadata(ACCESS_DECLARATIONS, [...accessDeclarationsOf(handler), access], handler);
    };
}

/* eslint-disable sonarjs/function-name -- decorator factories are named with a capital letter: so the framework names them, and so they read at the place of use */

/** The operation is open to everyone, without a token. */
export function PublicOperation(): MethodDecorator {
    return declare({ kind: 'public' });
}

/** The operation is open to anyone with an accepted token. */
export function SignedInOperation(): MethodDecorator {
    return declare({ kind: 'signed-in' });
}

/** The operation is open to a caller with the right. */
export function PermittedOperation(permission: TPermission): MethodDecorator {
    return declare({ kind: 'permission', permission });
}

/* eslint-enable sonarjs/function-name */
