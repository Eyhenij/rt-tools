import { hasEveryPermission, hasSomePermission, ICaller, TPermission } from '@rt-tools/auth-contract';

/** The rights a route or a block needs, with the word whether all or any of them are needed. */
export type TRtPermissionRequirement = { readonly every: readonly TPermission[] } | { readonly some: readonly TPermission[] };

/** Whether the caller meets the requirement. Nobody signed in meets nothing. */
export function meetsRequirement(caller: ICaller | null, requirement: TRtPermissionRequirement): boolean {
    if (caller === null) {
        return false;
    }
    return 'every' in requirement ? hasEveryPermission(caller, requirement.every) : hasSomePermission(caller, requirement.some);
}
