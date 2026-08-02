/** Makes selected props from a record optional */
export type IOptional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
