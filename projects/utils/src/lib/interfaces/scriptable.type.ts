import { TAnyObject } from './basic.types.js';

export type TScriptable<T, TContext> = T | ((ctx: TContext, options: TAnyObject) => T | undefined);
export type TScriptableOptions<T, TContext> = { [P in keyof T]: TScriptable<T[P], TContext> };
export type TScriptableAndScriptableOptions<T, TContext> = TScriptable<T, TContext> | TScriptableOptions<T, TContext>;
export type TScriptableAndArray<T, TContext> = readonly T[] | TScriptable<T, TContext>;
export type TScriptableAndArrayOptions<T, TContext> = { [P in keyof T]: TScriptableAndArray<T[P], TContext> };
