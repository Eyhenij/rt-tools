export type PartialOmit<T, K extends keyof T> = Omit<T, K> & Partial<T>;
