export type TPartialOmit<T, K extends keyof T> = Omit<T, K> & Partial<T>;
