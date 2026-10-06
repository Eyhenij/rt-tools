import { definePermissions, TPermission } from '@rt-tools/auth-contract';

/** Every right of the example: the client roles of `rt-example-admin` in the realm. */
export const EXAMPLE_RIGHTS: readonly TPermission[] = definePermissions({ example: ['read', 'write'] });
