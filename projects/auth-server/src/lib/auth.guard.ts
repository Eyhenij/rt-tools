import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { hasPermission, ICaller } from '@rt-tools/auth-contract';

import { accessDeclarationsOf, TAccess } from './access';
import { AUTH_TOKEN_VERIFIER, REQUEST_CALLER } from './auth.tokens';
import type { KeycloakTokenVerifier } from './token-verifier';

/** The request as the guard reads it: the headers and the place for the caller. */
interface IAuthRequest {
    headers: Record<string, string | string[] | undefined>;
    [REQUEST_CALLER]?: ICaller;
}

/**
 * The only access check of an admin server. **Closed by default.**
 *
 * Two refusals, told apart by the question: no accepted token is «not signed in» (401) and is
 * cured by signing in; a token without the right is «not allowed» (403) and is not. Neither names
 * the missing right or what in the token did not match.
 */
@Injectable()
export class AuthGuard implements CanActivate {
    readonly #verifier: KeycloakTokenVerifier;

    constructor(@Inject(AUTH_TOKEN_VERIFIER) verifier: KeycloakTokenVerifier) {
        this.#verifier = verifier;
    }

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const declared: readonly TAccess[] = accessDeclarationsOf(context.getHandler());
        if (declared.length !== 1) {
            // The start audit stops such an application; a handler that slipped past it is refused
            // rather than opened by a guess.
            throw new UnauthorizedException();
        }
        const access: TAccess = declared[0];
        if (access.kind === 'public') {
            return true;
        }
        const request: IAuthRequest = context.switchToHttp().getRequest<IAuthRequest>();
        const header: string | string[] | undefined = request.headers['authorization'];
        const caller: ICaller | null = await this.#verifier.callerOf(typeof header === 'string' ? header : null);
        if (!caller) {
            throw new UnauthorizedException();
        }
        if (access.kind === 'permission' && !hasPermission(caller, access.permission)) {
            throw new ForbiddenException();
        }
        request[REQUEST_CALLER] = caller;
        return true;
    }
}
