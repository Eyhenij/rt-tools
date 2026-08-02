export type IIntersectionType<T extends object, M extends object> = keyof T & keyof M;
