import { IAnyObject } from './basic.types.js';

export type IScriptable<T, TContext> = T | ((ctx: TContext, options: IAnyObject) => T | undefined);
export type IScriptableOptions<T, TContext> = { [P in keyof T]: IScriptable<T[P], TContext> };
export type IScriptableAndScriptableOptions<T, TContext> = IScriptable<T, TContext> | IScriptableOptions<T, TContext>;
export type IScriptableAndArray<T, TContext> = readonly T[] | IScriptable<T, TContext>;
export type IScriptableAndArrayOptions<T, TContext> = { [P in keyof T]: IScriptableAndArray<T[P], TContext> };
