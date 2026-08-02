export type IPartialOmit<T, K extends keyof T> = Omit<T, K> & Partial<T>;
