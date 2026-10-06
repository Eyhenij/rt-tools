/**
 * The example of the entry module: `apps/auth-example-api` and `apps/auth-example-admin`.
 *
 * The example connects the packages of the module the way an application does, and nothing
 * else: a lib of the receiver in it would check what the packages do not carry.
 */
const PACKAGE = 'scope:package';

export const authExampleBoundaries = [
    { sourceTag: 'scope:auth-example-api-app', onlyDependOnLibsWithTags: [PACKAGE] },
    { sourceTag: 'scope:auth-example-admin-app', onlyDependOnLibsWithTags: [PACKAGE] },
];
