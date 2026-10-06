import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';

import { accessDeclarationsOf } from './access';

/** A class whose prototype holds the route handlers. */
export type TControllerClass = abstract new (...args: never[]) => object;

function isRoute(handler: object): boolean {
    return Reflect.getMetadata(PATH_METADATA, handler) !== undefined && Reflect.getMetadata(METHOD_METADATA, handler) !== undefined;
}

/**
 * The route handlers of the controllers that declare no access or more than one, as
 * `Controller.method — none` / `— 2`.
 *
 * A handler is a prototype method with a route mark of the framework. An empty list means every
 * handler declares exactly one access.
 */
export function undeclaredAccess(controllers: readonly TControllerClass[]): readonly string[] {
    const faults: string[] = [];
    for (const controller of controllers) {
        const prototype: object = controller.prototype as object;
        for (const name of Object.getOwnPropertyNames(prototype)) {
            const handler: unknown = Reflect.get(prototype, name);
            if (name === 'constructor' || typeof handler !== 'function' || !isRoute(handler)) {
                continue;
            }
            const count: number = accessDeclarationsOf(handler).length;
            if (count !== 1) {
                faults.push(`${controller.name}.${name} — ${count === 0 ? 'none' : String(count)}`);
            }
        }
    }
    return faults;
}

/** The refusal of the start, naming every faulty operation at once. */
export function accessAuditError(faults: readonly string[]): Error {
    const lines: string = faults.map((fault: string): string => '  ' + fault).join('\n');
    return new Error(`Every operation declares exactly one access; these do not:\n${lines}`);
}
