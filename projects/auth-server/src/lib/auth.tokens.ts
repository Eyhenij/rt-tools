/** The token check of the admin, provided by the module. */
export const AUTH_TOKEN_VERIFIER: unique symbol = Symbol('rt-tools.auth.token-verifier');

/** The options the module was configured with. */
export const AUTH_SERVER_OPTIONS: unique symbol = Symbol('rt-tools.auth.options');

/** The field of the request the guard puts the caller into. */
export const REQUEST_CALLER: unique symbol = Symbol('rt-tools.auth.caller');
