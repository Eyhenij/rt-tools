/** A right of the entry module: `resource:action`, kept in Keycloak as a client role. */
export type TPermission = `${string}:${string}`;

/** The two parts of a right. */
export interface IParsedPermission {
    readonly resource: string;
    readonly action: string;
}

/** Resources of one admin with their actions: `{ orders: ['read', 'write'] }`. */
export type TPermissionCatalogSource = Readonly<Record<string, readonly string[]>>;

/** Every right the catalog source declares, as a union of literal strings. */
export type TCatalogPermission<SOURCE extends TPermissionCatalogSource> = {
    [RESOURCE in keyof SOURCE & string]: `${RESOURCE}:${SOURCE[RESOURCE][number]}`;
}[keyof SOURCE & string];

const PART: string = '[a-z0-9]+(?:-[a-z0-9]+)*';
const PERMISSION: RegExp = new RegExp(`^(${PART}):(${PART})$`);

/**
 * Whether the value is a right: two non-empty parts of lowercase letters, digits and dashes
 * joined by one colon. A role made by hand in the console with a space or a second colon is not.
 */
export function isPermission(value: unknown): value is TPermission {
    return typeof value === 'string' && PERMISSION.test(value);
}

/** The two parts of a right, or `null` when the string is not one. */
export function parsePermission(value: string): IParsedPermission | null {
    const match: RegExpExecArray | null = PERMISSION.exec(value);
    if (!match) {
        return null;
    }
    return { resource: match[1], action: match[2] };
}

/**
 * The catalog of one admin: every right `resource:action` once, in the order declared. The checks
 * of the client and the server take rights from here, and the server sends the same list to
 * Keycloak, so a right typed by hand in one place cannot differ from the one in the other.
 *
 * A part outside the shape of a right is a mistake in code, so it throws at the start of the
 * application rather than reaching Keycloak.
 */
export function definePermissions<const SOURCE extends TPermissionCatalogSource>(source: SOURCE): readonly TCatalogPermission<SOURCE>[] {
    const rights: Set<string> = new Set<string>();
    for (const [resource, actions] of Object.entries(source)) {
        for (const action of actions) {
            const right: string = `${resource}:${action}`;
            if (!isPermission(right)) {
                throw new Error(`«${right}» is not a right: two parts of lowercase letters, digits and dashes joined by one colon`);
            }
            rights.add(right);
        }
    }
    return [...rights] as TCatalogPermission<SOURCE>[];
}
