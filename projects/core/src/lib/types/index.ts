export * from './dictionary.interface';
export * from './primitive.type';

/**
 * @description `Nullable` lives in `@rt-tools/utils`, which carries no framework dependency.
 * Re-exported here so existing imports from `@rt-tools/core` keep resolving.
 */
export type { Nullable } from '@rt-tools/utils';
