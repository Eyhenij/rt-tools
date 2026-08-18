/** Makes selected props from a record optional */
export type TOptional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
