import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { ICaller } from '@rt-tools/auth-contract';

import { REQUEST_CALLER } from './auth.tokens.js';

/** The caller the guard accepted; `undefined` on an operation open to everyone. */
export function callerOfRequest(request: object): ICaller | undefined {
    const caller: unknown = Reflect.get(request, REQUEST_CALLER);
    return caller === undefined ? undefined : (caller as ICaller);
}

/** A handler parameter that receives the caller the guard accepted. */
export const CurrentCaller: () => ParameterDecorator = createParamDecorator(
    (_data: unknown, context: ExecutionContext): ICaller | undefined => callerOfRequest(context.switchToHttp().getRequest<object>())
);
