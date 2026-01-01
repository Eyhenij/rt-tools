import { AnyObject } from './basic.types';

export type Scriptable<T, TContext> = T | ((ctx: TContext, options: AnyObject) => T | undefined);
export type ScriptableOptions<T, TContext> = { [P in keyof T]: Scriptable<T[P], TContext> };
export type ScriptableAndScriptableOptions<T, TContext> = Scriptable<T, TContext> | ScriptableOptions<T, TContext>;
export type ScriptableAndArray<T, TContext> = readonly T[] | Scriptable<T, TContext>;
export type ScriptableAndArrayOptions<T, TContext> = { [P in keyof T]: ScriptableAndArray<T[P], TContext> };
