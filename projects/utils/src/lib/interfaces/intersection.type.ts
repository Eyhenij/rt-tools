export type IntersectionType<T extends object, M extends object> = keyof T & keyof M;
